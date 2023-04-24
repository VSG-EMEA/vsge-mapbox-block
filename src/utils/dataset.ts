// Filter the type of reseller with the select in the top bar
import { Feature } from '@turf/turf';

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
