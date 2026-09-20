import type { FeatureCollection, Point } from 'geojson';
import type { CoordinatesDef, MapBoxListing } from '../types';
import { MARKER_TYPE_TEMP } from '../constants';

/** A single, typed boundary between persisted listing data and Mapbox GeoJSON. */
export function toFeatureCollection(
	listings: MapBoxListing[]
): FeatureCollection< Point, MapBoxListing[ 'properties' ] > {
	return {
		type: 'FeatureCollection',
		features: listings
			.filter( ( listing ) =>
				isValidCoordinates( listing.geometry?.coordinates )
			)
			.map( ( listing ) => ( {
				type: 'Feature',
				id: listing.id,
				geometry: {
					type: 'Point',
					coordinates: listing.geometry.coordinates,
				},
				properties: listing.properties,
			} ) ),
	};
}

/**
 * Filters listings to only canonical dealers, excluding temporary markers.
 *
 * @param listings The listings array to filter.
 * @return Canonical dealer listings.
 */
export function getCanonicalDealerListings(
	listings: MapBoxListing[] | null | undefined
): MapBoxListing[] {
	if ( ! listings || ! Array.isArray( listings ) ) {
		return [];
	}
	return listings.filter( ( listing ) => {
		if ( ! listing ) {
			return false;
		}
		if (
			listing.type === MARKER_TYPE_TEMP ||
			listing.type === 'temporary' ||
			listing.properties?.name === 'click-marker' ||
			listing.properties?.name === 'geocoder-marker'
		) {
			return false;
		}
		return true;
	} );
}

/**
 * Dedicated boundary converting canonical dealer listings to a GeoJSON FeatureCollection.
 *
 * @param listings The listings array.
 * @return FeatureCollection containing only canonical dealer features.
 */
export function toDealerFeatureCollection(
	listings: MapBoxListing[] | null | undefined
): FeatureCollection< Point, MapBoxListing[ 'properties' ] > {
	return toFeatureCollection( getCanonicalDealerListings( listings ) );
}

export function isValidCoordinates(
	coordinates: unknown
): coordinates is CoordinatesDef {
	if ( ! Array.isArray( coordinates ) || coordinates.length !== 2 ) {
		return false;
	}
	const [ longitude, latitude ] = coordinates;
	return (
		typeof longitude === 'number' &&
		typeof latitude === 'number' &&
		Number.isFinite( longitude ) &&
		Number.isFinite( latitude ) &&
		longitude >= -180 &&
		longitude <= 180 &&
		latitude >= -90 &&
		latitude <= 90
	);
}

export function getNextId( listings: Array< { id: number } > ): number {
	return (
		listings.reduce(
			( maximum, listing ) => Math.max( maximum, listing.id || 0 ),
			0
		) + 1
	);
}

/**
 * Reorder an array by moving an item from startIndex to endIndex.
 *
 * @param list       The list of items to reorder.
 * @param startIndex The index of the item to move.
 * @param endIndex   The destination index.
 * @return New array with the item moved to the destination index.
 */
export function reorder< T >(
	list: T[],
	startIndex: number,
	endIndex: number
): T[] {
	if (
		startIndex < 0 ||
		startIndex >= list.length ||
		endIndex < 0 ||
		endIndex >= list.length ||
		startIndex === endIndex
	) {
		return list;
	}
	const result = Array.from( list );
	const [ removed ] = result.splice( startIndex, 1 );
	result.splice( endIndex, 0, removed );
	return result;
}

/**
 * Reorders listings by finding the source and target items by their unique IDs,
 * moving the source listing to the target listing's position in canonical listings
 * while preserving all other listings in their relative positions.
 *
 * @param listings Canonical array of listings.
 * @param sourceId The ID of the listing being moved.
 * @param targetId The ID of the target listing where the source should be placed.
 * @return New array of listings with the source listing moved.
 */
export function reorderListingsById(
	listings: MapBoxListing[],
	sourceId: number,
	targetId: number
): MapBoxListing[] {
	const sourceIndex = listings.findIndex( ( item ) => item.id === sourceId );
	const targetIndex = listings.findIndex( ( item ) => item.id === targetId );
	if (
		sourceIndex === -1 ||
		targetIndex === -1 ||
		sourceIndex === targetIndex
	) {
		return listings;
	}
	return reorder( listings, sourceIndex, targetIndex );
}

export function updateListingById(
	listings: MapBoxListing[],
	updatedListing: MapBoxListing
): MapBoxListing[] {
	return listings.map( ( listing ) =>
		listing.id === updatedListing.id ? updatedListing : listing
	);
}

export function searchListings(
	listings: MapBoxListing[],
	searchTerm: string,
	country = ''
): MapBoxListing[] {
	const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
	const normalizedCountry = country.trim().toLocaleLowerCase();
	return listings.filter( ( listing ) => {
		const properties =
			listing.properties || ( {} as MapBoxListing[ 'properties' ] );
		const matchesCountry =
			! normalizedCountry ||
			( properties.country || '' ).toLocaleLowerCase() ===
				normalizedCountry;
		if ( ! matchesCountry || ! normalizedSearch ) {
			return matchesCountry;
		}
		return [
			properties.name,
			properties.company,
			properties.city,
			properties.country,
			properties.countryCode,
			properties.postalCode,
		].some( ( value ) =>
			( value || '' ).toLocaleLowerCase().includes( normalizedSearch )
		);
	} );
}

export function normalizeMapboxLanguage( locale?: string ): string {
	const language = ( locale || 'en' ).replace( '_', '-' ).split( '-' )[ 0 ];
	return /^[a-z]{2}$/i.test( language ) ? language.toLowerCase() : 'en';
}

export function getMapStyleUrl( mapStyle: string ): string {
	if (
		mapStyle.startsWith( 'mapbox://' ) ||
		/^https?:\/\//.test( mapStyle )
	) {
		return mapStyle;
	}
	return `mapbox://styles/mapbox/${ mapStyle }`;
}

/**
 * Takes an array and a separator and returns a new array with the separator
 * interspersed between each element of the original array.
 *
 * @param {Array} elements - The array of elements to intersperse.
 * @return {Array} - The new array with the separator interspersed.
 */
export function intersperse( elements: JSX.Element[] ): Array< any > {
	return elements.reduce(
		( result, element, index ) => {
			if ( index === 0 ) {
				return [ element ];
			}
			return [ ...result, ', ', element ];
		},
		[] as ( JSX.Element | string )[]
	);
}
