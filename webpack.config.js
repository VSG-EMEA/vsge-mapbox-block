const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		'mapbox-block': path.resolve( process.cwd(), `src/index.tsx` ),
		'mapbox-frontend': path.resolve( process.cwd(), `src/frontend.tsx` ),
	},
  optimization: {
    ...defaultConfig.optimization,
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
