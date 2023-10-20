import { createRoot } from '@wordpress/element';
import mapboxgl, { LngLatLike, MapEventType } from 'mapbox-gl';
import { Marker } from './Marker';
import { DefaultMarker, PinPoint } from './Pin';
import { MapBoxListing } from '../../types';
import { areValidCoordinates } from '../Sortable/utils';
import { safeSlug } from '../../utils';
import { getMarkerSvg, modifySVG } from '../../utils/svg';
import type { RefObject } from 'react';

function createMarkerEl( markerEl, listing: MapBoxListing, map: mapboxgl.Map ) {
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
 * This function adds a marker to a Mapbox map using a Marker Component rendered on a new DOM node.
 *
 *                                          including its geometry and properties.
 *                                          Mapbox map. It is used to add the marker to the map and set its position.
 * @param listing.listing
 * @param listing
 * @param map
 * @param mapRef
 * @param listings
 * @param markersRef
 * @param icons              - An array of MarkerIcon objects representing the icon set.
 * @param listing.listings
 * @param listing.map
 * @param listing.mapRef
 * @param listing.markersRef
 * @param listing.icons
 */
export function MapMarker( {
	listing,
	map,
	mapRef,
	markersRef,
	icons,
} ): JSX.Element {
	// Check if the coordinates are valid
	if (
		listing?.geometry &&
		areValidCoordinates(
			listing?.geometry?.coordinates as [ number, number ]
		)
	) {
		// Render a Marker Component on our new DOM node
		markersRef.current[ listing.id ] = null;
		markersRef.current[ listing.id ] = document.createElement( 'div' );
		markersRef.current[ listing.id ].className =
			'marker marker-' + safeSlug( listing.properties.name );
		const root = createRoot( markersRef.current[ listing.id ] );

		let markerIcon: JSX.Element | null;

		if ( listing.properties.icon?.startsWith( 'custom-' ) ) {
			const svgMarker = getMarkerSvg( listing.properties.icon, icons );
			markerIcon = modifySVG(
				svgMarker,
				listing.properties.iconColor,
				listing.properties.iconSize
			);
		} else if (
			[ 'geocoder', 'pin' ].includes( listing.properties.icon )
		) {
			markerIcon = (
				<PinPoint
					color={ listing.properties.iconColor }
					size={ listing.properties.iconSize }
				/>
			);
		} else {
			markerIcon = (
				<DefaultMarker
					color={ listing.properties.iconColor }
					size={ listing.properties.iconSize }
				/>
			);
		}

		const element = (
			<Marker feature={ listing } map={ map } mapRef={ mapRef }>
				{ markerIcon }
			</Marker>
		);

		createMarkerEl( markersRef.current[ listing.id ], listing, map );

		root.render( element );

		return element;
	}
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
