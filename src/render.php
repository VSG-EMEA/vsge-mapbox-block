<?php
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

echo preg_replace( '/^<div /', '<div ' . implode( ' ', $escaped_data_attributes ) . ' ', trim( $content ) );
