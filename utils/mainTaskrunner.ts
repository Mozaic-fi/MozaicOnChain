import { spawn } from 'child_process';
import { cliCyan, cliGreen, cliYellow, cliRed, cliRead } from "./cliUtils";
import { networkNames } from "./names/networkNames";

enum TaskType {
  Config = 'config',
  Deploy = 'deploy',
  Test = 'test',
  Yarn = 'yarn',
  managedTask = 'selectNetwork'
}

type Task = {
  type: TaskType;
  name: string;
  command: string;
};

class TaskRunner {
  private networks: networkNames[] = [];
  private tasks: Task[] = [];

  constructor() {
    for (const networkName in networkNames) {
      this.networks.push(networkName as networkNames);
    }
    this.addTask(TaskType.Deploy, 'Deploy Vault', 'GmxCallback');
    this.addTask(TaskType.Deploy, 'Deploy UnsafeMultiCallVaultMaster', 'UnsafeMultiCallVaultMaster');
    this.addTask(TaskType.Config, 'Configure TokenPriceConsumer', 'tasks/vaults/InitializeTokenPriceConsumer.ts');
    this.addTask(TaskType.Config, 'Configure Vault master', 'tasks/vaults/InitializeMultiCallVaultMaster.ts');
    this.addTask(TaskType.Config, 'Configure Unsafe Vault master', 'tasks/vaults/InitializeUnsafeMultiCallVaultMaster.ts');
    this.addTask(TaskType.Config, 'Configure GMX CallBack', 'tasks/vaults/gmx/InitializegmxCallBack.ts');
    this.addTask(TaskType.Config, 'Configure GMX Plugin', 'tasks/vaults/gmx/InitializegmxPlugin.ts');
    this.addTask(TaskType.Config, 'Configure Vault', 'tasks/vaults/InitializeTheseusVault.ts');
    this.addTask(TaskType.Config, 'Test GMX', 'tasks/gmx/getGMXPools.ts');
    this.addTask(TaskType.Test, 'Test Vault', 'test/hardhat/vaults/TheseusVaultGMX.test.ts');
    this.addTask(TaskType.Config, 'Get Contract Addresses', 'tasks/getContractAddresses.ts');
    this.addTask(TaskType.Yarn, 'Size Contracts', 'hardhat size-contracts');
  }

  addTask(type: TaskType, name: string, cmd: string): void {
    let command= '';
    switch (type) {
        case TaskType.Config:
            command = `npx hardhat run ${cmd}`;
            break;
        case TaskType.Deploy:
            command = `npx hardhat deploy --tags ${cmd}`;
            break;
        case TaskType.Test:
            command = `npx hardhat test ${cmd}`;
            break;
        case TaskType.Yarn:
            command = `yarn run ${cmd}`;
            break;
        default:
            break;
    }
    this.tasks.push({ type, name, command });
  }

  private async askQuestion(question: string): Promise<number> {
    return await cliRead(question)
  }

  private async chooseNetwork(): Promise<string> {
    console.log('Available networks:');
    this.networks.forEach((network, index) => {
      console.log(`${index + 1}. ${network}`);
    });

    const choice = await this.askQuestion('Choose a network (enter the number): ');
    const index = choice - 1;

    if (index >= 0 && index < this.networks.length) {
      return this.networks[index];
    } else {
      console.log('Invalid choice. Please try again.');
      return this.chooseNetwork();
    }
  }

  private async chooseTask(network: string): Promise<Task | null> {
    console.log(`Selected network: ${cliCyan(network)}`);
    console.log('Available tasks:');
    console.log(cliRed('0. Clear', false))
    this.tasks.forEach((task, index) => {
        switch (task.type) {
            case TaskType.Config:
                console.log(cliGreen(`${index + 1}. ${task.name}`, false));
                break;
            case TaskType.Deploy:
                console.log(cliYellow(`${index + 1}. ${task.name}`, false));
                break;
            case TaskType.Test:
                console.log(cliCyan(`${index + 1}. ${task.name}`, false));
                break;
            case TaskType.Yarn:
                console.log(cliRed(`${index + 1}. ${task.name}`, false));
                break;
            default:
                break;
        }
    });
    console.log(`${this.tasks.length + 1}. change network`);
    console.log(`${this.tasks.length + 2}. Exit`);

    const choice = await this.askQuestion('Choose a task to run (enter the number): ');
    const index = choice - 1;

    if (index >= 0 && index < this.tasks.length) {
      return this.tasks[index];
    } else if (index === this.tasks.length) {
      return { type: TaskType.managedTask, name: 'change network', command: '' };
    } else if (index === this.tasks.length + 1) {
      return null;
    } else if (index === -1) {
      return { type: TaskType.Yarn, name: 'clear', command: 'clear' }; 
    } else {
      console.log('Invalid choice. Please try again.');
      return this.chooseTask(network);
    }
  }

  private async runCommand(command: string): Promise<void> {
    return new Promise((resolve) => {
      const [cmd, ...args] = command.split(' ');
      const childProcess = spawn(cmd, args, { stdio: 'inherit' });

      childProcess.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);
        resolve();
      });
    });
  }

  async run(): Promise<void> {
    if (this.networks.length === 0) {
      console.log('No networks available. Please add networks first.');
      return;
    }

    if (this.tasks.length === 0) {
      console.log('No tasks available. Please add tasks first.');
      return;
    }

    let selectedNetwork = await this.chooseNetwork();

    let selectedTask: Task | null;
    do {
      selectedTask = await this.chooseTask(selectedNetwork);
      if (selectedTask) {
        console.log(`Running task: ${selectedTask.name}`);
        if(selectedTask.type === TaskType.Yarn) {
            await this.runCommand(selectedTask.command);
        } else if (selectedTask.type === TaskType.managedTask) {
          selectedNetwork = await this.chooseNetwork();
        } else {
            await this.runCommand(selectedTask.command + ` --network ${selectedNetwork}`);
        }
      }
    } while (selectedTask !== null);

    console.log('Task runner finished.');
  }
}

const main = async ()=>{
    const taskRunner = new TaskRunner();
    await taskRunner.run();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });