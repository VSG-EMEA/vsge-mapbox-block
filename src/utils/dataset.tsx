import type { FeatureCollection, Point } from 'geojson';
import type { CoordinatesDef, MapBoxListing } from '../types';

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

export function paginateListings< T >(
	items: T[],
	page: number,
	pageSize: number
): T[] {
	return items.slice( Math.max( 0, page - 1 ) * pageSize, page * pageSize );
}

export function normalizeMapboxLanguage( locale?: string ): string {
	const language = ( locale || 'en' ).replace( '_', '-' ).split( '-' )[ 0 ];
	return /^[a-z]{2,3}$/i.test( language ) ? language.toLowerCase() : 'en';
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
