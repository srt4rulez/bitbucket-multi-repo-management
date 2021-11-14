#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { makeInitCommand } from './../src/init.js';
import { makeRepoCommand } from './../src/repo.js';
import { makeBranchCommand } from './../src/branch.js';
import { makeTagCommand } from './../src/tag.js';
import { URL } from 'url';

const __dirname = new URL('.', import.meta.url).pathname;

const program = new Command();

const configFileLocation = path.resolve(os.homedir(), '.bitbucket-multi-repo-management.json');

let config;

try {
    config = fs.readFileSync(configFileLocation);
    config = JSON.parse(config);
} catch (error) { // eslint-disable-line no-empty
}

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, './../package.json')));

program
    .name('bitbucket-multi-repo-management')
    .version(packageJson.version)
    .description('A node.js console application that manages multiple git repositories in Bitbucket Cloud via the Bitbucket API.')
;

program.addCommand(makeInitCommand(config, configFileLocation));
program.addCommand(makeRepoCommand(config, configFileLocation));
program.addCommand(makeBranchCommand(config, configFileLocation));
program.addCommand(makeTagCommand(config, configFileLocation));

program.parse();