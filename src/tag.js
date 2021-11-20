import { Command } from 'commander';
import axios from 'axios';
import chalk from 'chalk';
import inquirer from 'inquirer';
import semver from 'semver';

const getCreateTagConfigLog = (props) => `
${chalk.blue('Repositories')}
${props.repositories.join('\n')}

${chalk.blue('Action Info')}
From Branch / Commit Hash: ${chalk.magenta(props.fromBranchOrHash)}
Tag Name: ${chalk.green(props.tagName)}
`.trim();

const getCreateTagSuccessLog = (props) => `
${chalk.black.bgGreenBright('SUCCESS')} ${chalk.yellow(props.repo)}
    Tag: ${chalk.green(props.tagName)}
    Tag Link: ${props.tagLink}
    Commit Author: ${props.commitAuthor}
    Commit: ${props.commitHash}
    Commit Link: ${props.commitLink}
`.trim();

const getCreateTagErrorLog = (props) => `
${chalk.white.bgRed('FAILURE')} ${chalk.yellow(props.repo)}
    ${props.errorMessage.trim()}
`.trim();

const getDeleteTagConfigLog = (props) => `
${chalk.blue('Repositories')}
${props.repositories.join('\n')}

${chalk.blue('Action Info')}
Tag to delete: ${chalk.red(props.tagName)}
`.trim();

const getDeleteTagSuccessLog = (props) => `
${chalk.black.bgGreenBright('SUCCESS')} ${chalk.yellow(props.repo)}
`.trim();

const getDeleteBranchErrorLog = getCreateTagErrorLog; // same as create.

const releases = [
    {
        type: 'major',
        label: 'Major',
        isPreRelease: false,
    },
    {
        type: 'premajor',
        label: 'Pre-Major',
        isPreRelease: true,
    },
    {
        type: 'minor',
        label: 'Minor',
        isPreRelease: false,
    },
    {
        type: 'preminor',
        label: 'Pre-Minor',
        isPreRelease: true,
    },
    {
        type: 'patch',
        label: 'Patch',
        isPreRelease: false,
    },
    {
        type: 'prepatch',
        label: 'Pre-Patch',
        isPreRelease: true,
    },
    {
        type: 'prerelease',
        label: 'Pre-Release',
        isPreRelease: true,
    },
];

export const makeTagCommand = (authConfig, config) => {
    const program = new Command();

    program
        .name('tag')
        .description('Create or delete tags on all configured repositories.')
    ;

    program
        .command('create')
        .description('Create a tag on all configured repositories')
        .option('-i, --interactive', 'Run through prompts to create a new version tag. Includes an easy way to pick a new version based on the current version.')
        .argument('[fromBranchOrHash]', 'Branch or the specific commit hash create tag from. If branch is used, it will use the last commit to create the tag from.')
        .argument('[tagName]', 'Tag name to create.')
        .action(async(fromBranchOrHash, tagName, options = {
            interactive: undefined,
        }) => {
            if (!authConfig) {
                console.log('Missing configuration file. Please run "init" command and try again.');
                return;
            }

            const repositories = config.repositories || [];

            if (repositories.length === 0) {
                console.log('No repositories setup yet. Run "create-config" to setup the configuration file and add repositories.');
                return;
            }

            if (options.interactive) {
                const prereleaseIdentifier  = config.prereleaseIdentifier || undefined;
                const versionPrefix  = config.versionPrefix || '';

                const interactiveAnswers = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'fromBranchOrHash',
                        message: 'Branch or hash to create tag from:',
                        validate: (input) => {
                            if (!input.trim()) {
                                return 'Branch or hash cannot be empty.';
                            }
                            return true;
                        },
                    },
                    {
                        type: 'input',
                        name: 'currentVersion',
                        message: 'Current tag / version:',
                        validate: (input) => {
                            if (!input.trim()) {
                                return 'Current tag / version cannot be empty.';
                            }
                            return true;
                        },
                    },
                    {
                        type: 'list',
                        name: 'newVersion',
                        message: 'Which version would you like to create?',
                        choices: (answers = {
                            currentVersion: '',
                        }) => {
                            // Remove any "v" prefixes to avoid duplicates with shouldPrefixWithV
                            const currentVersion = answers.currentVersion.replace(/^v+|v+$/g, '');

                            return releases.map((release) => {
                                const newVersion = (versionPrefix ? versionPrefix : '') + semver.inc(currentVersion, release.type, release.isPreRelease ? prereleaseIdentifier : undefined);
                                return {
                                    name: `${release.label} (${newVersion})`,
                                    value: newVersion,
                                };
                            });
                        },
                    },
                ]);

                tagName = interactiveAnswers.newVersion;
                fromBranchOrHash = interactiveAnswers.fromBranchOrHash;
            } else if (fromBranchOrHash === undefined && tagName === undefined) {
                console.log('Error: Missing fromBranchOrHash or tagName arguments.');
                return;
            }

            console.log('\n' + getCreateTagConfigLog({
                repositories: repositories,
                fromBranchOrHash: fromBranchOrHash,
                tagName: tagName,
            }) + '\n');

            if (semver.valid(tagName) === null) { // invalid semver tag
                const nonSemverAnswers = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'isOkayWithNonSemverVersion',
                        message: `Tag "${chalk.green(tagName)}" is not a valid semver version. Do you still wish to proceed?`,
                        default: false,
                    },
                ]);

                if (!nonSemverAnswers.isOkayWithNonSemverVersion) {
                    return;
                }
            }

            const hasConfirmedAnswers = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'hasConfirmed',
                    message: `Create tag "${chalk.green(tagName)}" from "${chalk.magenta(fromBranchOrHash)}" on all configured repositories? ${chalk.red('Warning: This action cannot be undone.')}`,
                    default: false,
                },
            ]);

            if (!hasConfirmedAnswers.hasConfirmed) {
                return;
            }

            const axiosInstance = axios.create({
                baseURL: 'https://api.bitbucket.org/2.0',
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username: authConfig.username,
                    password: authConfig.appPassword,
                },
            });

            for (const repo of repositories) {

                const logProps = {
                    repo: repo,
                    tagName: tagName,
                    tagLink: '',
                    commitHash: '',
                    commitLink: '',
                    commitAuthor: '',
                    errorMessage: '',
                };

                let wasSuccessful = false;

                try {
                    const response = await axiosInstance.request({
                        method: 'post',
                        url:    `repositories/${repo}/refs/tags`,
                        data:   JSON.stringify({
                            name:   tagName,
                            target: {
                                hash: fromBranchOrHash,
                            },
                        }),
                    });

                    wasSuccessful = true;

                    const data = response.data;

                    logProps.commitHash = data.target.hash;
                    logProps.commitLink = data.target.links.html.href;
                    logProps.commitAuthor = data.target.author.raw;
                    logProps.tagLink = data.links.html.href;
                } catch (error) {
                    if (error.response.data.error.message) {
                        logProps.errorMessage = error.response.data.error.message;
                    } else if (error.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        logProps.errorMessage = error.response.data;
                    } else {
                        logProps.errorMessage = error;
                    }
                }

                console.log((wasSuccessful ? getCreateTagSuccessLog(logProps) : getCreateTagErrorLog(logProps)) + '\n');
            }

        })
    ;

    program
        .command('delete')
        .description('Delete a tag on all configured repositories')
        .argument('<tagName>', 'Branch name to delete.')
        .action(async(tagName) => {
            if (!authConfig) {
                console.log('Missing auth configuration file. Please run "init" command and try again.');
                return;
            }

            const repositories = config.repositories || [];

            if (repositories.length === 0) {
                console.log('No repositories setup yet. Run "create-config" to setup the configuration file and add repositories.');
                return;
            }

            console.log('\n' + getDeleteTagConfigLog({
                repositories: repositories,
                tagName: tagName,
            }) + '\n');

            const hasConfirmedAnswers = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'hasConfirmed',
                    message: `Delete "${chalk.red(tagName)}" on all configured repositories? ${chalk.red('Warning: This action cannot be undone.')}`,
                    default: false,
                },
            ]);

            if (!hasConfirmedAnswers.hasConfirmed) {
                return;
            }

            const axiosInstance = axios.create({
                baseURL: 'https://api.bitbucket.org/2.0',
                headers: {
                    'Content-Type': 'application/json',
                },
                auth: {
                    username: authConfig.username,
                    password: authConfig.appPassword,
                },
            });

            for (const repo of repositories) {

                const logProps = {
                    repo: repo,
                    tagName: tagName,
                    commitHash: '',
                    commitLink: '',
                    errorMessage: '',
                };

                let wasSuccessful = false;

                try {
                    await axiosInstance.request({
                        method: 'delete',
                        url:    `repositories/${repo}/refs/tags/${tagName}`,
                    });

                    wasSuccessful = true;
                } catch (error) {
                    if (error.response.data.error.message) {
                        logProps.errorMessage = error.response.data.error.message;
                    } else if (error.response) {
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        logProps.errorMessage = error.response.data;
                    } else {
                        logProps.errorMessage = error;
                    }
                }

                console.log((wasSuccessful ? getDeleteTagSuccessLog(logProps) : getDeleteBranchErrorLog(logProps)) + '\n');
            }

        })
    ;

    return program;
};