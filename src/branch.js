import { Command } from 'commander';
import axios from 'axios';
import chalk from 'chalk';
import inquirer from 'inquirer';

const getCreateBranchConfigLog = (props) => `
${chalk.blue('Repositories')}
${props.repos.join('\n')}

${chalk.blue('Branch Info')}
From Branch: ${chalk.magenta(props.fromBranch)}
Branch Name: ${chalk.green(props.branchName)}
`.trim();

const getCreateBranchSuccessLog = (props) => `
${chalk.black.bgGreenBright('SUCCESS')} ${chalk.yellow(props.repo)}
    Author: ${props.commitAuthor}
    Commit: ${props.commitHash}
    Commit Link: ${props.commitLink}
`.trim();

const getCreateBranchErrorLog = (props) => `
${chalk.white.bgRed('FAILURE')} ${chalk.yellow(props.repo)}
    ${props.errorMessage.trim()}
`.trim();

const getDeleteBranchConfigLog = (props) => `
${chalk.blue('Repositories')}
${props.repos.join('\n')}

${chalk.blue('Action Info')}
Branch to delete: ${chalk.red(props.branchName)}
`.trim();

const getDeleteBranchSuccessLog = (props) => `
${chalk.black.bgGreenBright('SUCCESS')} ${chalk.yellow(props.repo)}
`.trim();

const getDeleteBranchErrorLog = getCreateBranchErrorLog; // same as create.

export const makeBranchCommand = (config) => {
    const program = new Command();

    program
        .name('branch')
        .description('Create or delete a branch on all configured repositories.')
    ;

    program
        .command('create')
        .description('Create a branch on all configured repositories')
        .argument('<fromBranch>', 'Branch to create from.')
        .argument('<branchName>', 'Branch name to create.')
        .action(async(fromBranch, branchName) => {
            if (!config) {
                console.log('Missing configuration file. Please run "init" command and try again.');
                return;
            }

            const repos = config.repos || [];

            if (repos.length === 0) {
                console.log('No repositories setup yet. Please run "repo add" command and try again.');
                return;
            }

            console.log('\n' + getCreateBranchConfigLog({
                repos: repos,
                fromBranch: fromBranch,
                branchName: branchName,
            }) + '\n');

            const hasConfirmedAnswers = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'hasConfirmed',
                    message: `Create "${chalk.green(branchName)}" branch from "${chalk.magenta(fromBranch)}" on all configured repositories? ${chalk.red('Warning: This action cannot be undone.')}`,
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
                    username: config.auth.username,
                    password: config.auth.appPassword,
                },
            });

            for (const repo of repos) {

                const logProps = {
                    repo: repo,
                    branchName: branchName,
                    commitHash: '',
                    commitLink: '',
                    commitAuthor: '',
                    errorMessage: '',
                };

                let wasSuccessful = false;

                try {
                    const response = await axiosInstance.request({
                        method: 'post',
                        url:    `repositories/${repo}/refs/branches`,
                        data:   JSON.stringify({
                            name:   branchName,
                            target: {
                                hash: fromBranch,
                            },
                        }),
                    });

                    wasSuccessful = true;

                    const data = response.data;

                    logProps.commitHash = data.target.hash;
                    logProps.commitLink = data.target.links.html.href;
                    logProps.commitAuthor = data.target.author.raw;
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

                console.log((wasSuccessful ? getCreateBranchSuccessLog(logProps) : getCreateBranchErrorLog(logProps)) + '\n');
            }

        })
    ;

    program
        .command('delete')
        .description('Delete a branch on all configured repositories')
        .argument('<branchName>', 'Branch name to delete.')
        .action(async(branchName) => {
            if (!config) {
                console.log('Missing configuration file. Please run "init" command and try again.');
                return;
            }

            const repos = config.repos || [];

            if (repos.length === 0) {
                console.log('No repositories setup yet. Please run "repo add" command and try again.');
                return;
            }

            console.log('\n' + getDeleteBranchConfigLog({
                repos: repos,
                branchName: branchName,
            }) + '\n');

            const hasConfirmedAnswers = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'hasConfirmed',
                    message: `Delete "${chalk.red(branchName)}" branch on all configured repositories? ${chalk.red('Warning: This action cannot be undone.')}`,
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
                    username: config.auth.username,
                    password: config.auth.appPassword,
                },
            });

            for (const repo of repos) {

                const logProps = {
                    repo: repo,
                    branchName: branchName,
                    commitHash: '',
                    commitLink: '',
                    errorMessage: '',
                };

                let wasSuccessful = false;

                try {
                    await axiosInstance.request({
                        method: 'delete',
                        url:    `repositories/${repo}/refs/branches/${branchName}`,
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

                console.log((wasSuccessful ? getDeleteBranchSuccessLog(logProps) : getDeleteBranchErrorLog(logProps)) + '\n');
            }

        })
    ;

    return program;
};