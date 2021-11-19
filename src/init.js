import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';

const noteLog = `
Note: Do not use your own bitbucket password. Create an app password with repositories read + write access.
        
To setup a bitbucket app password, checkout the following documentation:
https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/
`.trim();

export const makeInitCommand = (authConfig, authConfigFileLocation) => {
    const program = new Command();

    program
        .name('init')
        .description('Create the configuration file with your bitbucket username and app password.')
        .action(async() => {

            if (authConfig) {
                const existingConfigAnswers = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'shouldOverwriteConfig',
                        message: `Existing configuration file at ${authConfigFileLocation}. Would you like to overwrite it?`,
                        default: false,
                    },
                ]);

                if (!existingConfigAnswers.shouldOverwriteConfig) {
                    return;
                }
            }

            console.log('\n' + noteLog + '\n');

            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'username',
                    message: 'Bitbucket Username:',
                    validate: (input) => {
                        if (!input.trim()) {
                            return 'Username cannot be empty.';
                        }
                        return true;
                    },
                },
                {
                    type: 'password',
                    name: 'appPassword',
                    message: 'App Password:',
                    validate: (input) => {
                        if (!input.trim()) {
                            return 'App password cannot be empty.';
                        }
                        return true;
                    },
                },
            ]);

            if (!authConfig) {
                authConfig = {};
            }

            authConfig.username    = answers.username.trim();
            authConfig.appPassword = answers.appPassword.trim();

            fs.writeFileSync(authConfigFileLocation, JSON.stringify(authConfig));

            console.log(`Created ${authConfigFileLocation}.`);
        })
    ;

    return program;
};