module.exports = {
    'env': {
        'browser': true,
        'commonjs': true,
        'es2021': true
    },
    'extends': [
        'eslint:recommended',
        'plugin:node/recommended',
        'plugin:promise/recommended',
    ],
    'parserOptions': {
        'ecmaVersion': 12
    },
    'plugins': [
        'promise',
    ],
    'rules': {
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        'brace-style': [
            'error',
            '1tbs'
        ],
        'comma-spacing': [
            'error',
            {
                'before': false,
                'after': true
            }
        ],
        'func-call-spacing': [
            'error',
            'never'
        ],
        'key-spacing': [
            'error',
            {
                'mode': 'minimum'
            }
        ],
        'keyword-spacing': [
            'error'
        ],
        'lines-between-class-members': [
            'error'
        ],
        'new-parens': [
            'error'
        ],
        'no-lonely-if': [
            'error'
        ],
        'no-multiple-empty-lines': [
            'error',
            {
                'max': 1
            }
        ],
        'spaced-comment': [
            'error',
            'always'
        ],
        'semi-spacing': [
            'error'
        ],
        'space-unary-ops': [
            'error'
        ],
        'space-infix-ops': [
            'error'
        ],
        'space-in-parens': [
            'error'
        ],
        'space-before-function-paren': [
            'error',
            'never'
        ],
        'space-before-blocks': [
            'error'
        ],
        'no-unneeded-ternary': [
            'error'
        ],
        'no-trailing-spaces': [
            'error'
        ],
        'no-var': [
            'error'
        ],
        'id-length': [
            'error',
            {
                'exceptions': [
                    'i',
                    't'
                ]
            }
        ],
        'dot-notation': [
            'error'
        ],
        'curly': [
            'error'
        ],
    }
};
