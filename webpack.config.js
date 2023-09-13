const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		'mapbox': path.resolve( process.cwd(), `src/index.tsx` ),
		'mapbox-frontend': path.resolve( process.cwd(), `src/components/Mapbox/Frontend.tsx` ),
	},
	module: {
		rules: [
			{
				test: /\.[tjmc]sx?$/,
				use: [ 'babel-loader' ],
				exclude: /node_modules/,
			},
		],
		...defaultConfig.module,
	},
};
