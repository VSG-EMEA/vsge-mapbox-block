// Filter the type of reseller with the select in the top bar
import { flyToStore } from './view';
import { addPopup, removePopups } from '../components/Popup/Popup';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import { MapBoxListing, MountedMapsContextValue } from '../types';
import { highlightListing } from '../components/Mapbox/utils';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { RefObject } from 'react';
import { SearchPopup } from '../components/Popup/PopupContent';
import { SEARCH_RESULTS_SHOWN } from '../constants';
import { useContext } from '@wordpress/element';
import { MapboxContext } from '../components/Mapbox/MapboxContext';

/**
 * The function prepares stores by assigning IDs to them and returning them as a geojson object.
 *
 * @param listings - The `listings` parameter is an array of `Feature` objects. It is used to create a
 *                 new object with a `type` property set to `'geojson'` and a `stores` property that is an array of the
 *                 same `Feature` objects with an added `id` property
 */
export const prepareStores = ( listings: any ) => ( {
	type: 'geojson',
	stores: listings,
} );

/**
 * The function filters stores based on selected tags and partnerships and populates the sidebar with
 * the filtered results.
 *
 * @param {Feature[]} stores - an array of store features, each of which is an object with properties such as
 *                           company, partnership, and location.
 * @param             terms
 * @return An array of strings that represent the keys of the partnerships in the input array.
 */
export function filterStores( stores, terms ) {
	const { searchResult, tag, partnership } = terms;

	// Filter the stores based on the selected terms
	const filteredStores = stores;

	return filteredStores;
}

/**
 * Enables the listing feature on the map.
 *
 * @param {mapboxgl.Map}  map      - The map object.
 * @param {MapBoxListing} marker   - The listing marker object.
 * @param                 listings
 */
export function enableListing(
	map: mapboxgl.Map,
	marker: MapBoxListing
) {
	console.log( 'Listing enabled', marker );

	// 1. Fly to the point
	flyToStore( map, marker );

	// 2. Close all other popups and display popup for clicked store
	addPopup( map, marker );

	// 3. Highlight listing in sidebar (and remove highlight for all other listings)
	highlightListing( marker );
}

/**
 * Given a JsonFeature array of objects, return the next ID to use
 *
 * @param {Object} arr the array of objects with a `id` property
 * @return {number} the next ID
 */
export function getNextId( arr: any ): number {
	return (
		arr?.reduce( ( max: number, obj: any ) => {
			return obj?.id > max ? obj.id : max;
		}, 0 ) + 1 ?? 0
	);
}

/**
 * Reorder the list of stores
 *
 * @param list       the list of stores
 * @param startIndex the index of the first item
 * @param endIndex   the index of the last item
 */
export const reorder = (
	list: Iterable< any > | ArrayLike< unknown >,
	startIndex: number,
	endIndex: number
): Iterable< unknown > | ArrayLike< unknown > => {
	const result = Array.from( list );
	const [ removed ] = result.splice( startIndex, 1 );
	result.splice( endIndex, 0, removed );

	return result;
};

/**
 * Generates the marker properties for a geocoder marker.
 *
 * @param {MapBoxListing[]} stores      - The list of stores to generate the marker properties for.
 * @param {LngLatLike}      coordinates - The coordinates for the marker.
 * @return {Object} The marker properties.
 */
export function geocoderMarkerProps(
	stores: MapBoxListing[],
	coordinates: LngLatLike
): MapBoxListing {
	return {
		type: 'temp',
		properties: {
			name: 'geocoder',
			icon: 'geocoder',
			draggable: true,
		},
		geometry: {
			type: 'Point',
			coordinates,
		},
	};
}

/**
 * Displays the nearest store and updates the filtered listings.
 *
 * @param {MapboxGeocoder.Result}     location            - The location object.
 * @param {MapBoxListing[]}           sortedNearestStores - The sorted list of nearest stores.
 * @param {MapBoxListing[]}           filteredListings    - The filtered list of listings.
 * @param {RefObject<HTMLDivElement>} mapRef              - The reference to the map container.
 * @param {mapboxgl.Map}              map                 - The map object.
 */
export function showNearestStore(
	location: MapboxGeocoder.Result,
	sortedNearestStores: MapBoxListing[],
	filteredListings: MapBoxListing[] | undefined,
	mapRef: RefObject< HTMLDivElement >,
	map: mapboxgl.Map
): MapBoxListing[] {
	const newFilteredListings: MapBoxListing[] = [
		...sortedNearestStores.slice( 0, SEARCH_RESULTS_SHOWN ),
	];

	removePopups( mapRef as RefObject< HTMLDivElement > );

	/* Open a popup for the closest store. */
	addPopup(
		map,
		location,
		<SearchPopup
			icon={ 'geocoder' }
			name={ location.text }
			category={ location.properties?.category }
			maki={ location.properties?.maki }
			draggable={ true }
		/>
	);

	/* Open a popup for the closest store. */
	addPopup( map, newFilteredListings[ 0 ] );

	/** Highlight the listing for the closest store. */
	mapRef?.current
		?.querySelector( '#marker-' + sortedNearestStores[ 1 ].id )
		?.classList.add( 'active' );

	return newFilteredListings;
}
