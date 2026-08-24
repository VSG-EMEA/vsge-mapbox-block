<?php
/**
 * Plugin Name: vsge-mapbox-block
 * Version: 1.1.4
 * Description: VSGE - mapbox block
 * Author: codekraft
 * Text Domain: vsge-mapbox-block
 * Domain Path: /languages
 */
defined( 'ABSPATH' ) || exit;

defined( 'VSGE_MB_PLUGIN_DIR' ) || define( 'VSGE_MB_PLUGIN_DIR', __DIR__ );
defined( 'VSGE_MB_PLUGIN_URL' ) || define( 'VSGE_MB_PLUGIN_URL', \plugin_dir_url( __FILE__ ) );
const VSGE_MB_TOKEN_OPTION = 'vsge_mapbox_access_token';

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
function vsge_get_token(): string {
	if ( defined( 'MAPBOX_TOKEN' ) && is_string( MAPBOX_TOKEN ) && MAPBOX_TOKEN !== '' ) {
		return (string) \apply_filters( 'vsge_mapbox_block_key', MAPBOX_TOKEN );
	}

	return (string) \apply_filters(
		'vsge_mapbox_block_key',
		(string) \get_option( VSGE_MB_TOKEN_OPTION, '' )
	);
}

function vsge_mapbox_sanitize_token( $token ): string {
	$token = is_string( $token ) ? trim( \wp_unslash( $token ) ) : '';
	// Do not wipe a saved public token when an administrator leaves the field blank.
	return $token === '' ? (string) \get_option( VSGE_MB_TOKEN_OPTION, '' ) : \sanitize_text_field( $token );
}

function vsge_mapbox_register_settings(): void {
	\register_setting(
		'vsge_mapbox_settings',
		VSGE_MB_TOKEN_OPTION,
		array(
			'type'              => 'string',
			'sanitize_callback' => 'vsge_mapbox_sanitize_token',
			'default'           => '',
		)
	);
	\add_settings_section( 'vsge_mapbox_token', __( 'Mapbox configuration', 'vsge-mapbox-block' ), '__return_empty_string', 'vsge-mapbox' );
	\add_settings_field( 'vsge_mapbox_access_token', __( 'Mapbox public access token', 'vsge-mapbox-block' ), 'vsge_mapbox_token_field', 'vsge-mapbox', 'vsge_mapbox_token' );
}
\add_action( 'admin_init', 'vsge_mapbox_register_settings' );

function vsge_mapbox_token_field(): void {
	if ( defined( 'MAPBOX_TOKEN' ) && MAPBOX_TOKEN !== '' ) {
		echo '<p>' . esc_html__( 'Configured by wp-config.php. The saved option is not used while this constant is defined.', 'vsge-mapbox-block' ) . '</p>';
		return;
	}
	echo '<input class="regular-text" type="text" name="' . esc_attr( VSGE_MB_TOKEN_OPTION ) . '" value="" placeholder="' . esc_attr__( 'Saved token is hidden', 'vsge-mapbox-block' ) . '" autocomplete="off" />';
	echo '<p class="description">' . esc_html__( 'Leave blank to retain the saved token.', 'vsge-mapbox-block' ) . '</p>';
}

function vsge_mapbox_add_settings_page(): void {
	\add_options_page( __( 'VSGE Mapbox', 'vsge-mapbox-block' ), __( 'VSGE Mapbox', 'vsge-mapbox-block' ), 'manage_options', 'vsge-mapbox', 'vsge_mapbox_render_settings_page' );
}
\add_action( 'admin_menu', 'vsge_mapbox_add_settings_page' );

function vsge_mapbox_render_settings_page(): void {
	if ( ! \current_user_can( 'manage_options' ) ) {
		return;
	}
	$has_constant = defined( 'MAPBOX_TOKEN' ) && MAPBOX_TOKEN !== '';
	$has_option   = (string) \get_option( VSGE_MB_TOKEN_OPTION, '' ) !== '';
	$source       = $has_constant ? __( 'wp-config.php constant', 'vsge-mapbox-block' ) : ( $has_option ? __( 'WordPress option', 'vsge-mapbox-block' ) : __( 'Not configured', 'vsge-mapbox-block' ) );
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'VSGE Mapbox', 'vsge-mapbox-block' ); ?></h1>
		<p><?php echo esc_html( sprintf( __( 'Effective source: %s', 'vsge-mapbox-block' ), $source ) ); ?></p>
		<p><?php echo esc_html( $has_constant || $has_option ? __( 'Configuration status: configured', 'vsge-mapbox-block' ) : __( 'Configuration status: not configured', 'vsge-mapbox-block' ) ); ?></p>
		<form action="options.php" method="post">
			<?php \settings_fields( 'vsge_mapbox_settings' ); \do_settings_sections( 'vsge-mapbox' ); \submit_button(); ?>
		</form>
	</div>
	<?php
}

function vsge_mapbox_register_block_assets(): void {
	$frontend_assets = include VSGE_MB_PLUGIN_DIR . '/build/frontend.asset.php';
	$editor_assets   = include VSGE_MB_PLUGIN_DIR . '/build/editor.asset.php';
	$defaults        = array(
		'siteurl'     => \get_option( 'siteurl' ),
		'accessToken' => vsge_get_token(),
		'language'    => \get_locale(),
	);

	\wp_register_script(
		'vsge-mapbox-frontend',
		VSGE_MB_PLUGIN_URL . 'build/frontend.js',
		$frontend_assets['dependencies'],
		$frontend_assets['version'],
		true
	);
	\wp_localize_script( 'vsge-mapbox-frontend', 'mapboxBlockData', $defaults );
	\wp_set_script_translations( 'vsge-mapbox-frontend', 'vsge-mapbox-block', VSGE_MB_PLUGIN_DIR . '/languages' );

	\wp_register_script(
		'vsge-mapbox-editor',
		VSGE_MB_PLUGIN_URL . 'build/editor.js',
		$editor_assets['dependencies'],
		$editor_assets['version'],
		true
	);
	\wp_localize_script( 'vsge-mapbox-editor', 'mapboxBlockData', $defaults );
	\wp_set_script_translations( 'vsge-mapbox-editor', 'vsge-mapbox-block', VSGE_MB_PLUGIN_DIR . '/languages' );

	\register_block_type( VSGE_MB_PLUGIN_DIR . '/build' );
}
\add_action( 'init', 'vsge_mapbox_register_block_assets', 20 );

