// https://github.com/release-it/release-it

module.exports = {
    "hooks": {
        "after:bump": "yarn update:changelog",
    },
    "git": {
        "requireCommits": true,
    },
};
