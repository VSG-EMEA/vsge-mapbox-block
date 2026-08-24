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
				style: {
					...defaultConfig.optimization.splitChunks.cacheGroups.style,
					name( _, chunks, cacheGroupKey ) {
						const namedChunk = chunks.find(
							( chunk ) => chunk.name
						);
						return namedChunk
							? `${ path.dirname(
									namedChunk.name
							  ) }/${ cacheGroupKey }-${ path.basename(
									namedChunk.name
							  ) }`
							: cacheGroupKey;
					},
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
