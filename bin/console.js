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
import { cosmiconfigSync } from 'cosmiconfig';

const __dirname = new URL('.', import.meta.url).pathname;

const explorer = cosmiconfigSync('bmrm', {
    searchPlaces: [
        'package.json',
        '.bmrm',
        '.bmrm.json',
        '.bmrm.yaml',
        '.bmrm.yml',
        '.bmrm.js',
        '.bmrm.cjs',
        'bmrm.config.js',
        'bmrm.config.cjs',
    ],
});

const result = explorer.search() || {};

const config = result.config || {
    repositories: [],
    prereleaseIdentifier: undefined,
    versionPrefix: 'v',
};

const configLocation = result.filepath || '';

const authConfigFileLocation = path.resolve(os.homedir(), '.bmrm-auth.json');

let authConfig;

try {
    authConfig = JSON.parse(String(fs.readFileSync(authConfigFileLocation)));
} catch (error) { // eslint-disable-line no-empty
}

const packageJson = JSON.parse(String(fs.readFileSync(path.resolve(__dirname, './../package.json'))));

const program = new Command();

program
    .name('bmrm')
    .version(packageJson.version)
    .addHelpText('before', '\nBitbucket Multiple Repository Management\n')
    .addHelpText('after', result.config ? `\nLoaded configuration file: ${configLocation}` : '')
    .description('A node.js console application that manages multiple git repositories in Bitbucket Cloud via the Bitbucket API.')
    .addCommand(makeInitCommand(authConfig, authConfigFileLocation))
    .addCommand(makeRepoCommand(config))
    .addCommand(makeBranchCommand(authConfig, config))
    .addCommand(makeTagCommand(authConfig, config))
    .parse()
;