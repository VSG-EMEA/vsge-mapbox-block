import mapboxgl from 'mapbox-gl';
import { MapBoxListing } from '../types';
import { isValidCoordinates } from './dataset';

/**
 * The function recenterView takes a map and default values and flies the map to the default center and
 * zoom.
 *
 * @param {mapboxgl.Map} map                - The map object that we want to recenter.
 * @param {Object}       defaults           - `defaults` is an object that contains default values for the center coordinates
 *                                          and zoom level of a map. It has the following properties:
 * @param                defaults.latitude
 * @param                defaults.longitude
 * @param                defaults.zoom
 * @return The `recenterView` function is returning a call to the `flyTo` method of the `map` object
 * with an object argument containing the `center` and `zoom` properties.
 */
export function recenterView(
	map: mapboxgl.Map,
	defaults: {
		latitude: number;
		longitude: number;
		zoom?: number;
	}
): any {
	return map.flyTo( {
		center: [ defaults.latitude, defaults.longitude ],
		zoom: defaults.zoom ?? 10,
	} );
}

/**
 * The function flyToStore takes in a map, coordinates, and an optional zoom level and flies the map to
 * the specified location.
 *
 * @param          map      - The mapboxgl.Map object that represents the map instance on which the flyToStore
 *                          function will be called.
 * @param          store
 * @param {number} [zoom=8] - The zoom parameter is a number that determines the level of zoom for the
 *                          map. A higher number means the map will be more zoomed in, while a lower number means the map will
 *                          be more zoomed out. The default value for zoom in this function is 8.
 * @return The `flyToStore` function is returning the result of calling the `flyTo` method on the
 * `map` object with the provided `coordinates` and `zoom` level. The `flyTo` method animates the map
 * to a new location and zoom level.
 */
export function flyToStore(
	map: mapboxgl.Map,
	store: MapBoxListing,
	zoom: number = 8
) {
	if ( store?.geometry?.coordinates ) {
		return map?.flyTo( {
			center: store.geometry.coordinates,
			zoom,
		} );
	}
	recenterView( map, {
		latitude: store.geometry.coordinates[ 1 ],
		longitude: store.geometry.coordinates[ 0 ],
	} );
}

/**
 * Filters the given list of MapBox listings based on a specified criteria.
 *
 * @param {MapBoxListing[]}             listings     - The list of MapBox listings to filter.
 * @param {tag: string; filter: string} terms        - The value to compare against the listings.
 * @param                               terms.tag    - The tag to filter the listings by.
 * @param                               terms.filter - The filter to filter the listings by.
 * @return {MapBoxListing[]} The filtered list of MapBox listings.
 */
export function filterListingsBy(
	listings: MapBoxListing[],
	terms: { tag: string; filter: string }
): MapBoxListing[] {
	const { tag = '', filter = '' } = terms;

	return listings.filter( ( listing: MapBoxListing ) => {
		if ( listing.properties ) {
			if ( tag ) {
				if ( listing.properties.itemTags?.includes( tag ) ) {
					return true;
				}
			}
			if ( filter ) {
				if ( listing.properties.itemFilters?.includes( filter ) ) {
					return true;
				}
			}
		}
		return false;
	} );
}

/**
 * Fits the map view to the bounds of the provided listings with padding relative
 * to the actual Mapbox canvas/container.
 *
 * @param {mapboxgl.Map}        map      - The Mapbox GL JS map instance.
 * @param {MapBoxListing[]}     listings - Array of listings to fit.
 * @param {HTMLElement | null} [mapRef]  - Optional map container fallback.
 */
export function fitInView(
	map: mapboxgl.Map,
	listings: MapBoxListing[],
	mapRef?: HTMLElement | null
) {
	if ( ! map || ! Array.isArray( listings ) ) {
		return;
	}

	const validListings = listings.filter( ( listing ) =>
		isValidCoordinates( listing?.geometry?.coordinates )
	);

	// Zero results: safe no-op
	if ( validListings.length === 0 ) {
		return;
	}

	// Calculate padding relative to the actual Mapbox canvas/container
	const mapContainer = map.getContainer ? map.getContainer() : mapRef;
	const canvas = map.getCanvas ? map.getCanvas() : null;
	const width = canvas?.clientWidth || mapContainer?.clientWidth || 400;
	const height = canvas?.clientHeight || mapContainer?.clientHeight || 400;
	const padding = Math.max(
		20,
		Math.min( Math.floor( Math.min( width, height ) * 0.1 ), 50 )
	);

	// One result: center dealer with sensible conservative zoom
	if ( validListings.length === 1 ) {
		const coords = validListings[ 0 ].geometry.coordinates as [
			number,
			number,
		];
		const currentZoom = map.getZoom ? map.getZoom() : 8;
		const targetZoom = Math.min( Math.max( currentZoom, 8 ), 10 );
		map.flyTo( {
			center: coords,
			zoom: targetZoom,
			padding: {
				top: padding,
				bottom: padding,
				left: padding,
				right: padding,
			},
		} );
		return;
	}

	// Multiple results: use public LngLatBounds APIs (no private _sw/_ne)
	const bounds = new mapboxgl.LngLatBounds();
	validListings.forEach( ( item ) => {
		bounds.extend( item.geometry.coordinates as [ number, number ] );
	} );

	if ( ! bounds.isEmpty() ) {
		map.fitBounds( bounds, {
			padding: {
				top: padding,
				bottom: padding,
				left: padding,
				right: padding,
			},
			maxZoom: 14,
		} );
	}

	if ( typeof map.resize === 'function' ) {
		map.resize();
	}
}
