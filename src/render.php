<?php
/**
 * Keep persisted block attributes intact while avoiding a multi-hundred-record
 * HTML data attribute. The payload is scoped to this block instance.
 */
$payload = wp_json_encode(
	$attributes,
	JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
);

if ( false === $payload ) {
	return;
}

$content = trim( $content );
$content = preg_replace(
	'/<\/div>\s*$/',
	'<script type="application/json" class="vsge-mapbox-data">' . $payload . '</script></div>',
	$content,
	1
);

echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wrapper and JSON are escaped above.
