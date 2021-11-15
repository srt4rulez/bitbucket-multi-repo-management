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

You should now have `bitbucket-multi-repo-management` available as a global executable.

Run it without any commands to see the help page:

```bash
bitbucket-multi-repo-management
```

## Usage

### Configuration Setup

Run the `init` command to setup your bitbucket username and app password.

```bash
bitbucket-multi-repo-management init
```

> **Note**: Do not use your own bitbucket password. Instead, create an "app password" with **repositories read and write** access.
> More info here on creating app passwords: https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/

Once finished, a config file will be created at `~/.bitbucket-multi-repo-management.json`. You can edit this file anytime
to change any configuration manually.

### Adding / Removing Repositories

Next, add one or more repositories you'd like to manage via `repo add`:

```bash
bitbucket-multi-repo-management repo add <organization/repository-slug>
```

You must add the full repository name, which includes the organization or user and the repository slug.
This must be a repository your account has access to.

As well, to remove a repository, run `repo remove`:

```bash
bitbucket-multi-repo-management repo remove <organization/repository-slug>
```

### Listing Configured Repositories

Run `repo list` to view all the repositories you'd added so far:

```bash
bitbucket-multi-repo-management repo list
```

### Creating + Deleting Branches

Run `branch create` or `branch delete` to manage branches on all repositories.

```bash
bitbucket-multi-repo-management branch create <fromBranch> <branchName>
bitbucket-multi-repo-management branch delete <branchName>
```

You will see your list of repositories, and some action information with a prompt to confirm before
the action is executed.

### Creating + Deleting Tags

Run `tag create` and `tag delete` to manage tags on all repositories.

```bash
bitbucket-multi-repo-management tag create <fromBranchOrHash> <tagName>
# Or interactively with semver suggested versions based on the current version:
bitbucket-multi-repo-management tag create --interactive

bitbucket-multi-repo-management tag delete <tagName>
```
