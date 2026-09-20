import type mapboxgl from 'mapbox-gl';
import type { MapBoxListing } from '../types';

/**
 * Reads a cookie value by name in browser environments safely.
 *
 * @param name The name of the cookie to read.
 * @return The cookie string value, or null if not found.
 */
export function getCookie( name: string ): string | null {
	if ( typeof document === 'undefined' || ! document.cookie ) {
		return null;
	}
	const match = document.cookie.match(
		new RegExp(
			`(?:^|;\\s*)${ name.replace(
				/[.*+?^${}()|[\\]\\]/g,
				'\\$&'
			) }=([^;]*)`
		)
	);
	return match ? decodeURIComponent( match[ 1 ] ).trim() : null;
}

/**
 * Resolves preferred country code according to strict verified precedence:
 * 1. vsge_region cookie from vsge-language-switcher (normalized 2-letter uppercase country code)
 * 2. Browser locale region from navigator.languages / navigator.language (e.g. 'it-IT' -> 'IT')
 * 3. null (fallback to block default viewport)
 *
 * @return Uppercase 2-letter ISO country code, or null if no valid preference detected.
 */
export function getPreferredCountryCode(): string | null {
	// 1. Explicit country/region stored in vsge_region cookie by vsge-language-switcher
	const regionCookie = getCookie( 'vsge_region' );
	if ( regionCookie ) {
		const normalized = regionCookie.trim().toUpperCase();
		if ( /^[A-Z]{2}$/.test( normalized ) ) {
			return normalized;
		}
	}

	// 2. Browser locale region fallback (e.g. it-IT -> IT, fr-FR -> FR)
	if ( typeof navigator !== 'undefined' ) {
		const locales =
			Array.isArray( navigator.languages ) && navigator.languages.length
				? navigator.languages
				: [ navigator.language ];

		for ( const locale of locales ) {
			if ( typeof locale === 'string' ) {
				const match = locale.match( /[-_]([A-Za-z]{2})(?:[-_]|$)/ );
				if ( match && match[ 1 ] ) {
					return match[ 1 ].toUpperCase();
				}
			}
		}
	}

	return null;
}

/**
 * Finds dealers matching the preferred 2-letter country code.
 * Matches listing.properties.countryCode primarily.
 * Only falls back to listing.properties.country if its value is demonstrably a valid 2-letter code.
 *
 * @param listings Active map listings.
 * @param countryCode Target 2-letter ISO country code.
 * @return Array of listings situated in the target country.
 */
export function getMatchingCountryDealers(
	listings: MapBoxListing[],
	countryCode: string
): MapBoxListing[] {
	if ( ! countryCode || ! Array.isArray( listings ) ) {
		return [];
	}
	const target = countryCode.toUpperCase();
	return listings.filter( ( listing ) => {
		const code = listing.properties?.countryCode?.trim().toUpperCase();
		if ( code && code === target ) {
			return true;
		}
		const country = listing.properties?.country?.trim().toUpperCase();
		if ( country && /^[A-Z]{2}$/.test( country ) && country === target ) {
			return true;
		}
		return false;
	} );
}

/**
 * Fixed bounds for default Europe overview [southwest [lng, lat], northeast [lng, lat]]
 * Conceptually covering [-12, 34] to [35, 72].
 */
export const DEFAULT_EUROPE_BOUNDS: [
	[ number, number ],
	[ number, number ],
] = [
	[ -12, 34 ],
	[ 35, 72 ],
];

/**
 * Fits the map to the default Europe overview bounds.
 *
 * @param map     Mapbox GL JS map instance.
 * @param padding Optional padding in pixels.
 */
export function fitEuropeViewport( map: mapboxgl.Map, padding = 20 ): void {
	if ( ! map || typeof map.fitBounds !== 'function' ) {
		return;
	}
	map.fitBounds( DEFAULT_EUROPE_BOUNDS, {
		padding,
	} );
}
