// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.18;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import "../../interfaces/gmx/IDepositCallbackReceiver.sol";
import "../../interfaces/gmx/IWithdrawalCallbackReceiver.sol";
import "../../interfaces/gmx/IOrderCallbackReceiver.sol";
import "../../interfaces/gmx/IGMXPlugin.sol";
import "../../interfaces/gmx/ICallbackContract.sol";
import "../../interfaces/vaults/IVault.sol";
import "../../interfaces/vaults/IVaultLocker.sol";


/**
 * @title GmxCallback
 * @dev Contract handling callbacks for deposit, withdrawal, and order execution/cancellation.
 */
contract GmxCallback is Ownable, IDepositCallbackReceiver, IWithdrawalCallbackReceiver, IOrderCallbackReceiver, ICallbackContract, IVaultLocker {
    // Structure to hold the withdrawal information associated with a key
    struct WithdrawalInfo {
        uint256 lpAmount;
        address receiver;
    }

    // Configuration struct for the contract
    struct Config {
        address vault;
        address gmxPlugin;
    }

    // Mapping to store withdrawal data for each key
    mapping(bytes32 => WithdrawalInfo) public withdrawalData;

    // Configuration state
    Config public config;

    // Arrays to store keys for deposit, withdrawal, and order operations
    bytes32[] public depositKeys;
    bytes32[] public withdrawalKeys;
    bytes32[] public orderKeys;

    // Handlers for deposit, withdrawal, and order operations
    address public depositHandler;
    address public withdrawalHandler;
    address public orderHandler;

    event SetConfig(address _vault, address _gmxPlugin);
    event SetHandler(address _depositHandler, address _withdrawalHandler, address _orderHandler);
    event AddKey(bytes32 _key, State stateOption);
    event AddWithdrawalData(bytes32 _withdrawalKey, uint256 _lpAmount, address _receiver);
    event RemoveKey(bytes32 _key, State _stateOption);
    event AfterDepositExecution(bytes32 _key);
    event AfterDepositCancellation(bytes32 _key);
    event AfterWithdrawalExecution(bytes32 _key);
    event AfterWithdrawalCancellation(bytes32 _key);
    event AfterOrderExecution(bytes32 _key);
    event AfterOrderCancellation(bytes32 _key);
    event AfterOrderFrozen(bytes32 _key);

    // Modifier to restrict access to the GMX plugin only
    modifier onlyGmxPlugin() {
        require(msg.sender == config.gmxPlugin, "Invalid caller");
        _;
    }

    // Modifier to restrict access to specific handlers (deposit, withdrawal, order)
    modifier onlyHandler(State stateOption) {
        address handler;
        if (stateOption == State.Deposit) {
            handler = depositHandler;
        } else if (stateOption == State.Withdrawal) {
            handler = withdrawalHandler;
        } else if (stateOption == State.Order) {
            handler = orderHandler;
        } else {
            revert("Invalid state");
        }
        require(msg.sender == handler, "Invalid caller");
        _;
    }

    /**
     * @dev Constructor to initialize the contract with the vault and GMX plugin addresses.
     * @param _vault Address of the vault.
     * @param _gmxPlugin Address of the GMX plugin.
     */
    constructor(address _vault, address _gmxPlugin) Ownable(msg.sender) {
        config = Config({
            vault: _vault,
            gmxPlugin: _gmxPlugin
        });
    }

    /**
     * @dev Updates the vault and GMX plugin addresses in the contract configuration.
     * @param _vault New address of the vault.
     * @param _gmxPlugin New address of the GMX plugin.
     */
    function setConfig(address _vault, address _gmxPlugin) external onlyOwner {
        require(_vault != address(0) && _gmxPlugin != address(0), "Invalid address");

        config = Config({
            vault: _vault,
            gmxPlugin: _gmxPlugin
        });

        emit SetConfig(_vault, _gmxPlugin);
    }

    /**
     * @dev Updates the deposit, withdrawal, and order handlers in the contract.
     * @param _depositHandler Address of the deposit handler.
     * @param _withdrawalHandler Address of the withdrawal handler.
     * @param _orderHandler Address of the order handler.
     */
    function setHandler(address _depositHandler, address _withdrawalHandler, address _orderHandler) external onlyOwner {
        require(_depositHandler != address(0) && _withdrawalHandler != address(0) && _orderHandler != address(0), "Invalid address");

        depositHandler = _depositHandler;
        withdrawalHandler = _withdrawalHandler;
        orderHandler = _orderHandler;

        emit SetHandler(_depositHandler, _withdrawalHandler, _orderHandler);
    }

    /**
     * @dev Adds a key to the corresponding array based on the state option (Deposit, Withdrawal, Order).
     * @param _key The key to be added.
     * @param _stateOption The state option (Deposit, Withdrawal, Order).
     */
    function addKey(bytes32 _key, State _stateOption) external onlyGmxPlugin {
        if (_stateOption == State.Deposit) {
            depositKeys.push(_key);
        } else if (_stateOption == State.Withdrawal) {
            withdrawalKeys.push(_key);
        } else if (_stateOption == State.Order) {
            orderKeys.push(_key);
        } else {
            revert("Invalid state");
        }

        emit AddKey(_key, _stateOption);
    }

    /**
     * @dev Adds withdrawal data for a specific key.
     * @param _withdrawalKey The key associated with the withdrawal data.
     * @param _lpAmount The LP amount to be withdrawn.
     * @param _receiver The address to receive the LP tokens.
     */
    function addWithdrawalData(bytes32 _withdrawalKey, uint256 _lpAmount, address _receiver) external onlyGmxPlugin {
        bool isExist = false;
        for (uint256 i = 0; i < withdrawalKeys.length; ++i) {
            if (withdrawalKeys[i] == _withdrawalKey) {
                isExist = true;
            }
        }
        require(isExist, "Invalid withdrawal key");
        withdrawalData[_withdrawalKey] = WithdrawalInfo({
            lpAmount: _lpAmount,
            receiver: _receiver
        });

        emit AddWithdrawalData(_withdrawalKey, _lpAmount, _receiver);
    }

    /**
     * @dev Retrieves an array of keys based on the state option (Deposit, Withdrawal, Order).
     * @param stateOption The state option (Deposit, Withdrawal, Order).
     * @return An array of keys associated with the specified state option.
     */
    function getKeys(State stateOption) public view returns (bytes32[] memory) {
        if (stateOption == State.Deposit) {
            return depositKeys;
        } else if (stateOption == State.Withdrawal) {
            return withdrawalKeys;
        } else if (stateOption == State.Order) {
            return orderKeys;
        } else {
            revert("Invalid state");
        }
    }

    function getWithdrawalDatas() public view returns (WithdrawalInfo[] memory) {
        uint256 length = withdrawalKeys.length;
        WithdrawalInfo[] memory result = new WithdrawalInfo[](length);

        for(uint256 i = 0; i < length; i++) {
            result[i] = withdrawalData[withdrawalKeys[i]];
        }
        return result;
    }

    /**
     * @dev Removes a key from the corresponding array based on the state option (Deposit, Withdrawal, Order).
     * @param _key The key to be removed.
     * @param _stateOption The state option (Deposit, Withdrawal, Order).
     */
    function removeKey(bytes32 _key, State _stateOption) internal {
        bytes32[] storage targetArray;

        if (_stateOption == State.Deposit) {
            targetArray = depositKeys;
        } else if (_stateOption == State.Withdrawal) {
            targetArray = withdrawalKeys;
        } else if (_stateOption == State.Order) {
            targetArray = orderKeys;
        } else {
            revert("Invalid state");
        }

        uint256 length = targetArray.length;
        for (uint256 i = 0; i < length; i++) {
            if (targetArray[i] == _key) {
                // Found the element, now remove it
                if (i < length - 1) {
                    // Move the last element to the position of the element to be removed
                    targetArray[i] = targetArray[length - 1];
                }
                // Remove the last element (which is now a duplicate or the original element)
                targetArray.pop();

                // You may choose to break here if you want to remove only the first occurrence
                break;
            }
        }

        emit RemoveKey(_key, _stateOption);
    }

    /**
     * @dev Checks whether the contract is locked (i.e., no active deposit, withdrawal, or order).
     * @return True if the contract is locked, false otherwise.
     */
    function getLockerStatus() public view returns (bool) {
        return depositKeys.length == 0 && withdrawalKeys.length == 0 && orderKeys.length == 0;
    }

    /**
     * @dev Handles actions after a deposit execution.
     * @param key The key associated with the deposit.
     * @param deposit The deposit details.
     * @param eventData Additional event data.
     */
    function afterDepositExecution(bytes32 key, Deposit.Props memory deposit, EventUtils.EventLogData memory eventData) external onlyHandler(State.Deposit) {
        removeKey(key, State.Deposit);
        IGMXPlugin(config.gmxPlugin).transferAllTokensToVault();
        
        emit AfterDepositExecution(key);
    }

    /**
     * @dev Handles actions after a deposit cancellation.
     * @param key The key associated with the deposit.
     * @param deposit The deposit details.
     * @param eventData Additional event data.
     */
    function afterDepositCancellation(bytes32 key, Deposit.Props memory deposit, EventUtils.EventLogData memory eventData) external onlyHandler(State.Deposit) {
        removeKey(key, State.Deposit);
        IGMXPlugin(config.gmxPlugin).transferAllTokensToVault();
        
        emit AfterDepositCancellation(key);
    }

    /**
     * @dev Handles actions after a withdrawal execution.
     * @param key The key associated with the withdrawal.
     * @param withdrawal The withdrawal details.
     * @param eventData Additional event data.
     */
    function afterWithdrawalExecution(bytes32 key, Withdrawal.Props memory withdrawal, EventUtils.EventLogData memory eventData) external onlyHandler(State.Withdrawal) {
        removeKey(key, State.Withdrawal);
        WithdrawalInfo memory info = withdrawalData[key];
        if (info.lpAmount != 0) {
            IVault(config.vault).burnLP(info.lpAmount);
        }
        delete withdrawalData[key];
        IGMXPlugin(config.gmxPlugin).transferAllTokensToVault();
        
        emit AfterWithdrawalExecution(key);
    }

    /**
     * @dev Handles actions after a withdrawal cancellation.
     * @param key The key associated with the withdrawal.
     * @param withdrawal The withdrawal details.
     * @param eventData Additional event data.
     */
    function afterWithdrawalCancellation(bytes32 key, Withdrawal.Props memory withdrawal, EventUtils.EventLogData memory eventData) external onlyHandler(State.Withdrawal) {
        removeKey(key, State.Withdrawal);
        WithdrawalInfo memory info = withdrawalData[key];
        if (info.lpAmount != 0 && info.receiver != address(0) && info.receiver != config.gmxPlugin) {
            IVault(config.vault).transferLP(info.receiver, info.lpAmount);
        }
        delete withdrawalData[key];
        IGMXPlugin(config.gmxPlugin).transferAllTokensToVault();

        emit AfterWithdrawalCancellation(key);
    }

    /**
     * @dev Handles actions after an order execution.
     * @param key The key associated with the order.
     * @param order The order details.
     * @param eventData Additional event data.
     */
    function afterOrderExecution(bytes32 key, Order.Props memory order, EventUtils.EventLogData memory eventData) external onlyHandler(State.Order) {
        removeKey(key, State.Order);
        IGMXPlugin(config.gmxPlugin).transferAllTokensToVault();

        emit AfterOrderExecution(key);
    }

    /**
     * @dev Handles actions after an order cancellation.
     * @param key The key associated with the order.
     * @param order The order details.
     * @param eventData Additional event data.
     */
    function afterOrderCancellation(bytes32 key, Order.Props memory order, EventUtils.EventLogData memory eventData) external onlyHandler(State.Order) {
        removeKey(key, State.Order);
        IGMXPlugin(config.gmxPlugin).transferAllTokensToVault();

        emit AfterOrderCancellation(key);
    }

    /**
     * @dev Handles actions after an order is frozen.
     * @param key The key associated with the order.
     * @param order The order details.
     * @param eventData Additional event data.
     */
    function afterOrderFrozen(bytes32 key, Order.Props memory order, EventUtils.EventLogData memory eventData) external onlyHandler(State.Order) {
        IGMXPlugin(config.gmxPlugin).transferAllTokensToVault();

        emit AfterOrderFrozen(key);
    }
}