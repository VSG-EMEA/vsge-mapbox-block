import { Coord, distance, Feature, Units } from '@turf/turf';
import { MapItem } from '../types';

/**
 * This function takes a user's location and an array of stores, calculates the distance between the
 * user and each store, and returns the stores sorted by distance from the user.
 *
 * @param {Coord}     result      The result parameter is an object that represents the coordinates of a
 *                                location, typically obtained from a user's device or input.
 * @param {MapItem[]} storesArray is an array of objects representing stores, where
 *                                each object has a `geometry` property containing the coordinates of the store's location. The
 *                                function calculates the distance between the `result` coordinates and each store's location, and
 *                                adds a `distance` property to each store object with the
 * @return {MapItem[]} the sorted `storesArray` with each store's distance from the `result` location added as a
 * `distance` property to the store object.
 */
export function locateNearestStore( result: Coord, storesArray: MapItem[] ) {
	const options: { units: Units | undefined } = { units: 'kilometers' };

	storesArray.forEach( function ( store ) {
		store.distance = {
			value: distance( result, store.geometry as Coord, options ),
			writable: true,
			enumerable: true,
			configurable: true,
		};
	} );

	storesArray.sort( ( a, b ) => {
		if ( a.distance > b.distance ) {
			return 1;
		}
		if ( a.distance < b.distance ) {
			return -1;
		}
		return 0; // a must be equal to b
	} );

	return storesArray;
}

/**
 * The function calculates the bounding box of a store and a given location.
 *
 * @param {Feature[]} sortedStores    - An array of features representing sorted stores.
 * @param {any}       id - storeIdentifier is a variable that represents the index of a specific
 *                                    store in an array of stores (sortedStores). It is used to access the geometry coordinates of that
 *                                    store in order to calculate the bounding box.
 * @param {Coord}     results         - The `results` parameter is an object that contains the coordinates of a
 *                                    location.
 * @return an array of two arrays, each containing two numbers representing the longitude and latitude
 * coordinates of a bounding box. The first array contains the coordinates of the lower left corner of
 * the bounding box, and the second array contains the coordinates of the upper right corner of the
 * bounding box.
 */
export function getBbox(
	sortedStores: Feature[],
	id: number,
	results: Coord
) {
	console.log( sortedStores[ id ].geometry );

	const lats = [
		sortedStores[ id ].geometry.coordinates[ 1 ],
		results.coordinates[ 1 ],
	];

	const lons = [
		sortedStores[ id ].geometry.coordinates[ 0 ],
		results.coordinates[ 0 ],
	];

	const sortedLons = lons.sort( function ( a, b ) {
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
		[ sortedLons[ 0 ], sortedLats[ 0 ] ],
		[ sortedLons[ 1 ], sortedLats[ 1 ] ],
	];
}
