<?php
/**
 * Plugin Name: vsge-mapbox-block
 * Version: 0.0.1
 * Description: VSGE - mapbox block
 * Author:            codekraft
 * Text Domain:       vsgemap
 */
define( 'VSGE_MB_PLUGIN_DIR', __DIR__ );
define( 'VSGE_MB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/* Adding actions to the init hook. */
add_action( 'init', function () {
	register_block_type( VSGE_MB_PLUGIN_DIR, array(
		'render_callback'     => 'add_attributes_to_block'
	) );
	}
);

/**
 * This function is used to add attributes to the block.
 *
 * Copied from WooCommerce Blocks
 *
 * @param array $attributes the attributes
 * @param string $content the content
 *
 * @return array|string|null the modified content (some "data-" will be added to the root div) or null
 */
function add_attributes_to_block( $attributes = [], $content = '' ) {
	$escaped_data_attributes = [];

	foreach ( $attributes as $key => $value ) {
		if ( is_bool( $value ) ) {
			$value = $value ? 'true' : 'false';
		}
		if ( ! is_scalar( $value ) ) {
			$value = wp_json_encode( $value );
		}
		$escaped_data_attributes[] = 'data-' . esc_attr( strtolower( preg_replace( '/(?<!\ )[A-Z]/', '-$0', $key ) ) ) . '="' . esc_attr( $value ) . '"';
	}

	return preg_replace( '/^<div /', '<div ' . implode( ' ', $escaped_data_attributes ) . ' ', trim( $content ) );
}

/**
 * Get the MapBox token from the already defined constants and return it.
 *
 * @return string
 */
function vsge_get_token(): string {
	if (defined('MAPBOX_TOKEN')) {
		return apply_filters('vsge_mapbox_block_key', MAPBOX_TOKEN);
	}
	return 'no token provided';
}

/**
 * Add Mapbox scripts and the related default values.
 *
 * @return void
 */
function vsge_mapbox_frontend_scripts(): void {
	$asset = include VSGE_MB_PLUGIN_DIR . '/build/mapbox-frontend.asset.php';

	wp_register_script(
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
add_action( 'wp_enqueue_scripts', 'vsge_mapbox_frontend_scripts' );

/**
 * The mapbox block frontend scripts.
 *
 * @return void
 */
function vsge_mapbox_block_scripts(): void {
	$asset = include VSGE_MB_PLUGIN_DIR . '/build/mapbox.asset.php';

	wp_register_script(
		'vsge-mapbox-block',
		VSGE_MB_PLUGIN_URL . 'build/mapbox.js',
		$asset['dependencies'],
		$asset['version'],
		true
	);

	wp_localize_script(
		'vsge-mapbox-block',
		'mapboxBlockData',
		array(
			'siteUrl'      => get_option( 'siteurl' ),
			'accessToken'  => vsge_get_token(),
			'locale'       => get_locale()
		)
	);
}
add_action( 'enqueue_block_editor_assets', 'vsge_mapbox_block_scripts' );
