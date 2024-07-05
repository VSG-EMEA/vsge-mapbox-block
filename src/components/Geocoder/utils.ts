import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { CoordinatesDef, MapBoxListing } from '../../types';
import { isChildOf } from 'iso3166-helper';
import { locateNearestStore } from '../../utils/spatialCalcs';
import { showNearestStore } from '../Popup';
import { SEARCH_RESULTS_SHOWN } from '../../constants';

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
	if ( ! searchResult ) {
		return {};
	}
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
 * @param currentContext        The geocoder current region
 * @param currentContext.region The geocoder current region
 * @param stores                the stores collection
 *
 * @return the filtered stores
 */
export function filterByPreferredArea(
	currentContext: CurrentContext,
	stores: MapBoxListing[]
): MapBoxListing[] {
	/** @member preferredStores the list of the stores that should be shown because related to the area of the search */
	const preferredStores: MapBoxListing[] = [];
	stores?.forEach( ( currentStore: MapBoxListing ) => {
		// the reseller preferred area
		const prefArea = currentStore.properties.preferredArea;
		if ( prefArea && prefArea.length ) {
			prefArea.forEach( ( storeRegion ) => {
				// check if the current position matches the reseller preferred area
				if (
					currentContext.region?.short_code &&
					( currentContext.region?.short_code === storeRegion ||
						isChildOf(
							currentContext?.region?.short_code,
							storeRegion
						) )
				) {
					preferredStores.push( currentStore );
				}
			} );
		}
	} );

	// if no preferred stores are found, search for the resellers in the same country
	if ( ! preferredStores.length ) {
		// loop for each store found
		stores?.forEach( ( currentStore: MapBoxListing ) => {
			// Get the reseller country code
			const storeCountry =
				currentStore?.properties?.countryCode.toLowerCase() ?? 'none';
			// Using the preferred area lookup for the country code
			const prefArea = currentStore.properties.preferredArea?.map(
				( area ) => {
					return area.split( '-' )[ 0 ].toLowerCase();
				}
			);

			// check if the current position matches the reseller preferred area
			if (
				currentContext.country.short_code === storeCountry ||
				( prefArea && prefArea.includes( storeCountry ) )
			) {
				preferredStores.push( currentStore );
			}
		} );
	}

	// return the collected preferred stores
	return preferredStores;
}

/**
 * Retrieves the nearest store based on the given result, map, listings, and optional myLocationPin.
 *
 * @param {MapboxGeocoder.Result} result - The result object from the Mapbox geocoder.
 * @param {HTMLDivElement} mapRef - The reference to the map container.
 * @param {mapboxgl.Map} map - The map object.
 * @param {MapBoxListing[]} listings - The list of stores.
 * @param {MapBoxListing} [myLocationPin] - The optional location pin.
 *
 * @return {MapBoxListing[]} The sorted list of nearest stores.
 */
export function getNearestStore(
	result: MapboxGeocoder.Result,
	mapRef: HTMLDivElement,
	map: mapboxgl.Map,
	listings: MapBoxListing[],
	myLocationPin?: MapBoxListing
): MapBoxListing[] {
	const currentArea = getCurrentContext( result );

	// locate the nearest store on the map
	const sortedNearestStores = locateNearestStore(
		result.geometry.coordinates as CoordinatesDef,
		listings
	)?.slice( 0, SEARCH_RESULTS_SHOWN );

	// filter results by preferred area
	const preferredStores = filterByPreferredArea(
		currentArea,
		sortedNearestStores
	);

	// if there are preferred stores, show them otherwise show the nearest store
	const sortedListings = preferredStores.length
		? preferredStores
		: sortedNearestStores;

	// then show the nearest store
	showNearestStore( myLocationPin, sortedListings, mapRef, map );

	return [ ...sortedListings ];
}
