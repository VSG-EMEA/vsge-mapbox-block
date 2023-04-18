// Filter the type of reseller with the select in the top bar
import { createPopUp, removePopup } from './popups';
import { LngLatBoundsLike } from 'mapbox-gl';
import { PartnershipDef } from '../types';
import { Feature } from '@turf/turf';
import { getBbox, locateNearestStore } from './spatialCalcs';
import { addMarkers, renderListings } from './map';

/**
 * The function prepares stores by assigning IDs to them and returning them as a geojson object.
 *
 * @param listings - The `listings` parameter is an array of `Feature` objects. It is used to create a
 *                 new object with a `type` property set to `'geojson'` and a `stores` property that is an array of the
 *                 same `Feature` objects with an added `id` property
 */
export const prepareStores = ( listings ) => ( {
	type: 'geojson',
	stores: listings.map( ( store: Feature, i: number ) => {
		return ( store.id = i );
	} ),
} );

/**
 * The function filters stores based on selected tags and partnerships and populates the sidebar with
 * the filtered results.
 *
 * @param {Feature}     searchResult - It is not clear what the data type of `searchResult` is from the given code
 *                                   snippet. It is likely a variable that contains the result of a search query, possibly a geocoding
 *                                   result or a user input.
 * @param {Feature[]}   stores       - an array of store features, each of which is an object with properties such as
 *                                   company, partnership, and location.
 * @param {HTMLElement} listings     - `listings` is a DOM element that represents the sidebar where the filtered results
 *                                   will be displayed. It is used in the `renderListings` function to populate the sidebar with the
 *                                   filtered results.
 * @return An array of strings that represent the keys of the partnerships in the input array.
 */
export function filterStores( searchResult, stores, listings ) {
	let filteredStores = [];
	/** The tag select element */
	const selectBoxType = document.getElementById(
		'filter-by-tag'
	) as HTMLSelectElement | null;

	if ( selectBoxType ) {
		const selectedType =
			selectBoxType.options[ selectBoxType.selectedIndex ].value !== ''
				? selectBoxType.options[ selectBoxType.selectedIndex ].value
				: '';

		const selectBoxPartner = document.getElementById(
			'filter-by-partnership'
		) as HTMLSelectElement | null;
		const selectedPartner =
			selectBoxPartner?.options[ selectBoxPartner.selectedIndex ]
				.value !== ''
				? selectBoxPartner?.options[ selectBoxPartner.selectedIndex ]
						.value
				: '';

		let filtered;

		if ( selectedType || selectedPartner ) {
			// Filter visible features that don't match the input value.
			filtered = stores.filter(
				( feature ) =>
					( feature.properties.company[ selectedType ] > 0 ||
						selectedType === '' ) &&
					( feature.properties.partnership[ selectedPartner ] > 0 ||
						selectedPartner === '' )
			);

			filteredStores = filtered;
		} else {
			filteredStores = stores;
		}

		if ( searchResult ) {
			filteredStores = locateNearestStore( searchResult, filteredStores );

			while ( listings?.firstChild ) {
				listings.removeChild( listings.firstChild );
			}

			// Populate the sidebar with filtered results
			renderListings( filteredStores );
			markers = addMarkers( markers, filteredStores );
			/* Open a popup for the closest store. */
			createPopUp( filteredStores[ 0 ] );

			/** Highlight the listing for the closest store. */
			document
				.getElementById( 'feature-listing' )
				?.classList.remove( 'filtered' );
			const activeListing = document.getElementById(
				'listing-' + filteredStores[ 0 ].id
			);
			activeListing?.classList.add( 'active-store' );

			/**
			 * Adjust the map camera:
			 * Get a bbox that contains both the geocoder result and
			 * the closest store. Fit the bounds to that bbox.
			 */
			const bbox = getBbox(
				filteredStores,
				0,
				searchResult
			) as LngLatBoundsLike;

			map.fitBounds( bbox, {
				padding: 100,
			} );
		}

		return filteredStores;
	}

	removePopup();

	// Populate the sidebar with filtered results
	renderListings( filteredStores );
	markers = addMarkers( markers, filteredStores );
	document
		.getElementById( 'feature-listing' )
		?.classList.remove( 'filtered' );

	fitView();
}

/**
 * The function takes in a partnership definition and returns an array of partnership keys or names.
 *
 * @param {PartnershipDef} partnerships - Partnerships is an array of PartnershipDef objects.
 * @return an array of strings that represent the keys of the partnerships in the input array.
 */
export function getPartnership( partnerships: PartnershipDef ) {
	return partnerships.forEach( ( partner ) => partner || partner.key );
}
