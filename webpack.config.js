const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		frontend: './src/frontend.tsx',
		editor: './src/index.tsx',
	},
	module: {
		...defaultConfig.module,
		rules: [
			...defaultConfig.module.rules,
			{ test: /\.geojson$/, type: 'json' },
		],
	},
	optimization: {
		...defaultConfig.optimization,
		splitChunks: {
			...defaultConfig.optimization.splitChunks,
			cacheGroups: {
				...defaultConfig.optimization.splitChunks.cacheGroups,
				vendor: {
					test: /[\\/]node_modules[\\/](mapbox-gl|@mapbox|@turf)[\\/]/,
					name: 'vendor',
					chunks: 'all',
				},
			},
		},
	},
	externals: {
		react: 'react',
		'react-dom': 'reactDOM',
		'@wordpress/element': 'element',
	},
};
