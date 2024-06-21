import { Coord, distance, Units } from '@turf/turf';
import { MapBoxListing, MapItem } from '../types';
import { LngLatBoundsLike } from 'mapbox-gl';

/**
 * This function takes a user's location and an array of stores, calculates the distance between the
 * user and each store, and returns the stores sorted by distance from the user.
 *
 * @param {Coord}     result      The result parameter is an object that represents the coordinates of a
 *                                location, typically obtained from a user's device or input.
 * @param {MapItem[]|null} storesArray is an array of objects representing stores, where
 *                                each object has a `geometry` property containing the coordinates of the store's location. The
 *                                function calculates the distance between the `result` coordinates and each store's location, and
 *                                adds a `distance` property to each store object with the
 * @param options - The options parameter is an object that contains the units of measurement for the
 * @return {MapItem[]} the sorted `storesArray` with each store's distance from the `result` location added as a
 * `distance` property to the store object.
 */
export function locateNearestStore(
	result: Coord,
	storesArray: MapBoxListing[] | null,
	options: { units: Units | undefined } = { units: 'kilometers' }
): MapBoxListing[] {
	if ( storesArray === null ) {
		return [];
	}

	storesArray = storesArray
		.filter( ( store ) => store.type === 'Feature' )
		.map( ( store ) => {
			delete store.properties.distance;
			Object.defineProperty( store.properties, 'distance', {
				value: distance( result, store.geometry as Coord, options ),
				writable: true,
				enumerable: true,
				configurable: true,
			} );
			return store;
		} );

	storesArray.sort( ( a, b ) => {
		if ( ! a.properties.distance || ! b.properties.distance ) {
			return -1;
		}
		if ( a.properties.distance > b.properties.distance ) {
			return 1;
		}
		if ( a.properties.distance < b.properties.distance ) {
			return -1;
		}
		return 0; // a must be equal to b
	} );

	console.log( storesArray );

	return storesArray;
}

/**
 * The function calculates the bounding box of a store and a given location.
 *
 * @param {Coord} listing1 - The first listing
 * @param {Coord} listing2 - The second listing
 * @return an array of two arrays, each containing two numbers representing the longitude and latitude
 * coordinates of a bounding box. The first array contains the coordinates of the lower left corner of
 * the bounding box, and the second array contains the coordinates of the upper right corner of the
 * bounding box.
 */
export function getBbox(
	listing1: { type?: string; coordinates: any },
	listing2: { type?: string; coordinates: any }
): LngLatBoundsLike {
	const lats = [ listing1.coordinates[ 1 ], listing2.coordinates[ 1 ] ];

	const lng = [ listing1.coordinates[ 0 ], listing2.coordinates[ 0 ] ];

	const sortedLong = lng.sort( function ( a, b ) {
		if ( a > b ) {
			return 1;
		}
		if ( a.distance < b.distance ) {
			return -1;
		}
		return 0;
	} );
	const sortedLats = lats.sort( function ( a, b ) {
		if ( a > b ) {
			return 1;
		}
		if ( a.distance < b.distance ) {
			return -1;
		}
		return 0;
	} );
	return [
		[ sortedLong[ 0 ], sortedLats[ 0 ] ],
		[ sortedLong[ 1 ], sortedLats[ 1 ] ],
	];
}

/**
 * Removes the "distance" property from each listing in the provided array.
 *
 * @param {MapBoxListing[]} filteredListings - The array of listings to remove the "distance" property from.
 * @return {MapBoxListing[]} The updated array of listings without the "distance" property.
 */
export function clearListingsDistances(
	filteredListings: MapBoxListing[]
): MapBoxListing[] {
	return filteredListings?.map( ( listing ) => {
		delete listing.properties.distance;
		return listing;
	} );
}
