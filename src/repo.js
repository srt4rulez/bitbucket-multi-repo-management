import { Command } from 'commander';
import fs from 'fs';
import logSymbols from 'log-symbols';

export const makeRepoCommand = (config, configFileLocation) => {
    const program = new Command();

    program
        .name('repo')
        .description('Add, remove and list repositories.')
    ;

    program
        .command('add')
        .description('Add a new repository to the list.')
        .argument('<repository>', 'Repository name you\'d like to add. This should include the user/org.')
        .action((repository) => {
            if (!config) {
                console.log('Missing configuration file. Please run "init" command and try again.');
                return;
            }

            config.repos = config.repos || [];

            const hasExistingRepo = config.repos.some((repo) => repo === repository);

            if (hasExistingRepo) {
                console.log(`${logSymbols.warning} Repository "${repository}" is already added, skipping.`);
                return;
            }

            config.repos.push(repository);

            fs.writeFileSync(configFileLocation, JSON.stringify(config));

            console.log(`${logSymbols.success} Repository "${repository}" successfully added.`);
        })
    ;

    program
        .command('remove')
        .description('Remove an existing repository from the list.')
        .argument('<repository>', 'Repository name you\'d like to add. This should include the user/org.')
        .action((repository) => {
            if (!config) {
                console.log('Missing configuration file. Please run "init" command and try again.');
                return;
            }

            config.repos = config.repos || [];

            const hasExistingRepo = config.repos.some((repo) => repo === repository);

            if (!hasExistingRepo) {
                console.log(`Repository "${repository}" doesn't exist, skipping.`);
                return;
            }

            config.repos = config.repos.filter((repo) => repo !== repository);

            fs.writeFileSync(configFileLocation, JSON.stringify(config));

            console.log(`Repository "${repository}" successfully removed.`);
        })
    ;

    program
        .command('list')
        .description('List all existing repositories.')
        .action(() => {

            const repos = (config.repos || []);

            if (repos.length === 0) {
                console.log('No repositories added yet. Try adding one with "repo add <repository>"');
                return;
            }

            repos.forEach((repo) => {
                console.log(repo);
            });
        })
    ;

    return program;
};