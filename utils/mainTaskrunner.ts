import { spawn } from 'child_process';
import { cliCyan, cliGreen, cliYellow, cliRed, cliRead } from "./cliUtils";
import { networkNames } from "./names/networkNames";

enum TaskType {
  Config = 'config',
  Deploy = 'deploy',
  Test = 'test',
  Yarn = 'yarn',
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
    this.addTask(TaskType.Config, 'Initialize Vault', 'tasks/vaults/InitializeTheseusVault.ts');
    this.addTask(TaskType.Config, 'Initialize GMX Plugin', 'tasks/vaults/gmx/InitializegmxPlugin.ts');
    this.addTask(TaskType.Config, 'Initialize GMX CallBack', 'tasks/vaults/gmx/InitializegmxCallBack.ts');
    this.addTask(TaskType.Config, 'Test GMX', 'tasks/gmx/getGMXPools.ts');
    this.addTask(TaskType.Test, 'Test Vault', 'test/hardhat/vaults/TheseusVaultGMX.test.ts');
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

  private async chooseTask(): Promise<Task | null> {
    console.log('Available tasks:');
    this.tasks.forEach((task, index) => {
        switch (task.type) {
            case TaskType.Config:
                console.log(cliGreen(`${index + 1}. ${task.name}`));
                break;
            case TaskType.Deploy:
                console.log(cliYellow(`${index + 1}. ${task.name}`));
                break;
            case TaskType.Test:
                console.log(cliCyan(`${index + 1}. ${task.name}`));
                break;
            case TaskType.Yarn:
                console.log(cliRed(`${index + 1}. ${task.name}`));
                break;
            default:
                break;
        }
    });
    console.log(`${this.tasks.length + 1}. Exit`);

    const choice = await this.askQuestion('Choose a task to run (enter the number): ');
    const index = choice - 1;

    if (index >= 0 && index < this.tasks.length) {
      return this.tasks[index];
    } else if (index === this.tasks.length || index === -1) {
      return null;
    } else {
      console.log('Invalid choice. Please try again.');
      return this.chooseTask();
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

    const selectedNetwork = await this.chooseNetwork();
    console.log(`Selected network: ${selectedNetwork}`);

    let selectedTask: Task | null;
    do {
      selectedTask = await this.chooseTask();
      if (selectedTask) {
        console.log(`Running task: ${selectedTask.name}`);
        if(selectedTask.type === TaskType.Yarn) {
            await this.runCommand(selectedTask.command);
        }else {
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