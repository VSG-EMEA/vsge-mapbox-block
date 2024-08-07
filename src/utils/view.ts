import mapboxgl from 'mapbox-gl';
import { MapBoxListing } from '../types';
import { MARKER_TYPE_TEMP } from '../constants';

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
 * Filter the listings based on the provided filteredIds.
 *
 * @param {MapBoxListing[]} listings    - The array of listings to filter.
 * @param {number[] | null} filteredIds - The array of filtered ids or null.
 * @return {MapBoxListing[]} - The filtered array of listings.
 */
export function filterListings(
	listings: MapBoxListing[],
	filteredIds: number[] | null
): MapBoxListing[] {
	// Filter the listings based on the provided filteredIds
	return filteredIds
		? listings.filter( ( listing ) => {
				return ( filteredIds as number[] )?.includes( listing.id );
		  } )
		: listings;
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
 * The function fits the map view to the bounds of filtered stores with a padding of 10% of the map
 * container's width.
 *
 * @param {mapboxgl.Map}    map      The map object is an instance of the Mapbox GL JS map that is being used to display the
 *                                   map.
 * @param {MapBoxListing[]} listings filteredStores is an array of features representing the stores that need to
 *                                   be displayed on the map.
 * @param                   mapRef   The map reference is an instance of the Mapbox GL JS map that is being used to display the map.
 */
export function fitInView(
	map: mapboxgl.Map,
	listings: MapBoxListing[],
	mapRef: HTMLDivElement
) {
	if ( ! map || ! mapRef ) {
		return;
	}

	const bounds = new mapboxgl.LngLatBounds();
	let padding = 0;

	padding = mapRef.offsetWidth * 0.1;

	if ( listings.length !== 0 ) {
		listings.forEach( ( point ) => {
			bounds.extend( point.geometry.coordinates );
		} );

		if (
			bounds._sw.lat === bounds._ne.lat &&
			bounds._sw.lng === bounds._ne.lng
		) {
			const lat = bounds._sw.lat;
			const lng = bounds._sw.lng;
			bounds._sw.lat = lat + 0.5;
			bounds._ne.lat = lat - 0.5;
			bounds._sw.lng = lng + 0.5;
			bounds._ne.lng = lng - 0.5;
		}

		map.fitBounds( bounds, { padding } );
	}

	map.resize();
}

/**
 * Retrieves the current temp pin data from the provided array of listings.
 *
 * @param {MapBoxListing[]} listings - The array of listings to search.
 * @return {MapBoxListing | undefined} The current temp pin data, or undefined if not found.
 */
export function getTheCurrentTempPin(
	listings: MapBoxListing[]
): MapBoxListing | undefined {
	// get the current temp pin data
	const currentPinData = listings?.find( ( listing ) => {
		return listing.type === MARKER_TYPE_TEMP;
	} );

	if ( ! currentPinData ) {
		// eslint-disable-next-line no-console
		console.error( 'currentPinData not found' );
		return;
	}
	return currentPinData;
}
