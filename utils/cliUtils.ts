import * as readline from 'readline';

export function cliConfirmation(question: string): Promise<boolean> {
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


