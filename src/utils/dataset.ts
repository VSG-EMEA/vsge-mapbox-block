// Filter the type of reseller with the select in the top bar
import { Feature } from '@turf/turf';
import { flyToStore } from './view';
import { highlightListing, MarkerPopup } from '../components/Mapbox/Popup';

/**
 * The function prepares stores by assigning IDs to them and returning them as a geojson object.
 *
 * @param listings - The `listings` parameter is an array of `Feature` objects. It is used to create a
 *                 new object with a `type` property set to `'geojson'` and a `stores` property that is an array of the
 *                 same `Feature` objects with an added `id` property
 */
export const prepareStores = ( listings ) => ( {
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

export function enableListing( map, marker ) {
	// 1. Fly to the point
	flyToStore( map, marker );

	// 2. Close all other popups and display popup for clicked store
	MarkerPopup( marker );

	// 3. Highlight listing in sidebar (and remove highlight for all other listings)
	highlightListing( marker );
}
