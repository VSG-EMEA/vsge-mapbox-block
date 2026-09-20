import { MapBoxListing } from '../../types';
import { MARKER_TYPE_TEMP } from '../../constants';
import { safeSlug } from '../../utils';
import { DealerMarkerRegistry, removeDealerMarkersWhere } from './registry';

/**
 * Removes temporary markers from the specified element or authoritative registry.
 *
 * @param                                             listings
 * @param {HTMLElement | DealerMarkerRegistry | null} scopeOrRegistry - The reference to the container or authoritative registry
 * @param                                             excludedMarkers
 * @return {MapBoxListing[]} The updated list of listings
 */
export function removeTempMarkers(
	listings: MapBoxListing[],
	scopeOrRegistry?: HTMLElement | DealerMarkerRegistry | null,
	excludedMarkers: string[] = []
): MapBoxListing[] {
	if ( ! listings || ! Array.isArray( listings ) ) {
		return [];
	}

	// If an authoritative registry was provided, cleanly destroy matching resources
	if ( scopeOrRegistry instanceof Map ) {
		removeDealerMarkersWhere( scopeOrRegistry, ( resource ) => {
			const name = resource.listing.properties?.name || '';
			const safeName = safeSlug( name );
			return (
				resource.listing.type === MARKER_TYPE_TEMP &&
				! excludedMarkers.includes( name ) &&
				! excludedMarkers.includes( safeName )
			);
		} );
	}

	// Purely calculate which listings should remain without raw DOM manipulation
	return listings.filter( ( listing ) => {
		if ( listing.type !== MARKER_TYPE_TEMP ) {
			return true;
		}
		const name = listing.properties?.name || '';
		const safeName = safeSlug( name );
		if (
			excludedMarkers.includes( name ) ||
			excludedMarkers.includes( safeName )
		) {
			return true;
		}
		return false;
	} );
}
