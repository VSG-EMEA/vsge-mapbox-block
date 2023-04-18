import { Coord, distance, Feature, Units } from '@turf/turf';
import { MapItem } from '../types';

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

export function getBbox(
	sortedStores: Feature[],
	storeIdentifier: any,
	results: Coord
) {
	console.log( sortedStores[ storeIdentifier ].geometry );

	const lats = [
		sortedStores[ storeIdentifier ].geometry.coordinates[ 1 ],
		results.coordinates[ 1 ],
	];

	const lons = [
		sortedStores[ storeIdentifier ].geometry.coordinates[ 0 ],
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
