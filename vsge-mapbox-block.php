<?php
/**
 * Plugin Name: vsge-mapbox-block
 * Version: 0.1.0
 * Description: VSGE - mapbox block
 * Author:            codekraft
 * Text Domain:       vsge-mapbox-block
 * Domain Path:       /languages
 */
define('VSGE_MB_PLUGIN_DIR', __DIR__);
define('VSGE_MB_PLUGIN_URL', plugin_dir_url(__FILE__));

/* Adding actions to the init hook. */
add_action('init', function () {
	register_block_type(VSGE_MB_PLUGIN_DIR . '/build');
}
);

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
 * The mapbox block frontend scripts.
 *
 * @return void
 */
function vsge_mapbox_block_scripts(): void {
	echo '<script id="vsge-mapbox-block-data">var mapboxBlockData = ' . json_encode(array('siteurl' => get_option('siteurl'), 'accessToken' => vsge_get_token(), 'language' => get_locale())) . ' </script>';
}
add_action('wp_footer', 'vsge_mapbox_block_scripts');
add_action('admin_footer', 'vsge_mapbox_block_scripts');
