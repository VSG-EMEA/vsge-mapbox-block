import { PinPoint } from './marker-icons';
import { createRoot } from '@wordpress/element';
import { geoMarkerStyle } from './defaults';
import type { MarkerOptions } from 'mapbox-gl';

type ElementRoot = ReturnType< typeof createRoot >;

export interface GeoMarkerInitResult extends MarkerOptions {
	markerOptions: MarkerOptions;
	root: ElementRoot;
}

/**
 * This function initializes a map marker using a React component and adds it to a Mapbox map.
 *
 * @param id         - The id of the marker.
 * @param markersRef - Optional ref array for the markers.
 * @return A GeoMarkerInitResult containing markerOptions and root.
 */
export const initGeoMarker = (
	id: number,
	markersRef?: HTMLButtonElement[]
): GeoMarkerInitResult => {
	const button = document.createElement( 'button' );
	button.className = 'marker marker-geocoder disabled';
	if ( markersRef ) {
		markersRef[ id ] = button;
	}

	const root = makeGeoMarker( button );

	const markerOptions: MarkerOptions = {
		element: button,
		offset: [ 0, ( geoMarkerStyle.size || 0 ) * -0.5 ],
		draggable: true,
	};

	return {
		...markerOptions,
		markerOptions,
		root,
	};
};

export function makeGeoMarker( markerEl: HTMLElement ): ElementRoot {
	const root = createRoot( markerEl );

	const defaultStyle = geoMarkerStyle;

	// Render a PinPoint component on our new DOM node
	root.render(
		<PinPoint color={ defaultStyle.color } size={ defaultStyle.size } />
	);

	return root;
}
