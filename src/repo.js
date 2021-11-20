import { Command } from 'commander';

export const makeRepoCommand = (config) => {
    const program = new Command();

    program
        .name('repo')
        .description('List repositories.')
    ;

    program
        .command('list')
        .description('List all configured repositories.')
        .action(() => {
            const repositories = (config.repositories || []);

            if (repositories.length === 0) {
                console.log('No repositories added yet. Run "create-config" to setup the configuration file and add repositories.');
                return;
            }

            repositories.forEach((repo) => {
                console.log(repo);
            });
        })
    ;

    return program;
};