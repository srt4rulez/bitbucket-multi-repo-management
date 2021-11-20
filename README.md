# bitbucket-multi-repo-management

A node.js console application that manages multiple git repositories in Bitbucket Cloud via the Bitbucket API.

This tool was created namely for creating branches and tags on multiple repositories without having to clone them locally. 
While this tool only calls a few Bitbucket API endpoints, there's no reason it couldn't be expanded to add more functionality.

## Getting Started

Install globally via npm:

```bash
npm install -g @srt4rulez/bitbucket-multi-repo-management
```

or yarn:

```bash
yarn global add @srt4rulez/bitbucket-multi-repo-management
```

You should now have `bmrm` available as a global executable.

Run it without any commands to see the help page:

```bash
bmrm
```

### Auth Configuration

Run the `init` command to setup your bitbucket username and app password.

```bash
bmrm init
```

> **Note**: Do not use your own bitbucket password. Instead, create an "app password" with **repositories read and write** access.
> More info here on creating app passwords: https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/

Once finished, a config file will be created at `~/.bmrm-auth.json`. You can edit this file anytime
to change any configuration manually.

### Configuration

Create a `.bmrm.json` file or run `bmrm create-config` to create a file for you.

```json
{
    "repositories": [
        "organization/the-best-repository",
        "organization/awesome-repository"
    ]
}
```

The following fields are valid in the configuration file:

#### `repositories`

An array of bitbucket repositories you'd like to run commands on. This should be the full name of the repository,
include the organization / user account.

#### `versionPrefix`

A prefix for versioning (eg "v"). 

When using the `tag create --interactive` command, a version prefix can be added to tags automatically.

#### `prereleaseIdentifier`

If following [semver](https://semver.org/), and using the `tag create --interactive` command, this will be the pre-release 
suffix that can be generated for release versions (eg "alpha", "beta", "rc", etc).

---

You can also create a config file in any of these formats:

```
package.json -- as a "bmrm" key
.bmrm
.bmrm.json
.bmrm.yaml
.bmrm.yml
.bmrm.js
.bmrm.cjs
bmrm.config.js
bmrm.config.cjs
```

We use [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) to load these different files, checkout that library
for more information.

## Usage

### Listing Configured Repositories

Run `repo list` to view all the repositories you'd added so far:

```bash
bmrm repo list
```

### Creating + Deleting Branches

Run `branch create` or `branch delete` to manage branches on all repositories.

```bash
bmrm branch create <fromBranch> <branchName>
bmrm branch delete <branchName>
```

You will see your list of repositories, and some action information with a prompt to confirm before
the action is executed.

### Creating + Deleting Tags

Run `tag create` and `tag delete` to manage tags on all repositories.

```bash
bmrm tag create <fromBranchOrHash> <tagName>
# Or interactively with semver suggested versions based on the current version:
bmrm tag create --interactive

bmrm tag delete <tagName>
```
