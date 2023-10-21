import { createRef, createRoot } from '@wordpress/element';
import mapboxgl from 'mapbox-gl';
import { CoordinatesDef, MapBoxListing, MarkerProps } from '../../types';
import type { RefObject } from 'react';
import { PopupContent } from './PopupContent';
import { defaultMarkerSize } from '../Mapbox/defaults';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

/**
 * This function adds a popup to a Mapbox map with custom content or default content based on a
 * marker's properties.
 *
 * @param                      map             - The mapboxgl.Map object representing the map on which the popup will be displayed.
 * @param {MapBoxListing}      marker          - The marker parameter is
 *                                             either a MapBoxListing object or an object with a geometry property that contains coordinates in the
 *                                             LngLatLike format. It is used to set the location of the popup on the map.
 * @param {JSX.Element | null} [children=null] - The `children` parameter is an optional JSX element
 *                                             that can be passed as a child to the `PopupCustom` component. If provided, it will be rendered
 *                                             inside the popup. If not provided, the `PopupContent` component will be rendered with the properties
 *                                             of the `marker` object.
 * @return A `mapboxgl.Popup` object is being returned.
 */
export function addPopup(
	map: mapboxgl.Map,
	marker: MapBoxListing | MapboxGeocoder.Result,
	children: JSX.Element | null = null
): mapboxgl.Popup {
	const popupRef: RefObject< HTMLDivElement > = createRef();

	// Create a new DOM root and save it to the React ref
	popupRef.current = document.createElement( 'div' );
	const root = createRoot( popupRef.current );

	// Render a Marker Component on our new DOM node
	root.render(
		children ?? <PopupContent { ...( marker.properties as MarkerProps ) } />
	);

	return new mapboxgl.Popup( {
		offset: ( marker?.properties?.iconSize || defaultMarkerSize ) * 0.5,
	} )
		.setLngLat( marker?.geometry?.coordinates as CoordinatesDef )
		.setDOMContent( popupRef.current )
		.addTo( map );
}

/**
 * The function removes the active popup from the DOM.
 *
 * @param mapRef
 */
export function removePopups( mapRef: RefObject< HTMLDivElement > ) {
	if ( ! mapRef ) {
		return;
	}
	// removes the active popup
	const popUps = mapRef.current?.querySelectorAll( '.mapboxgl-popup' );
	if ( popUps?.length ) {
		popUps.forEach( ( popUp ) => popUp.remove() );
	}
}
