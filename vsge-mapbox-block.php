<?php
/**
 * Plugin Name: vsge-mapbox-block
 * Version: 1.1.3
 * Description: VSGE - mapbox block
 * Author: codekraft
 * Text Domain: vsge-mapbox-block
 * Domain Path: /languages
 */
define('VSGE_MB_PLUGIN_DIR', __DIR__);
define('VSGE_MB_PLUGIN_URL', \plugin_dir_url(__FILE__));

/**
 * Loads the text domain for the vsge-mapbox-block plugin.
 */
function vsge_mapbox_block_i18n() {
	\load_plugin_textdomain( 'vsge-mapbox-block', false, VSGE_MB_PLUGIN_DIR . '/languages' );
}
\add_action( 'init', 'vsge_mapbox_block_i18n' );

/**
 * Get the MapBox token from the already defined constants and return it.
 *
 * @return string
 */
function vsge_get_token(): string
{
	if (defined('MAPBOX_TOKEN')) {
		return \apply_filters('vsge_mapbox_block_key', MAPBOX_TOKEN);
	}
	return 'no token provided';
}

add_action('init', function () {
	register_block_type(VSGE_MB_PLUGIN_DIR . '/build', [
		"script" => "vsge-mapbox-vendor",
		"viewScript" => "vsge-mapbox-frontend",
		"editorScript" => "vsge-mapbox-editor",
	]);
});

add_action('enqueue_block_assets', function () {

	$fe_assets = include VSGE_MB_PLUGIN_DIR . '/build/frontend.asset.php';
	$editor_assets = include VSGE_MB_PLUGIN_DIR . '/build/editor.asset.php';
	$vendor_assets = include VSGE_MB_PLUGIN_DIR . '/build/vendor.asset.php';

	wp_register_script(
		'vsge-mapbox-vendor',
		VSGE_MB_PLUGIN_URL . 'build/vendor.js',
		$vendor_assets['dependencies'],
		$vendor_assets['version']
	);

	wp_localize_script('vsge-mapbox-vendor',
		'mapboxBlockData',
		array(
			'siteurl' => get_option('siteurl'),
			'accessToken' => vsge_get_token(),
			'language' => get_locale()
		)
	);

	wp_register_script(
		'vsge-mapbox-frontend',
		VSGE_MB_PLUGIN_URL . 'build/frontend.js',
		$fe_assets['dependencies'],
		$fe_assets['version']
	);

	wp_set_script_translations( 'vsge-mapbox-frontend', 'vsge-mapbox-block', VSGE_MB_PLUGIN_DIR . '/languages' );

	wp_register_script(
		'vsge-mapbox-editor',
		VSGE_MB_PLUGIN_URL . 'build/editor.js',
		$editor_assets['dependencies'],
		$editor_assets['version']
	);

	wp_set_script_translations( 'vsge-mapbox-editor', 'vsge-mapbox-block', VSGE_MB_PLUGIN_DIR . '/languages' );
});

