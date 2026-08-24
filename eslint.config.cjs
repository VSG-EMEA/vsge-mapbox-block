const wordpressConfig = require( '@wordpress/scripts/config/eslint.config.cjs' );

module.exports = [
	...wordpressConfig,
	{
		files: [ '**/*.{js,jsx,ts,tsx}' ],
		rules: {
			'prettier/prettier': [ 'error', { endOfLine: 'auto' } ],
			'jsdoc/check-param-names': 'off',
			'jsdoc/no-undefined-types': 'off',
			'jsdoc/require-param': 'off',
			'jsdoc/valid-types': 'off',
			'no-alert': 'off',
		},
	},
];
