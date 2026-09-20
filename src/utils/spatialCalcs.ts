import distance from '@turf/distance';
import type { Coord, Units } from '@turf/helpers';
import { MapBoxListing } from '../types';

/**
 * This function takes a user's location and an array of stores, calculates the distance between the
 * user and each store, and returns the stores sorted by distance from the user.
 *
 * @param {Coord}          result        The result parameter is an object that represents the coordinates of a
 *                                       location, typically obtained from a user's device or input.
 * @param {MapItem[]|null} storesArray   is an array of objects representing stores, where
 *                                       each object has a `geometry` property containing the coordinates of the store's location. The
 *                                       function calculates the distance between the `result` coordinates and each store's location, and
 *                                       adds a `distance` property to each store object with the
 * @param                  options       - The options parameter is an object that contains the units of measurement for the
 * @param                  options.units
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

	return storesArray
		.filter( ( store ) => store.type === 'Feature' )
		.map( ( store ) => ( {
			...store,
			properties: {
				...store.properties,
				distance: distance( result, store.geometry as Coord, options ),
			},
		} ) )
		.sort( ( a, b ) => {
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
		const { distance: _distance, ...properties } = listing.properties;
		return { ...listing, properties };
	} );
}
