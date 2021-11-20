import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

export const makeConfigCommand = (defaultConfig) => {
    const program = new Command();

    program
        .name('create-config')
        .description('Create a blank new configuration file.')
        .action(async() => {
            const configFilePath = path.resolve('.', '.bmrm.json');

            if (fs.existsSync(configFilePath)) {
                const existingConfigAnswers = await inquirer.prompt([
                    {
                        type:    'confirm',
                        name:    'shouldOverwriteConfig',
                        message: `Existing configuration file at ${configFilePath}. Would you like to overwrite it?`,
                        default: false,
                    },
                ]);

                if (!existingConfigAnswers.shouldOverwriteConfig) {
                    return;
                }
            }

            fs.writeFileSync(configFilePath, JSON.stringify(defaultConfig, null, 4));

            console.log(`Successfully created ${configFilePath}`);
        })
    ;

    return program;
};