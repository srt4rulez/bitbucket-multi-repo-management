#!/usr/bin/env node

const { Command } = require('commander');
const packageJson = require('../package.json');
const fs          = require('fs');
const inquirer    = require('inquirer');
const os          = require('os');
const path        = require('path');

const program = new Command();

const configFileLocation = path.resolve(os.homedir(), '.bitbucket-multi-repo-management.json');

let config;
let hasExistingConfig;

try {
    config = fs.readFileSync(configFileLocation);
    config = JSON.parse(config);
    hasExistingConfig = true;
} catch (e) {
    config = {};
    hasExistingConfig = false;
}

console.log(config);

program
    .name(packageJson.name)
    .version(packageJson.version)
    .description('A node.js console application that manages multiple git repositories in Bitbucket Cloud via the Bitbucket API.')

    .command('init')
    .action(async() => {

        if (hasExistingConfig) {
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

        console.log(`
Note: Do not use your own bitbucket password. Create an app password with repositories read + write access.
        
To setup a bitbucket app password, checkout the following documentation:
https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/
        `);

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

        config.auth = config.auth || {};

        config.auth.username    = answers.username.trim();
        config.auth.appPassword = answers.appPassword.trim();

        fs.writeFileSync(configFileLocation, JSON.stringify(config));

        if (!hasExistingConfig) {
            console.log(`Created ${configFileLocation}.`);
        } else {
            console.log(`Updated ${configFileLocation}.`);
        }
    })
;

program.parse();