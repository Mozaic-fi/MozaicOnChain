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
        rl.question(cliBold(`${question} (Y/n): `), (answer) => {
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
        rl.question(cliBold(`${question}: `), (answer) => {
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

export function cliSelectItem(question: string, items: any[], noJson: boolean= false): Promise<number> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log(cliBold(`${question}: `))
        console.log('List of Possible Values:')
        for (let i = 0; i < items.length; i++) {
            let textColor: (text:string, bold?: boolean)=> string = i % 2 === 0 ? cliCyan : cliMagenta;
            console.log(textColor(`${i + 1}:${noJson? items[i]: '\n'+JSON.stringify(items[i], null, 2)}`, false));
            if(!noJson) console.log('\n-----------------------------------\n')
        }
        rl.question(`${question}: `, (answer) => {
            if(/^\d+$/.test(answer.trim())) {
                let index = parseInt(answer.trim());
                if(index >= 0 && index <= items.length) {
                    resolve(index -1);
                }
                else {
                    rl.write("Invalid input\n");
                    resolve(-1);
                }
            }
            else{
                rl.write("Invalid input\n");
            }
            rl.close();
        });
    });
}

export function cliSelectItems(question: string, items: any[], noJson: boolean= false): Promise<number[]> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log(cliBold(`${question}: (please enter comma separated):`))
        console.log('List of Possible Values:')
        for (let i = 0; i < items.length; i++) {
            let textColor: (text:string, bold?: boolean)=> string = i % 2 === 0 ? cliCyan : cliMagenta;
            console.log(textColor(`${i + 1}:${noJson? items[i]: '\n'+JSON.stringify(items[i], null, 2)}`, false));
            if(!noJson)console.log('\n-----------------------------------\n')
        }
        rl.question(`${question}: `, (answer) => {
            const indexes = answer.split(',').map(s => Number(s.trim()) - 1);
            if(indexes.every(index => index >= 0 && index < items.length)) 
            {
                resolve(indexes);
            }
            resolve([]);          
            rl.close();
        });
    });
}

export function cliInputList(question: string): Promise<string[]> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(cliBold(`${question} (Press enter twice to submit): `), async(answer) => {
            const values: string[] = [];
            let trimmedAnswer = answer.trim();
            while (trimmedAnswer !== '') {
                values.push(trimmedAnswer);
                trimmedAnswer = await new Promise<string>((resolve) => rl.question('', resolve));
            }
            rl.close();
            resolve(values);
        });
    });
}

export function cliRead(question: string): Promise<number> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(cliRed(question), (answer) => {
            rl.close();
            const trimmedAnswer = answer.trim().toLowerCase();
            if(/^\d+$/.test(trimmedAnswer)){
                let index = parseInt(trimmedAnswer);
                resolve(index);
            }else{
                resolve(-1);
            }
        });
    });
}

const reset = "\x1b[0m";
const boldFlag = "\x1b[1m";
const red = "\x1b[31m";
const green = "\x1b[32m";
const blue = "\x1b[34m";
const yellow = "\x1b[33m";
const cyan = "\x1b[36m";
const magenta = "\x1b[35m";

export function cliBold(text: string): string {
    return boldFlag + text + reset;
}

export function cliRed(text: string, bold: boolean = true): string {
    if(bold) return cliBold(cliRed(text, false));
    return red + text + reset;
}

export function cliGreen(text: string, bold: boolean= true): string {
    if(bold) return cliBold(cliGreen(text, false));
    return green + text + reset;
}

export function cliBlue(text: string, bold: boolean= true): string {
    if(bold) return cliBold(cliBlue(text, false));
    return blue + text + reset;
}

export function cliYellow(text: string, bold: boolean= true): string {
    if(bold) return cliBold(cliYellow(text, false));
    return yellow + text + reset;
}

export function cliCyan(text: string, bold: boolean= true): string {
    if(bold) return cliBold(cliCyan(text, false));
    return cyan + text + reset;
}

export function cliMagenta(text: string, bold: boolean= true): string {
    if(bold) return cliBold(cliMagenta(text, false));
    return magenta + text + reset;
}
