import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { MapBoxListing } from '../../types';
import { isChildOf } from 'iso3166-helper';
/**
 * The geocoder entry context
 */
export type CurrentContext = {
	[ key: string ]: {
		id?: string;
		mapbox_id?: string;
		wikidata?: string;
		short_code: string;
		text?: string;
		language?: string;
	};
};

/**
 * Parse the geocoder results to get the context data
 *
 * @param searchResult The mapbox geocoder results
 */
export function getCurrentContext(
	searchResult: MapboxGeocoder.Result
): CurrentContext {
	// parse the current pointer area to get the country and the region
	const currentArea: CurrentContext = {};

	if ( searchResult.place_type.includes( 'region' ) ) {
		currentArea.region = {
			...( searchResult.properties as {
				mapbox_id: string;
				wikidata: string;
				short_code: string;
			} ),
			text: searchResult.text,
		};
	}
	// loop into context in order the search the entries that were holding the region and the country
	searchResult.context?.forEach( ( contextItem ) => {
		const id = contextItem.id.split( '.' );
		if ( id[ 0 ] === 'region' || id[ 0 ] === 'country' ) {
			currentArea[ id[ 0 ] ] = contextItem;
		}
	} );

	return currentArea;
}

/**
 * Filters the sorted stores and returns the results that are compatible with the context
 * @param currentRegion The geocoder current region
 * @param stores        the stores collection
 *
 * @return the filtered stores
 */
export function filterByPreferredArea(
	currentRegion: string,
	stores: MapBoxListing[]
): MapBoxListing[] {
	/** @member preferredStores the list of the stores that should be shown because related to the area of the search */
	const preferredStores: MapBoxListing[] = [];
	stores?.forEach( ( currentStore: MapBoxListing ) => {
		// the reseller preferred area
		const prefArea = currentStore.properties.preferredArea;
		if ( prefArea && prefArea.length ) {
			prefArea.forEach( ( contextEntry ) => {
				// check if the current position matches the reseller preferred area
				if ( isChildOf( currentRegion, contextEntry ) ) {
					preferredStores.push( currentStore );
				}
			} );
		}
	} );
	return preferredStores;
}
