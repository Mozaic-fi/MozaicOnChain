import * as readline from 'readline';

export function cliConfirmation(question: string, active: boolean): Promise<boolean> {
    if (!active) {
        return Promise.resolve(true)
    }
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(`${question} (Y/n): `, (answer) => {
            rl.close();
            const trimmedAnswer = answer.trim().toLowerCase();
            resolve(trimmedAnswer === 'y' || trimmedAnswer === '');
        });
    });
}


