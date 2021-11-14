import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';

const noteLog = `
Note: Do not use your own bitbucket password. Create an app password with repositories read + write access.
        
To setup a bitbucket app password, checkout the following documentation:
https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/
`.trim();

export const makeInitCommand = (config, configFileLocation) => {
    const program = new Command();

    program
        .name('init')
        .description('Create the configuration file with your bitbucket username and app password.')
        .action(async() => {

            if (config) {
                const existingConfigAnswers = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'shouldOverwriteConfig',
                        message: `Existing configuration file at ${configFileLocation}. Would you like to overwrite it?`,
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

            if (!config) {
                config = {};
            }

            config.auth = config.auth || {};

            config.auth.username    = answers.username.trim();
            config.auth.appPassword = answers.appPassword.trim();

            fs.writeFileSync(configFileLocation, JSON.stringify(config));

            console.log(`Created ${configFileLocation}.`);
        })
    ;

    return program;
};