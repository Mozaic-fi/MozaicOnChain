import { cliBlue, cliCyan, cliGreen, cliRed, cliMagenta } from '../utils/cliUtils';
import { contractNames } from '../utils/names/contractNames';
import hre from 'hardhat';

async function main() {
    await fetchContractDeploymentAddress(contractNames.Tokens.MozToken)
    await fetchContractDeploymentAddress(contractNames.Tokens.MozTokenAdapter)
    await fetchContractDeploymentAddress(contractNames.Tokens.XMozToken)
    await fetchContractDeploymentAddress(contractNames.Tokens.MozStaking)
    console.log('---------------------------------------')
    await fetchContractDeploymentAddress(contractNames.Vaults.TokenPriceConsumer)
    await fetchContractDeploymentAddress(contractNames.Vaults.Theseus.GmxCallback)
    await fetchContractDeploymentAddress(contractNames.Vaults.Theseus.GmxPlugin)
    await fetchContractDeploymentAddress(contractNames.Vaults.Theseus.MultiCallVaultMaster)
    await fetchContractDeploymentAddress(contractNames.Vaults.Theseus.Vault)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
});

async function fetchContractDeploymentAddress(contractName: string) {
    try{
    const contractDeployment = await hre.deployments.get(contractName);
    console.log(`Contract ${cliGreen(contractName, true)} found at address: ${cliMagenta(contractDeployment.address, true)} on network ${cliBlue(hre.network.name, true)}`);
    } catch (error) {
        console.error(`${cliRed('Contract')} ${cliGreen(contractName, true)} ${cliRed('not found on network')} ${cliBlue(hre.network.name, true)}`);
    }
}