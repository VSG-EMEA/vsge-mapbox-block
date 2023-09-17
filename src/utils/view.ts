import mapboxgl from 'mapbox-gl';
import { Feature } from '@turf/turf';
import { MapBoxListing } from '../types';

/**
 * The function recenterView takes a map and default values and flies the map to the default center and
 * zoom.
 *
 * @param {mapboxgl.Map} map      - The map object that we want to recenter.
 * @param {Object}       defaults - `defaults` is an object that contains default values for the center coordinates
 *                                and zoom level of a map. It has the following properties:
 * @return The `recenterView` function is returning a call to the `flyTo` method of the `map` object
 * with an object argument containing the `center` and `zoom` properties.
 */
export function recenterView( map, defaults ) {
	return map.flyTo( {
		center: [ defaults.latitude, defaults.longitude ],
		zoom: defaults.zoom,
	} );
}

/**
 * The function flyToStore takes in a map, coordinates, and an optional zoom level and flies the map to
 * the specified location.
 *
 * @param                  map         - The mapboxgl.Map object that represents the map instance on which the flyToStore
 *                                     function will be called.
 * @param {CoordinatesDef} coordinates - The coordinates parameter is a variable that represents the
 *                                     latitude and longitude of a location on a map. It is used to set the center of the map when the
 *                                     flyToStore function is called.
 * @param                  store
 * @param {number}         [zoom=8]    - The zoom parameter is a number that determines the level of zoom for the
 *                                     map. A higher number means the map will be more zoomed in, while a lower number means the map will
 *                                     be more zoomed out. The default value for zoom in this function is 8.
 * @return The `flyToStore` function is returning the result of calling the `flyTo` method on the
 * `map` object with the provided `coordinates` and `zoom` level. The `flyTo` method animates the map
 * to a new location and zoom level.
 */
export function flyToStore(
	map: mapboxgl.Map,
	store: MapBoxListing,
	zoom: number = 8
) {
	if ( store?.geometry?.coordinates )
		return map.flyTo( {
			center: store.geometry.coordinates,
			zoom,
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
	const tempListings = filteredIds
		? listings.filter( ( listing ) => {
				return ( filteredIds as number[] )?.includes( listing.id );
		  } )
		: listings;

	return tempListings;
}

/**
 * Filters the given list of MapBox listings based on a specified criteria.
 *
 * @param {MapBoxListing[]} listings - The list of MapBox listings to filter.
 * @param {string}          by       - The criteria to filter the listings by.
 * @param {string}          term     - The value to compare against the listings.
 * @return {MapBoxListing[]} The filtered list of MapBox listings.
 */
export function filterListingsBy(
	listings: MapBoxListing[],
	by: string,
	term: string
): MapBoxListing[] {
	let filteredListings: MapBoxListing[] = [];

	filteredListings = listings.filter( ( listing: MapBoxListing ) => {
		if ( typeof listing.properties?.[ by ] === 'object' ) {
			return listing.properties?.[ by ].includes( term );
		}
		return listing.properties?.[ by ] === term;
	} );

	console.log( filteredListings );

	return filteredListings;
}

/**
 * The function fits the map view to the bounds of filtered stores with a padding of 10% of the map
 * container's width.
 *
 * @param {mapboxgl.Map} map      The map object is an instance of the Mapbox GL JS map that is being used to display the
 *                                map.
 * @param {Feature[]}    listings filteredStores is an array of features representing the stores that need to
 *                                be displayed on the map.
 */
export function fitInView( map, listings ) {
	const bounds = new mapboxgl.LngLatBounds();
	const mapContainer = document.getElementById( 'map-container' );
	if ( mapContainer ) {
		const padding = mapContainer.offsetWidth * 0.1;

		console.log( bounds );

		if ( listings.length !== 0 ) {
			listings.forEach( ( point: Feature ) => {
				bounds.extend( point.geometry.coordinates );
			} );

			if (
				bounds.sw.lat === bounds.ne.lat &&
				bounds.sw.lng === bounds.ne.lng
			) {
				const lat = parseFloat( bounds.sw.lat );
				const lng = parseFloat( bounds.sw.lng );
				bounds.sw.lat = lat + 0.5;
				bounds.ne.lat = lat - 0.5;
				bounds.sw.lng = lng + 0.5;
				bounds.ne.lng = lng - 0.5;
			}
			map.fitBounds( bounds, { padding } );
		}

		map.resize();
	}
}
