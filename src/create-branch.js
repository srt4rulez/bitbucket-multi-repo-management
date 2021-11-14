import { Command } from 'commander';
import axios from 'axios';
import chalk from 'chalk';

const getSuccessLog = (props) => `
${chalk.black.bgGreenBright('SUCCESS')} ${chalk.yellow(props.repo)}
    Branch Name: ${props.branchName}
    Author: ${props.commitAuthor}
    Commit: ${props.commitHash}
    Commit Link: ${props.commitLink}
`.trim();

const getErrorLog = (props) => `
${chalk.white.bgRed('FAILURE')} ${chalk.yellow(props.repo)}
    ${chalk.red(props.errorMessage.trim())}
`.trim();

export const makeCreateBranchCommand = (config) => {
    const program = new Command();

    program
        .name('create-branch')
        .description('Create a branch on all repositories.')
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

                console.log((wasSuccessful ? getSuccessLog(logProps) : getErrorLog(logProps)) + '\n');
            }

        })
    ;

    return program;
};