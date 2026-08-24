const jestConfig = {
	verbose: true,
	preset: '@wordpress/jest-preset-default',
	modulePaths: [ '<rootDir>' ],
	testMatch: [ '<rootDir>/tests/unit/**/*.test.ts' ],
};

module.exports = jestConfig;
