// Filter the type of reseller with the select in the top bar
import { flyToStore } from './view';
import { addPopup, removePopup } from '../components/Mapbox/Popup';
import mapboxgl from 'mapbox-gl';
import { MapBoxListing } from '../types';
import { highlightListing } from '../components/Mapbox/utils';

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

export function enableListing(
	map: mapboxgl.Map,
	marker: MapBoxListing,
	mapRef: any
) {
	console.log( 'Listing enabled', marker );

	// 1. Fly to the point
	flyToStore( map, marker );

	// 2. Close all other popups and display popup for clicked store
	removePopup( mapRef );
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
