module.exports = {
	"extends": "eslint:recommended",
	'env': {
		'node': true
	},
	'parserOptions': {
		'ecmaVersion': 8
	},
	'rules': {
		'eqeqeq': [ 'error' ],
		'indent': [ 'error', 'tab', { 'SwitchCase': 1 } ],
		'no-trailing-spaces': 'warn',
		'no-unused-vars': [ 'error', { 'vars': 'all', 'args': 'none', 'ignoreRestSiblings': true } ]
	}
};