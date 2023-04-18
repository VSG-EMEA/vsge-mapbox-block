// Filter the type of reseller with the select in the top bar
import { createPopUp, removePopup } from './popups';
import { LngLatBoundsLike } from 'mapbox-gl';
import {MapItem, PartnershipDef} from '../types';
import { Feature } from '@turf/turf';
import {getBbox, locateNearestStore} from './spatialCalcs';
import { addMarkers, renderListings } from './map';

export const prepareStores = ( listings ) => ( {
	type: 'geojson',
	stores: listings.map( ( store: Feature, i: number ) => {
		return ( store.id = i );
	} ),
} );

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

export function getPartnership( partnerships: PartnershipDef ) {
	const partnerTxt = [];
	partnerTxt = partnerships.forEach( ( partner ) => partner || partner.key );
	return partnerTxt;
}
