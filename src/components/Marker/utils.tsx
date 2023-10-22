import mapboxgl, { LngLatLike, MapEventType } from 'mapbox-gl';
import { MapBoxListing } from '../../types';
import type { RefObject } from 'react';
import { getBbox } from '../../utils/spatialCalcs';
import { fitInView } from '../../utils/view';

export function createMarkerEl(
	markerEl: HTMLElement,
	listing: MapBoxListing,
	map: mapboxgl.Map
) {
	// Render a Marker Component on our new DOM node
	const markerElement = new mapboxgl.Marker( markerEl, {
		offset: [ 0, ( listing?.properties?.iconSize || 0 ) * -0.5 ],
		draggable: listing.properties.draggable, // if the icon is the clickable marker, it should be draggable
	} )
		.setLngLat(
			( listing?.geometry?.coordinates as LngLatLike ) || [ 0, 0 ]
		)
		.addTo( map );

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
 * @param {RefObject<HTMLDivElement>} maboxRef        - The reference to the HTMLDivElement
 * @param                             excludedMarkers
 * @return {void} This function does not return anything
 */
export function removeTempMarkers(
	maboxRef: RefObject< HTMLDivElement > | undefined,
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
				marker?.dataset?.markerName &&
				excludedMarkers.includes( marker?.dataset?.markerName )
			)
				return;
			// Remove the marker
			marker?.remove();
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

/**
 * This function removes a marker from a map using its ID.
 *
 * @param {number}         id         - The `id` parameter is a number that represents the unique identifier of a
 *                                    marker that needs to be removed from a map.
 * @param {HTMLDivElement} mapElement - The map element to remove the marker from.
 */
export function removeMarkerEl( id: number, mapElement: HTMLDivElement ) {
	mapElement.querySelector( '#marker-' + id )?.parentElement?.remove();
}
/**
 * Updates the listings on the map.
 * @param filteredStores - The filtered listings.
 * @param map
 * @param mapRef
 */
export function updateCamera(
	filteredStores: MapBoxListing[],
	map: mapboxgl.Map,
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
