import mapboxgl, { LngLatLike, MapEventType } from 'mapbox-gl';
import { MapBoxListing } from '../../types';

export function createMarkerEl( markerEl, listing: MapBoxListing, map: mapboxgl.Map ) {
	// Render a Marker Component on our new DOM node
	const markerElement = new mapboxgl.Marker( markerEl, {
		offset: [ 0, ( listing?.properties?.iconSize || 0 ) * -0.5 ],
		draggable: listing.properties.draggable, // if the icon is the clickable marker, it should be draggable
	} )
		.setLngLat(
			( listing?.geometry?.coordinates as LngLatLike ) || [ 0, 0 ]
		)
		.addTo( map );

	markerElement.on( 'dragend', ( event: MapEventType ) => {
		const lngLat = markerElement.getLngLat();
		// Update the marker's position
		markerElement.setLngLat( lngLat );
	} );

	return markerElement;
}

/**
 * Removes temporary markers from the specified element.
 *
 * @param {React.RefObject<HTMLDivElement>} maboxRef        - The reference to the HTMLDivElement
 * @param                                   excludedMarkers
 * @return {void} This function does not return anything
 */
export function removeTempMarkers(
	maboxRef: React.RefObject< HTMLDivElement > | undefined,
	excludedMarkers: string[] = []
) {
	if ( maboxRef?.current ) {
		const markerTemp = maboxRef?.current.querySelectorAll(
			'.marker-temp'
		) as NodeListOf< HTMLElement >;
		markerTemp.forEach( ( marker ) => {
			// Check if the marker is excluded
			if (
				excludedMarkers.length &&
				excludedMarkers.includes( marker?.dataset?.markerName )
			)
				return;
			// Remove the marker
			marker.parentElement?.remove();
		} );
	}
}

/**
 * Removes temporary listings from the given list of MapBoxListings.
 *
 * @param {MapBoxListing[]} listings - The list of MapBoxListings to remove temporary listings from.
 * @return {MapBoxListing[]} The updated list of MapBoxListings without temporary listings.
 */
export function removeTempListings( listings: MapBoxListing[] ) {
	return listings.filter( ( listing ) => {
		return listing.type !== 'temp';
	} );
}
