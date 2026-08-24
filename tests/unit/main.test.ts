import { describe, expect, test } from '@jest/globals';
import type { MapBoxListing } from '../../src/types';
import {
	getMapStyleUrl,
	getNextId,
	isValidCoordinates,
	normalizeMapboxLanguage,
	paginateListings,
	searchListings,
	toFeatureCollection,
	updateListingById,
} from '../../src/utils/dataset';

function dealer( id: number ): MapBoxListing {
	return {
		id,
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [ id % 180, id % 90 ] },
		properties: {
			name: `Dealer ${ id }`,
			company: id % 2 ? 'Example Garage' : 'VSGE Dealer',
			city: id % 2 ? 'Berlin' : 'Paris',
			country: id % 2 ? 'Germany' : 'France',
			countryCode: id % 2 ? 'DE' : 'FR',
			postalCode: String( 10000 + id ),
			icon: 'default',
			draggable: false,
		},
	};
}

describe( 'dealer dataset contract', () => {
	test( 'converts persisted listings to a valid FeatureCollection without changing listings', () => {
		const listings = [
			dealer( 1 ),
			{
				...dealer( 2 ),
				geometry: {
					type: 'Point',
					coordinates: [ 181, 0 ] as [ number, number ],
				},
			},
		];
		const collection = toFeatureCollection( listings );
		expect( collection ).toMatchObject( { type: 'FeatureCollection' } );
		expect( collection.features ).toHaveLength( 1 );
		expect( collection.features[ 0 ].id ).toBe( 1 );
		expect( listings ).toHaveLength( 2 );
	} );

	test( 'search, pagination, and update stay bounded and immutable for 500 dealers', () => {
		const listings = Array.from( { length: 500 }, ( _, index ) =>
			dealer( index + 1 )
		);
		const results = searchListings( listings, 'berlin', 'Germany' );
		expect( results ).toHaveLength( 250 );
		expect( paginateListings( results, 1, 25 ) ).toHaveLength( 25 );
		expect( paginateListings( results, 10, 25 ) ).toHaveLength( 25 );
		const updated = updateListingById( listings, {
			...listings[ 0 ],
			properties: { ...listings[ 0 ].properties, name: 'Saved dealer' },
		} );
		expect( updated[ 0 ].properties.name ).toBe( 'Saved dealer' );
		expect( listings[ 0 ].properties.name ).toBe( 'Dealer 1' );
	} );

	test( 'normalizes locale, styles, coordinates, and IDs compatibly', () => {
		expect( normalizeMapboxLanguage( 'it_IT' ) ).toBe( 'it' );
		expect( normalizeMapboxLanguage( 'not a locale' ) ).toBe( 'en' );
		expect( getMapStyleUrl( 'streets-v12' ) ).toBe(
			'mapbox://styles/mapbox/streets-v12'
		);
		expect( getMapStyleUrl( 'mapbox://styles/mapbox/streets-v12' ) ).toBe(
			'mapbox://styles/mapbox/streets-v12'
		);
		expect( isValidCoordinates( [ 0, 0 ] ) ).toBe( true );
		expect( isValidCoordinates( [ 0, 91 ] ) ).toBe( false );
		expect( getNextId( [ { id: 4 }, { id: 12 } ] ) ).toBe( 13 );
	} );
} );
