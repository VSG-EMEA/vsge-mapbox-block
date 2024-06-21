import mapboxgl, { LngLatLike } from 'mapbox-gl';
import { MapBoxListing } from '../../types';
import type { RefObject } from 'react';
import { getBbox } from '../../utils/spatialCalcs';
import { fitInView } from '../../utils/view';
import { MARKER_TYPE_TEMP } from '../../constants';

export function createMarkerEl(
	markerEl: HTMLElement,
	listing: MapBoxListing,
	map: RefObject< mapboxgl.Map >
) {
	if ( ! map.current ) {
		return;
	}
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
	maboxRef: HTMLDivElement,
	excludedMarkers: string[] = []
): MapBoxListing[] {
	// get the markers from the map
	const markers = maboxRef?.querySelectorAll(
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
			if ( listings[ Number( marker.dataset.id ) ] ) {
				delete listings[ Number( marker.dataset.id ) ];
			}
			// Remove the marker from the DOM
			marker?.remove();
		}
	} );

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
		return listing.type !== MARKER_TYPE_TEMP;
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
 * Adjusts the camera view on the map to include the filtered listings.
 *
 * @param {MapBoxListing[]}                  filteredStores - An array of filtered store listings.
 * @param {RefObject<mapboxgl.Map | null>}   map            - A React ref object containing the map instance.
 * @param {RefObject<HTMLDivElement | null>} mapRef         - A React ref object containing the map's DOM element.
 */
export function updateCamera(
	filteredStores: MapBoxListing[],
	map: RefObject< mapboxgl.Map | null >,
	mapRef: RefObject< HTMLDivElement | null >
): void {
	if ( ! map.current || ! mapRef.current ) {
		return;
	}

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

			map?.current?.cameraForBounds( bbox, {
				padding: 50,
			} );
		} else {
			fitInView( map.current, filteredStores, mapRef.current );
		}
		return;
	}
	fitInView( map.current, filteredStores, mapRef.current );
}
