<?php
/**
 * Plugin Name: VSGE - mapbox block
 * Plugin URI: https://github.com/erikyo/typescript-wp-block
 * Description: WordPress mapbox block
 * Version: 0.0.1
 * Author: codekraft
 */
define( 'VSGE_MB_PLUGIN_DIR', __DIR__ );
define( 'VSGE_MB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/* Adding actions to the init hook. */
add_action(
	'init',
	function() {
		register_block_type( VSGE_MB_PLUGIN_DIR );
	}
);

function vsge_get_token(): string {
	return apply_filters('vsge_mapbox_block_key', MAPBOX_TOKEN);
}

/**
 * Add Mapbox scripts and the related default values
 *
 * @return void
 */
function vsge_mapbox_frontend_scripts() {
	$asset = include VSGE_MB_PLUGIN_DIR . '/build/mapbox-frontend.asset.php';
	wp_enqueue_script(
		'vsge-mapbox-frontend',
		VSGE_MB_PLUGIN_URL . '/build/mapbox-frontend.js',
		$asset['dependencies'],
		$asset['version'],
		true
	);

	wp_localize_script(
		'vsge-mapbox-frontend',
		'mapboxBlockData',
		array(
			'siteUrl'      => get_option( 'siteurl' ),
			'accessToken'  => vsge_get_token(),
			'locale'       => get_locale()
		)
	);
}

function vsge_mapbox_block_scripts() {
	$asset = include VSGE_MB_PLUGIN_DIR . '/build/mapbox.asset.php';
	wp_enqueue_script(
		'vsge-mapbox-block',
		VSGE_MB_PLUGIN_URL . 'build/mapbox.js',
		$asset['dependencies'],
		$asset['version'],
		true
	);
}

add_action( 'wp_enqueue_scripts', 'vsge_mapbox_frontend_scripts' );
add_action( 'enqueue_block_assets', 'vsge_mapbox_frontend_scripts' );
add_action( 'enqueue_block_editor_assets', 'vsge_mapbox_block_scripts' );
