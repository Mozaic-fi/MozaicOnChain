// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.18;

// Libraries
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";


import "../../interfaces/vaults/IPlugin.sol";
import "../../interfaces/vaults/IVaultLocker.sol";
import "../../interfaces/lifi/ICalldataVerificationFacet.sol";
import "../TokenPriceConsumer.sol";


contract Vault is Ownable, ERC20, ERC20Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Constant representing the number of decimals for the MOZAIC token.
    uint256 public constant MOZAIC_DECIMALS = 6;

    // Constant representing the number of decimals for the ASSET.
    uint256 public constant ASSET_DECIMALS = 36;

    // A constant representing the denominator for basis points (BP). Used for percentage calculations.
    uint256 public constant BP_DENOMINATOR = 1e4;

    // A constant representing the maximum fee percentage allowed (1000 basis points or 10% in this case).
    uint256 public constant MAX_FEE = 1e3;

    // The Address of lifi contract
    address public constant LIFI_CONTRACT = 0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE;

    // Struct defining the properties of a Plugin.
    struct Plugin {
        address pluginAddress;  // Address of the plugin contract.
        uint8 pluginId;       // Unique identifier for the plugin.
    }
    
    /* ========== STATE VARIABLES ========== */
    // Stores the address of the master contract.
    address public master;

    // Stores the address of the contract admin.
    address public admin;

    // Stores the address of the treasury, which is payable for receiving funds.
    address payable public treasury;

    // Stores the address of the token price consumer contract.
    address public tokenPriceConsumer;

    // Maps plugin IDs to their respective index.
    mapping(uint8 => uint256) public pluginIdToIndex;

    // An array to store instances of the Plugin struct.
    Plugin[] public plugins;

    // Maps token addresses to boolean values indicating whether the token is accepted.
    mapping(address => bool) public acceptedTokenMap;

    // An array of accepted token addresses.
    address[] public acceptedTokens;

    // Maps token addresses to boolean values indicating whether deposits are allowed for the token.
    mapping(address => bool) public depositAllowedTokenMap;

    // An array of token addresses for which deposits are allowed.
    address[] public depositAllowedTokens;

    // Stores the ID of the currently selected plugin.
    uint8 public selectedPluginId;

    // Stores the ID of the currently selected pool.
    uint8 public selectedPoolId;

    // An array of addresses representing users who can lock assets in the vault.
    address[] public vaultLockers;

    // An array of addresses representing managers who have control over the vault.
    address[] public vaultManagers;

    // A rate used to convert LP (Liquidity Provider) tokens to a standard decimal format (18 decimals in this case).
    uint256 public lpRate = 1e18;

    // The percentage of fees collected by the protocol for each transaction.
    uint256 public protocolFeePercentage;

    // The total protocol fee held in the vault.
    uint256 public protocolFeeInVault;

    // The minimum execution fee required when depositing funds into the vault.
    uint256 public depositMinExecFee;

    // The minimum execution fee required when withdrawing funds from the vault.
    uint256 public withdrawMinExecFee;

    struct lifiWhiteListReceiver {
        uint256 chainId;
        bool isWhiteListed;
    }
    // The list of addresses that can receive funds from the vault via lifi bridge.
    mapping(address => lifiWhiteListReceiver) public lifiReceiverWhiteList;


    /* ========== EVENTS ========== */
    event AddPlugin(uint8 _pluginId, address _pluginAddress);
    event RemovePlugin(uint8 _pluginId);
    event Execute(uint8 _pluginId, IPlugin.ActionType _actionType, bytes _payload);
    event MasterUpdated(address _oldMaster, address _newMaster);
    event AdminUpdated(address _oldAdmin, address _newAdmin);
    event TokenPriceConsumerUpdated(address _oldTokenPriceConsumer, address _newTokenPriceConsumer);
    event SetTreasury(address payable treasury);
    event SetProtocolFeePercentage(uint256 _protocolFeePercentage);
    event SetExecutionFee(uint256 _depositMinExecFee, uint256 _withdrawMinExecFee);
    event SetVaultLockers(address[] _vaultLockers);
    event SetVaultManagers(address[] _vaultManagers);
    event UpdateLiquidityProviderRate(uint256 _previousRate, uint256 _lpRate);
    event AddAcceptedToken(address _token);
    event RemoveAcceptedToken(address _token);
    event AddDepositAllowedToken(address _token);
    event RemoveDepositAllowedToken(address _token);
    event AddDepositRequest(address _token, uint256 _amount);
    event AddWithdrawalRequest(uint256 _lpAmount, uint8 _pluginId, uint8 _poolId, address _receiver);
    event SelectPluginAndPool(uint8 _pluginId, uint8 _poolId);
    event ApproveTokens(uint8 _pluginId, address[] _tokens, uint256[] _amounts);
    event WithdrawProtocolFee(address _token, uint256 _amount);
    event StakeToSelectedPool(uint8 _selectedPluginId, uint8 _selectedPoolId, address _token, uint256 _tokenAmount);
    event SetLifiReceiverWhiteList(address _receiver, uint256 _chaindId, bool _status);


    /* ========== MODIFIERS ========== */
    // Modifier allowing only the master contract to execute the function.
    modifier onlyMaster() {
        require(msg.sender == master, "Vault: caller must be master");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Vault: caller must be admin");
        _;
    }


    // Modifier allowing only the vault lockers to execute the function.
    modifier onlyVaultLockers() {
        bool isVaultLocker = false;
        for(uint256 i  = 0; i < vaultLockers.length; i++) {
            if(vaultLockers[i] == msg.sender) {
                isVaultLocker = true;
                break;
            }
        }
        require(isVaultLocker, "Vault: Invalid vault locker");
        _;
    }

    // Modifier allowing only the vault managers to execute the function.
    modifier onlyVaultManagers() {
        bool isVaultManager = false;
        for(uint256 i  = 0; i < vaultManagers.length; i++) {
            if(vaultManagers[i] == msg.sender) {
                isVaultManager = true;
                break;
            }
        }
        require(isVaultManager, "Vault: Invalid vault manager");
        _;
    }

    /* ========== CONFIGURATION ========== */
    // Constructor for the Mozaic Theseus LPToken contract, inheriting from ERC20.
    constructor(address _master,address _admin, address _tokenPriceConsumer, address payable _treasury) ERC20("Mozaic Theseus LP", "MOZ-THE-LP") Ownable(msg.sender){
        require(_master != address(0), "Vault: Invalid Address");
        require(_admin != address(0), "Vault: Invalid Address");
        require(_tokenPriceConsumer != address(0), "Vault: Invalid Address");
        require(_treasury != address(0), "Vault: Invalid Address");

        master = _master;
        tokenPriceConsumer = _tokenPriceConsumer;
        treasury = _treasury;
        admin = _admin;

        lifiReceiverWhiteList[address(this)] = lifiWhiteListReceiver(block.chainid, true);

        lifiReceiverWhiteList[treasury] = lifiWhiteListReceiver(block.chainid, true);
    }

    // Allows the owner to set a new master address for the Vault.
    function setMaster(address _newMaster) external onlyOwner {
        // Ensure that the new master address is valid.
        require(_newMaster != address(0), "Vault: Invalid Address");

        // Store the current master address before updating.
        address _oldMaster = master;

        // Update the master address to the new value.
        master = _newMaster;

        // Emit an event to log the master address update.
        emit MasterUpdated(_oldMaster, _newMaster);
    }

    // Allows the owner to set a new admin address for the Vault.
    function setAdmin(address _newAdmin) external onlyOwner {
        // Ensure that the new admin address is valid.
        require(_newAdmin != address(0), "Vault: Invalid Address");

        // Store the current admin address before updating.
        address _oldAdmin = admin;

        // Update the admin address to the new value.
        admin = _newAdmin;

        // Emit an event to log the admin address update.
        emit MasterUpdated(_oldAdmin, _newAdmin);
    }

    // Allows the owner to set the address of the token price consumer contract.
    function setTokenPriceConsumer(address _tokenPriceConsumer) public onlyOwner {
        // Ensure that the new token price consumer address is valid.
        require(_tokenPriceConsumer != address(0), "Vault: Invalid Address");

        // Store the current token price consumer address before updating.
        address _oldTokenPriceConsumer = tokenPriceConsumer;

        // Update the token price consumer address to the new value.
        tokenPriceConsumer = _tokenPriceConsumer;

        // Emit an event to log the token price consumer address update.
        emit TokenPriceConsumerUpdated(_oldTokenPriceConsumer, _tokenPriceConsumer);
    }

    // Allows the owner to set the address of the treasury.
    function setTreasury(address payable _treasury) public onlyOwner {
        // Ensure that the new treasury address is valid.
        require(_treasury != address(0), "Vault: Invalid address");

        // Update the treasury address to the new value.
        treasury = _treasury;

        // Emit an event to log the treasury address update.
        emit SetTreasury(_treasury);
    }

    // Allows the owner to whitelist/remove from whitelist addresses that can receive funds from the vault via lifi bridge.
    function setLifiReceiverWhiteList(address _receiver,uint256 _chaindId, bool _status) public onlyOwner {
        lifiReceiverWhiteList[_receiver] = lifiWhiteListReceiver(_chaindId, _status);
        emit SetLifiReceiverWhiteList(_receiver, _chaindId, _status);
    }

    // Allows the master contract to select a plugin and pool.
    function selectPluginAndPool(uint8 _pluginId, uint8 _poolId) onlyAdmin public {
        // Set the selectedPluginId and selectedPoolId to the provided values.
        selectedPluginId = _pluginId;
        selectedPoolId = _poolId;
        emit SelectPluginAndPool(_pluginId, _poolId);
    }

    // Sets the execution fees for deposit and withdrawal transactions.
    function setExecutionFee(uint256 _depositMinExecFee, uint256 _withdrawMinExecFee) public onlyAdmin {
        // Set the deposit minimum execution fee
        depositMinExecFee = _depositMinExecFee;

        // Set the withdrawal minimum execution fee
        withdrawMinExecFee = _withdrawMinExecFee;

        // Emit an event to log the changes in execution fees
        emit SetExecutionFee(_depositMinExecFee, _withdrawMinExecFee);
    }


    // Allows the owner to add a new accepted token.
    function addAcceptedToken(address _token) external onlyOwner {
        // Check if the token does not already exist in the accepted tokens mapping.
        if (acceptedTokenMap[_token] == false) {
            // Set the token as accepted, add it to the acceptedTokens array, and emit an event.
            acceptedTokenMap[_token] = true;
            acceptedTokens.push(_token);
            emit AddAcceptedToken(_token);
        } else {
            // Revert if the token already exists in the accepted tokens.
            revert("Vault: Token already exists.");
        }
    }

    // Allows the owner to remove an accepted token.
    function removeAcceptedToken(address _token) external onlyOwner {
        // Check if the token exists in the accepted tokens mapping.
        if (acceptedTokenMap[_token] == true) {
            // Set the token as not accepted, remove it from the acceptedTokens array, and emit an event.
            acceptedTokenMap[_token] = false;
            for (uint256 i = 0; i < acceptedTokens.length; ++i) {
                if (acceptedTokens[i] == _token) {
                    acceptedTokens[i] = acceptedTokens[acceptedTokens.length - 1];
                    acceptedTokens.pop();
                    emit RemoveAcceptedToken(_token);
                    return;
                }
            }
        }
        // Revert if the token does not exist in the accepted tokens.
        revert("Vault: Non-accepted token.");
    }

    // Allows the owner to add a new deposit allowed token.
    function addDepositAllowedToken(address _token) external onlyOwner {
        // Check if the token does not already exist in the deposit allowed tokens mapping.
        if (depositAllowedTokenMap[_token] == false) {
            // Set the token as allowed for deposit, add it to the depositAllowedTokens array, and emit an event.
            depositAllowedTokenMap[_token] = true;
            depositAllowedTokens.push(_token);
            emit AddDepositAllowedToken(_token);
        } else {
            // Revert if the token already exists in the deposit allowed tokens.
            revert("Vault: Token already exists.");
        }
    }

    // Allows the owner to remove a deposit allowed token.
    function removeDepositAllowedToken(address _token) external onlyOwner {
        // Check if the token exists in the deposit allowed tokens mapping.
        if (depositAllowedTokenMap[_token] == true) {
            // Set the token as not allowed for deposit, remove it from the depositAllowedTokens array, and emit an event.
            depositAllowedTokenMap[_token] = false;
            for (uint256 i = 0; i < depositAllowedTokens.length; ++i) {
                if (depositAllowedTokens[i] == _token) {
                    depositAllowedTokens[i] = depositAllowedTokens[depositAllowedTokens.length - 1];
                    depositAllowedTokens.pop();
                    emit RemoveDepositAllowedToken(_token);
                    return;
                }
            }
        }
        // Revert if the token does not exist in the deposit allowed tokens.
        revert("Vault: Non-deposit allowed token.");
    }

    // Allows the owner to add a new plugin to the vault.
    function addPlugin(uint8 _pluginId, address _pluginAddress) external onlyOwner {
        // Ensure that the pluginId is not zero and does not already exist.
        require(_pluginId != 0, "Vault: PluginId cannot be zero");
        require(pluginIdToIndex[_pluginId] == 0, "Plugin with this ID already exists");

        // Create a new Plugin instance and add it to the plugins array.
        plugins.push(Plugin(_pluginAddress, _pluginId));
        
        // Update the mapping with the index of the added plugin.
        pluginIdToIndex[_pluginId] = plugins.length;

        // Emit an event to log the addition of a new plugin.
        emit AddPlugin(_pluginId, _pluginAddress);
    }

    // Allows the owner to remove a plugin from the vault.
    function removePlugin(uint8 _pluginId) external onlyOwner {
        // Ensure that the pluginId exists.
        require(pluginIdToIndex[_pluginId] != 0, "Plugin with this ID does not exist");

        // Get the index of the plugin in the array.
        uint256 pluginIndex = pluginIdToIndex[_pluginId] - 1;
        
        // Delete the mapping entry for the removed plugin.
        delete pluginIdToIndex[_pluginId];

        if (pluginIndex != plugins.length - 1) {
            // If the removed plugin is not the last one, replace it with the last plugin in the array.
            Plugin memory lastPlugin = plugins[plugins.length - 1];
            plugins[pluginIndex] = lastPlugin;
            pluginIdToIndex[lastPlugin.pluginId] = pluginIndex + 1;
        }

        // Remove the last element from the array.
        plugins.pop();

        // Emit an event to log the removal of a plugin.
        emit RemovePlugin(_pluginId);
    }

    // Function to set the protocol fee percentage. Only callable by the owner of the contract.
    function setProtocolFeePercentage(uint256 _protocolFeePercentage) external onlyOwner {
        // Ensure that the provided protocol fee percentage does not exceed the maximum allowed fee.
        require(_protocolFeePercentage <= MAX_FEE, "Vault: protocol fee exceeds the max fee");
        
        // Update the protocol fee percentage.
        protocolFeePercentage = _protocolFeePercentage;

        // Emit an event to log the change in protocol fee percentage.
        emit SetProtocolFeePercentage(_protocolFeePercentage);
    }

    // Function to set the addresses of users who can lock assets in the vault. Only callable by the owner.
    function setVaultLockers(address[] memory _vaultLockers) external onlyOwner {
        // Update the array of vault lockers with the provided addresses.
        vaultLockers = _vaultLockers;

        // Emit an event to log the update of vault lockers with the provided addresses.
        emit SetVaultLockers(_vaultLockers);
    }

    // Function to set the addresses of managers who have control over the vault. Only callable by the owner.
    function setVaultManagers(address[] memory _vaultManagers) external onlyOwner {
        // Update the array of vault managers with the provided addresses.
        vaultManagers = _vaultManagers;

        // Emit an event to log the update of vault managers with the provided addresses.
        emit SetVaultManagers(_vaultManagers);

    }

    /* ========== USER FUNCTIONS ========== */
    
    // Allows users to initiate a deposit request by converting tokens to LP tokens and staking them into the selected pool.
    function addDepositRequest(address _token, uint256 _tokenAmount, address _receiver, bytes memory _payload) external payable nonReentrant whenNotPaused {
        require(getVaultStatus() == true, "Vault: Vault is locked");

        require(msg.value >= depositMinExecFee, "Vault: Insufficient execution fee");

        // Ensure the deposited token is allowed for deposit in the vault.
        require(isDepositAllowedToken(_token), "Vault: Invalid token");
        
        // Update the current liquidity provider rate
        updateLiquidityProviderRate();

        // Ensure a valid and positive token amount is provided.
        require(_tokenAmount > 0, "Vault: Invalid token amount");

        // Calculate the USD value of the deposited tokens.
        uint256 amountUsd = calculateTokenValueInUsd(_token, _tokenAmount);

        require(amountUsd >= 10 ** (ASSET_DECIMALS - 2), "Invalid token amount");

        // Convert the USD value to the corresponding LP token amount.
        uint256 lpAmountToMint = convertAssetToLP(amountUsd);

        // Ensure that there is a sufficient LP amount to mint.
        require(lpAmountToMint > 0, "Vault: Insufficient amount");

        // Transfer the deposited tokens from the user to the vault.
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _tokenAmount);

        // Mint the calculated LP tokens and send them to the user.
        _mint(_receiver, lpAmountToMint);

        // Emit an event to log the deposit request.
        emit AddDepositRequest(_token, _tokenAmount);

        // Stake the minted LP tokens to the selected pool.
        stakeToSelectedPool(_token, _tokenAmount, _payload);
    }


    // Internal function to stake a specified token amount to the selected pool using the configured plugin.
    function stakeToSelectedPool(address _token, uint256 _tokenAmount, bytes memory _payload) internal {
        // Retrieve the list of allowed tokens for the selected plugin and pool.
        address[] memory allowedTokens = getTokensByPluginAndPoolId(selectedPluginId, selectedPoolId);

        // Iterate through the allowed tokens to find the matching token.
        for (uint256 i = 0; i < allowedTokens.length; i++) {
            if (allowedTokens[i] == _token) {
                // Create an array to represent token amounts, with the target token's amount set accordingly.
                uint256[] memory _amounts = new uint256[](allowedTokens.length);
                _amounts[i] = _tokenAmount;

                // Encode the payload for the 'Stake' action using the selected plugin and pool.
                bytes memory payload = abi.encode(uint8(selectedPoolId), allowedTokens, _amounts, _payload);

                // Ensure that the specified plugin exists.
                require(pluginIdToIndex[selectedPluginId] != 0, "Plugin with this ID does not exist");

                // Retrieve the plugin address based on the provided plugin ID.
                address plugin = plugins[pluginIdToIndex[selectedPluginId] - 1].pluginAddress;

                // Increase the allowance for the plugin to spend the specified token amount.
                IERC20(allowedTokens[i]).safeIncreaseAllowance(plugin, _tokenAmount);

                // Execute the specified action on the plugin with the provided payload.
                IPlugin(plugin).execute(IPlugin.ActionType.Stake, payload);
                
                emit StakeToSelectedPool(selectedPluginId, selectedPoolId, _token, _tokenAmount);
                // Exit the function after successfully staking the token.
                return;
            }
        }     
        revert("Vault: deposit token not in allowedTokens");
    }

    // Function to add a withdrawal request for a specified LP token amount from a selected pool using a specified plugin.
    function addWithdrawalRequest(uint256 _lpAmount, uint8 _pluginId, uint8 _poolId, address _receiver, bytes memory payload) external payable whenNotPaused nonReentrant{
        // Ensure that the vault is not locked before processing withdrawal requests.
        require(getVaultStatus() == true, "Vault: Vault is locked");

        // Ensure that the user has provided sufficient execution fee for the withdrawal.
        require(msg.value >= withdrawMinExecFee, "Vault: Insufficient execution fee");

        // Ensure a valid and positive LP token amount is provided for withdrawal.
        require(_lpAmount > 0, "Vault: Invalid LP token amount");

        // Update the current liquidity provider rate
        updateLiquidityProviderRate();

        // Transfer the specified amount of LP tokens from the user to the contract.
        this.transferFrom(msg.sender, address(this), _lpAmount);

        // Convert the LP token amount to its equivalent USD value.
        uint256 usdAmountToWithdraw = convertLPToAsset(_lpAmount);

        // Retrieve information about the selected pool token, including its decimals and price.
        (, uint8 poolTokenDecimals, ) = getPoolTokenInfo(_pluginId, _poolId);

        // Get the current price of the pool token.
        uint256 poolTokenPrice = getPoolTokenPrice(_pluginId, _poolId);

        // Calculate the amount of pool tokens equivalent to the USD value of the LP token withdrawal.
        uint256 poolTokenAmount = convertDecimals(usdAmountToWithdraw, 6, poolTokenDecimals) / poolTokenPrice;

        // Encode the payload for the 'Unstake' action using the specified pool and LP token details.
        bytes memory _payload = abi.encode(_poolId, poolTokenAmount, _lpAmount, _receiver, payload);

        // Ensure that the specified plugin exists.
        require(pluginIdToIndex[_pluginId] != 0, "Plugin with this ID does not exist");

        // Retrieve the plugin address based on the provided plugin ID.
        address plugin = plugins[pluginIdToIndex[_pluginId] - 1].pluginAddress;

        // Execute the 'Unstake' action on the plugin with the provided payload.
        IPlugin(plugin).execute(IPlugin.ActionType.Unstake, _payload);

        emit AddWithdrawalRequest(_lpAmount, _pluginId, _poolId,  _receiver);
    }

    // Function to get the current price of the pool token for a specified pool using a specified plugin.
    function getPoolTokenPrice(uint8 _pluginId, uint8 _poolId) public view returns (uint256) {
        // Ensure that the specified plugin exists.
        require(pluginIdToIndex[_pluginId] != 0, "Plugin with this ID does not exist");

        // Retrieve the plugin address based on the provided plugin ID.
        address plugin = plugins[pluginIdToIndex[_pluginId] - 1].pluginAddress;

        // Call the external function on the specified plugin to get the pool token price.
        int256 tokenPrice = IPlugin(plugin).getPoolTokenPrice(_poolId, true);

        // Ensure that the retrieved token price is positive.
        require(tokenPrice > 0, "Vault: Pool token price is negative.");

        // Convert the token price to an unsigned integer and return it.
        return uint256(tokenPrice);
    }

    // Function to get information about the pool token, including its address, decimals, and balance for a specified pool using a specified plugin.
    function getPoolTokenInfo(uint8 _pluginId, uint8 _poolId) public view returns (address token, uint8 decimal, uint256 balance) {
        // Ensure that the specified plugin exists.
        require(pluginIdToIndex[_pluginId] != 0, "Plugin with this ID does not exist");

        // Retrieve the plugin address based on the provided plugin ID.
        address plugin = plugins[pluginIdToIndex[_pluginId] - 1].pluginAddress;

        // Call the external function on the specified plugin to get the pool token information.
        return IPlugin(plugin).getPoolTokenInfo(_poolId);
    }

    
    /* ========== MASTER FUNCTIONS ========== */
    
    // Allows the master contract to execute actions on a specified plugin.
    function execute(uint8 _pluginId, IPlugin.ActionType _actionType, bytes memory _payload) public onlyMaster nonReentrant whenNotPaused{
        // Ensure that the specified plugin exists.
        require(pluginIdToIndex[_pluginId] != 0, "Plugin with this ID does not exist");

        // Retrieve the plugin address based on the provided plugin ID.
        address plugin = plugins[pluginIdToIndex[_pluginId] - 1].pluginAddress;

        // If the action type is 'Stake', approve tokens for staking according to the payload.
        if (_actionType == IPlugin.ActionType.Stake) {
            (, address[] memory _tokens, uint256[] memory _amounts, ) = abi.decode(_payload, (uint8, address[], uint256[], bytes));
            require(_tokens.length == _amounts.length, "Vault: Lists must have the same length");

            // Iterate through the tokens and approve them for staking.
            for (uint256 i; i < _tokens.length; ++i) {
                if (_amounts[i] > 0) {
                    IERC20(_tokens[i]).safeIncreaseAllowance(plugin, _amounts[i]);
                }
            }
        } else if (_actionType == IPlugin.ActionType.Unstake) {
            ( , , , address receiver, ) = abi.decode(_payload, (uint8, uint256, uint256, address, bytes));

            // Ensure that the receiver address is the vault itself.
            require(receiver == address(this), "Invalid receiver");
        }

        // Execute the specified action on the plugin with the provided payload.
        IPlugin(plugin).execute(_actionType, _payload);

        // Emit an event to log the execution of the plugin action.
        emit Execute(_pluginId, _actionType, _payload);
    }

    // Allows the master contract to approve tokens for a specified plugin based on the provided payload.
    function approveTokens(uint8 _pluginId, address[] memory _tokens, uint256[] memory _amounts) external onlyMaster nonReentrant whenNotPaused {
        // Ensure that the specified plugin exists.
        require(pluginIdToIndex[_pluginId] != 0, "Plugin with this ID does not exist");

        // Retrieve the plugin address based on the provided plugin ID.
        address plugin = plugins[pluginIdToIndex[_pluginId] - 1].pluginAddress;

        // Decode the payload to obtain the list of tokens and corresponding amounts to approve.
        // (address[] memory _tokens, uint256[] memory _amounts) = abi.decode(_payload, (address[], uint256[]));
        require(_tokens.length == _amounts.length, "Vault: Lists must have the same length");

        // Iterate through the tokens and approve them for the plugin.
        for (uint256 i; i < _tokens.length; ++i) {
            IERC20(_tokens[i]).safeIncreaseAllowance(plugin, _amounts[i]);
        }
        emit ApproveTokens(_pluginId, _tokens, _amounts);
    }

    // Updates the liquidity provider rate based on the current market rate.
    function updateLiquidityProviderRate() internal {
        // Store the previous liquidity provider rate
        uint256 previousRate = lpRate;
        
        // Calculate the current liquidity provider rate from external source
        uint256 currentRate = getCurrentLiquidityProviderRate();
        
        // Check if the current rate is higher than the previous rate
        if (currentRate > previousRate) {
            // Calculate the change in rate and update total profit
            uint256 deltaRate = currentRate - previousRate;
        
            // Calculate total profit in the protocol's base asset
            uint256 totalProfit = convertDecimals(deltaRate * totalSupply(), 18 + MOZAIC_DECIMALS, ASSET_DECIMALS);
            
            // Calculate protocol fee as a percentage of total profit
            uint256 protocolFee = (totalProfit * protocolFeePercentage) / (BP_DENOMINATOR);
            
            // Accumulate protocol fee in the vault
            protocolFeeInVault += protocolFee;

            // Update the liquidity provider rate
            lpRate = getCurrentLiquidityProviderRate();
        } else {
            // Update the liquidity provider rate directly
            lpRate = currentRate;
        }

        // Emit an event to log the update in liquidity provider rate
        emit UpdateLiquidityProviderRate(previousRate, lpRate);
    }

    // Withdraws protocol fees stored in the vault for a specific token.
    function withdrawProtocolFee(address _token) external onlyMaster nonReentrant whenNotPaused {
        require(isAcceptedToken(_token), "Vault: Invalid token");

        // Calculate the token amount from the protocol fee in the vault
        uint256 tokenAmount = calculateTokenAmountFromUsd(_token, protocolFeeInVault);

        // Get the token balance of this contract
        uint256 tokenBalance = IERC20(_token).balanceOf(address(this));

        // Determine the transfer amount, ensuring it doesn't exceed the token balance
        uint256 transferAmount = tokenBalance >= tokenAmount ? tokenAmount : tokenBalance;

        if(tokenAmount != 0) {        
            // Update the protocol fee in the vault after the withdrawal
            protocolFeeInVault = protocolFeeInVault - ((protocolFeeInVault * transferAmount) / (tokenAmount));

            // Safely transfer the tokens to the treasury address
            IERC20(_token).safeTransfer(treasury, transferAmount);
        }
        
        // Emit an event to log the withdrawal
        emit WithdrawProtocolFee(_token, transferAmount);
    }

    // Transfers the execution fee to the specified plugin.
    function transferExecutionFee(uint8 _pluginId, uint256 _amount) external onlyMaster nonReentrant whenNotPaused {
        // Retrieve information about the specified plugin
        Plugin memory plugin = getPlugin(_pluginId);
        
        // Check if the contract has sufficient balance for the transfer
        require(_amount <= address(this).balance, "Vault: Insufficient balance");
        
        // Attempt to transfer Ether to the plugin's address
        (bool success, ) = plugin.pluginAddress.call{value: _amount}("");
        
        // Revert if the Ether transfer to the plugin fails
        require(success, "Vault: Failed to send Ether");
    }
 
     function bridgeViaLifi(
        address _srcToken,
        uint256 _amount,
        uint256 _value,
        bool _bridge,
        bytes calldata _data
    ) external onlyMaster nonReentrant {

        if(_bridge) {
            ( , , address receiver, , uint256 destinationChainId, , ) = ICalldataVerificationFacet(LIFI_CONTRACT).extractMainParameters(_data);
            lifiWhiteListReceiver memory receiverInfo = lifiReceiverWhiteList[receiver];
            require(receiverInfo.isWhiteListed &&  receiverInfo.chainId == destinationChainId, "Vault: Lifi receiver not whitelisted");
        } else {
            ( , , address receiver, , ) = ICalldataVerificationFacet(LIFI_CONTRACT).extractGenericSwapParameters(_data);
            lifiWhiteListReceiver memory receiverInfo = lifiReceiverWhiteList[receiver];
            require(receiverInfo.isWhiteListed && receiverInfo.chainId == block.chainid, "Vault: Lifi receiver not whitelisted");
        }

        bool isNative = (_srcToken == address(0));
        if (!isNative) {           
            uint256 currentAllowance = IERC20(_srcToken).allowance(address(this), address(LIFI_CONTRACT));
            if (_amount > currentAllowance) {
                uint256 increaseAmount = _amount - currentAllowance;
                IERC20(_srcToken).safeIncreaseAllowance(address(LIFI_CONTRACT), increaseAmount);
            } else if (_amount < currentAllowance) {
                uint256 decreaseAmount = currentAllowance - _amount;
                IERC20(_srcToken).safeDecreaseAllowance(address(LIFI_CONTRACT), decreaseAmount);
            }
        }
        (bool success,) = LIFI_CONTRACT.call{value: _value}(_data);
        require(success, "Lifi: call failed");
    }

    /* ========== VIEW FUNCTIONS ========== */

    // Retrieve the array of plugins registered in the vault.
    function getPlugins() public view returns (Plugin[] memory) {
        return plugins;
    }

    // Retrieve the total count of registered plugins in the vault.
    function getPluginsCount() public view returns (uint256) {
        return plugins.length;
    }

    // Retrieve details about a specific plugin based on its unique identifier.
    function getPlugin(uint8 _pluginId) public view returns (Plugin memory) {
        // Ensure that the specified plugin exists.
        require(pluginIdToIndex[_pluginId] != 0, "Plugin with this ID does not exist");

        // Retrieve and return details about the specified plugin.
        Plugin memory plugin = plugins[pluginIdToIndex[_pluginId] - 1];
        return plugin;
    }

    // Retrieves the current liquidity provider rate.
    function getCurrentLiquidityProviderRate() public view returns(uint256) {
        uint256 _totalAssets = totalAssetInUsd() > protocolFeeInVault ? totalAssetInUsd() - protocolFeeInVault: 0;
        
        // Variable to store the current rate
        uint256 currentRate;

         // Check if total supply or total assets is zero
        if (_totalAssets <= 10 ** ASSET_DECIMALS || totalSupply() <= 10 ** MOZAIC_DECIMALS) {
            currentRate = 1e18;
        } else {
            // Convert total assets to the desired decimals
            uint256 adjustedAssets = convertDecimals(_totalAssets, ASSET_DECIMALS, MOZAIC_DECIMALS + 18);

            // Calculate the current rate
            currentRate = adjustedAssets / totalSupply();
        }
        return currentRate;
    }

    // Calculate the total value of assets held by the vault, including liquidity from registered plugins
    // and the USD value of accepted tokens held in the vault.
    function totalAssetInUsd() public view returns (uint256 _totalAsset) {
        require(getVaultStatus() == true, "Vault: Vault is locked");

        // Iterate through registered plugins to calculate their total liquidity.
        for (uint8 i; i < plugins.length; ++i) {
            _totalAsset += IPlugin(plugins[i].pluginAddress).getTotalLiquidity();
        }

        // Iterate through accepted tokens to calculate their total USD value.
        for (uint256 i; i < acceptedTokens.length; ++i) {
            // Calculate the USD value of the token based on its balance in the vault.
            _totalAsset += calculateTokenValueInUsd(acceptedTokens[i], IERC20(acceptedTokens[i]).balanceOf(address(this)));
        }

        // Return the total calculated asset value.
        return _totalAsset + 10 ** ASSET_DECIMALS;
    }

    // Check if a given token is accepted by the vault.
    function isAcceptedToken(address _token) public view returns (bool) {
        return acceptedTokenMap[_token];
    }

    // Check if a given token is allowed for deposit in the vault.
    function isDepositAllowedToken(address _token) public view returns (bool) {
        return depositAllowedTokenMap[_token];
    }

    function getAcceptedTokens() public view returns (address[] memory) {
        return acceptedTokens;
    }

    function getDepositAllowedTokens() public view returns (address[] memory) {
        return depositAllowedTokens;
    }

    // Retrieve the list of tokens allowed for a specific pool associated with a plugin.
    // Returns an array of token addresses based on the provided plugin and pool IDs.
    function getTokensByPluginAndPoolId(uint8 _pluginId, uint8 _poolId) public view returns (address[] memory) {
        // Initialize an array to store the allowed tokens for the specified pool.
        address[] memory poolAllowedTokens;

        // If the specified plugin does not exist, return an empty array.
        if (pluginIdToIndex[_pluginId] == 0) {
            return poolAllowedTokens;
        }

        // Retrieve the plugin information based on the provided plugin ID.
        Plugin memory plugin = plugins[pluginIdToIndex[_pluginId] - 1];

        // Retrieve the allowed tokens for the specified pool from the associated plugin.
        poolAllowedTokens = IPlugin(plugin.pluginAddress).getAllowedTokens(_poolId);

        // Return the array of allowed tokens for the specified pool.
        return poolAllowedTokens;
    }

    // Function to get the status of the vault, indicating whether it is locked or unlocked.
    function getVaultStatus() public view returns (bool) {
        // Initialize the status as true, assuming the vault is initially unlocked.
        bool status = true;

        // Iterate through the array of vault lockers to check their individual status.
        for(uint256 i = 0; i < vaultLockers.length; i++) {
            // Check the status of the current vault locker.
            if(IVaultLocker(vaultLockers[i]).getLockerStatus() == false) {
                // If any vault locker reports that it is locked, set the overall vault status to false and exit the loop.
                status = false;
                break;
            }
        }

        // Return the overall status of the vault.
        return status;
    }

    /* ========== HELPER FUNCTIONS ========== */

    // Calculate the USD value of a given token amount based on its price and decimals.
    function calculateTokenValueInUsd(address _tokenAddress, uint256 _tokenAmount) public view returns (uint256) {
        // Retrieve the token and price consumer decimals.
        uint256 tokenDecimals = IERC20Metadata(_tokenAddress).decimals();
        uint256 priceConsumerDecimals = TokenPriceConsumer(tokenPriceConsumer).decimals(_tokenAddress);

        // Retrieve the token price from the price consumer.
        uint256 tokenPrice = TokenPriceConsumer(tokenPriceConsumer).getTokenPrice(_tokenAddress);

        return convertDecimals(_tokenAmount * tokenPrice, tokenDecimals + priceConsumerDecimals, ASSET_DECIMALS);
    }

    // Calculate the token amount corresponding to a given USD value based on token price and decimals.
    function calculateTokenAmountFromUsd(address _tokenAddress, uint256 _tokenValueUsd) public view returns (uint256) {
        // Retrieve the token and price consumer decimals.
        uint256 tokenDecimals = IERC20Metadata(_tokenAddress).decimals();
        uint256 priceConsumerDecimals = TokenPriceConsumer(tokenPriceConsumer).decimals(_tokenAddress);

        // Convert the USD value to the desired ASSET_DECIMALS.
        uint256 normalizedValue = convertDecimals(_tokenValueUsd, ASSET_DECIMALS, tokenDecimals + priceConsumerDecimals);

        // Calculate the token amount based on the normalized value and token price.
        uint256 tokenAmount = normalizedValue / TokenPriceConsumer(tokenPriceConsumer).getTokenPrice(_tokenAddress);

        // Return the calculated token amount.
        return tokenAmount;
    }

    /* ========== CONVERT FUNCTIONS ========== */

    // Convert an amount from one decimal precision to another.
    function convertDecimals(uint256 _amount, uint256 _from, uint256 _to) public pure returns (uint256) {
        // If the source decimal precision is greater than or equal to the target, perform division.
        if (_from >= _to) {
            return _amount / 10 ** (_from - _to);
        } else {
            // If the target decimal precision is greater than the source, perform multiplication.
            return _amount * 10 ** (_to - _from);
        }
    }

    // Convert an asset amount to LP tokens based on the current total asset and total LP token supply.
    function convertAssetToLP(uint256 _amount) public view returns (uint256) {
        // If the total asset is zero, perform direct decimal conversion.
        uint256 _totalAssetInUsd = totalAssetInUsd() > protocolFeeInVault ?  totalAssetInUsd() - protocolFeeInVault : 0;
        if (_totalAssetInUsd <= 10 ** ASSET_DECIMALS || totalSupply() <= 10 ** MOZAIC_DECIMALS) {
            return convertDecimals(_amount, ASSET_DECIMALS, MOZAIC_DECIMALS);
        }
        
        // Perform conversion based on the proportion of the provided amount to the total asset.
        return (_amount * totalSupply()) / _totalAssetInUsd;
    }

    // Convert LP tokens to an equivalent asset amount based on the current total asset and total LP token supply.
    function convertLPToAsset(uint256 _amount) public view returns (uint256) {
        uint256 _totalAssetInUsd = totalAssetInUsd() > protocolFeeInVault ?  totalAssetInUsd() - protocolFeeInVault : 0;

        // If the total LP token supply is zero, perform direct decimal conversion.
        if (_totalAssetInUsd <= 10 ** ASSET_DECIMALS || totalSupply() <= 10 ** MOZAIC_DECIMALS) {
            return convertDecimals(_amount, MOZAIC_DECIMALS, ASSET_DECIMALS);
        }
        // Perform conversion based on the proportion of the provided amount to the total LP token supply.
        return (_amount * _totalAssetInUsd) / totalSupply();
    }

    // Retrieve the decimal precision of the token (MOZAIC_DECIMALS).
    function decimals() public view virtual override returns (uint8) {
        return uint8(MOZAIC_DECIMALS);
    }

    // Function to get the total supply of the LP tokens, including an additional fixed supply represented by 10^MOZAIC_DECIMALS.
    function totalSupply() public view virtual override returns (uint256) {
        // Retrieve the original total supply from the parent contract and add an additional fixed supply.
        return super.totalSupply() + 10 ** MOZAIC_DECIMALS;
    }

    // Function to burn a specified amount of LP tokens. Only callable by vault managers.
    function burnLP(uint256 _lpAmount) external onlyVaultManagers {
        // Burn the specified amount of LP tokens from the contract's balance.
        _burn(address(this), _lpAmount);
    }

    // Function to transfer a specified amount of LP tokens to a given account. Only callable by vault managers.
    function transferLP(address _account, uint256 _lpAmount) external onlyVaultManagers {
        // Transfer the specified amount of LP tokens from the contract to the target account.
        this.transfer(_account, _lpAmount);
    }

    /* ========== TREASURY FUNCTIONS ========== */
    receive() external payable {}
    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
    
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    /* ========== Pausable ========== */
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}