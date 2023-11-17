module.exports = (api) => {
  api.cache.using(() => process.env.NODE_ENV);

  return {
    presets: [
      '@babel/preset-typescript',
      '@wordpress/babel-preset-default',
    ],
    plugins: [
      [
        "@wordpress/babel-plugin-makepot",
        {"output": "languages/vsge-mapbox-block.pot"}
      ]
    ]
  };
};
