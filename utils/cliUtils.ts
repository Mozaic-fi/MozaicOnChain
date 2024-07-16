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

export function cliQuestionNumber(question: string): Promise<number> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(`${question}: `, (answer) => {
            if(/^\d+$/.test(answer.trim())) {
                resolve(parseInt(answer.trim()));
            }
            else{
                rl.write("Invalid input\n");
            }
            rl.close();
        });
    });
}

export function cliSelectItem(question: string, items: any[]): Promise<number> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(`${question}: `, (answer) => {
            console.log('List of Possible Values:')
            for (let i = 0; i < items.length; i++) {
                console.log(`${i + 1}:\n${items[i]}`);
                console.log('\n-----------------------------------\n')
            }
            if(/^\d+$/.test(answer.trim())) {
                let index = parseInt(answer.trim());
                if(index < 0 || index >= items.length) {
                    rl.write("Invalid input\n");
                }
                resolve(index);
            }
            else{
                rl.write("Invalid input\n");
            }
            rl.close();
        });
    });
}

