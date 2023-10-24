import mapboxgl, { LngLatLike, MapEventType } from 'mapbox-gl';
import { MapBoxListing, MarkerHTMLElement } from '../../types';
import type { RefObject } from 'react';
import { getBbox } from '../../utils/spatialCalcs';
import { fitInView } from '../../utils/view';

export function createMarkerEl(
	markerEl: HTMLElement,
	listing: MapBoxListing,
	map: RefObject< mapboxgl.Map | null >
) {
	// Render a Marker Component on our new DOM node
	const markerElement = new mapboxgl.Marker( markerEl, {
		offset: [ 0, ( listing?.properties?.iconSize || 0 ) * -0.5 ],
		draggable: listing.properties.draggable, // if the icon is the clickable marker, it should be draggable
	} )
		.setLngLat(
			( listing?.geometry?.coordinates as LngLatLike ) || [ 0, 0 ]
		)
		.addTo( map.current );

	markerElement.on( 'dragend', ( event ) => {
		const lngLat = markerElement.getLngLat();
		// Update the marker's position
		markerElement.setLngLat( lngLat );
	} );

	return markerElement;
}

/**
 * Removes temporary markers from the specified element.
 *
 * @param                             listings
 * @param {RefObject<HTMLDivElement>} maboxRef        - The reference to the HTMLDivElement
 * @param                             excludedMarkers
 * @return {void} This function does not return anything
 */
export function removeTempMarkers(
	listings: MapBoxListing[],
	maboxRef: RefObject< HTMLDivElement > | undefined,
	excludedMarkers: string[] = []
): MapBoxListing[] {
	if ( maboxRef?.current ) {
		// get the markers from the map
		const markers = maboxRef?.current.querySelectorAll(
			'.marker-temp'
		) as NodeListOf< HTMLElement >;
		// Loop through the markers and remove them
		markers.forEach( ( marker ) => {
			// Check if the marker is excluded
			if (
				excludedMarkers.length === 0 &&
                marker?.dataset?.markerName &&
				! excludedMarkers.includes( marker.dataset?.markerName )
			) {
				// Remove the marker from the listings array
				if ( listings[ Number( marker.dataset.id ) ] )
					delete listings[ Number( marker.dataset.id ) ];
				// Remove the marker from the DOM
				marker?.remove();
			}
		} );
	}

	return listings;
}

/**
 * Removes temporary listings from the given list of MapBoxListings.
 *
 * @param {MapBoxListing[]} listings - The list of MapBoxListings to remove temporary listings from.
 * @return {MapBoxListing[]} The updated list of MapBoxListings without temporary listings.
 */
export function removeTempListings( listings: MapBoxListing[] ) {
	return listings.filter( ( listing ) => {
		return listing.type !== 'Temp';
	} );
}

/**
 * This function removes a marker from a map using its ID.
 *
 * @param {number}         id         - The `id` parameter is a number that represents the unique identifier of a
 *                                    marker that needs to be removed from a map.
 * @param {HTMLDivElement} mapElement - The map element to remove the marker from.
 */
export function removeMarkerEl(
	id: number,
	mapElement: HTMLDivElement
): boolean {
	const targetMarker = mapElement.querySelector( '#marker-' + id );
	if ( targetMarker ) {
		targetMarker?.remove();
		return true;
	}
	return false;
}
/**
 * Updates the listings on the map.
 * @param filteredStores - The filtered listings.
 * @param map
 * @param map.current
 * @param mapRef
 */
export function updateCamera(
	filteredStores: MapBoxListing[],
	map: RefObject< mapboxgl.Map | null >,
	mapRef: RefObject< HTMLDivElement > | undefined
): void {
	if ( ! map ) return;

	// if filtered listings are present
	if ( filteredStores?.length ) {
		if ( filteredStores?.length === 2 ) {
			/**
			 * Adjust the map camera:
			 * Get a bbox that contains both the geocoder result and
			 * the closest store. Fit the bounds to that bbox.
			 */
			const bbox = getBbox(
				filteredStores[ 0 ].geometry,
				filteredStores[ 1 ].geometry
			);

			map?.cameraForBounds( bbox, {
				padding: 50,
			} );
		} else {
			fitInView( map, filteredStores, mapRef );
		}
		return;
	}
	fitInView( map, filteredStores, mapRef );
}
