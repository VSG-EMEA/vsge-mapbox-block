import { PinPoint } from './marker-icons';
import { createRoot } from '@wordpress/element';
import { Marker } from './';
import type { RefObject } from 'react';
import { geocoderMarkerDefaults, geoMarkerStyle } from './defaults';

/**
 * This function initializes a map marker using a React component and adds it to a Mapbox map.
 *
 * @param id         - The id of the marker.
 * @param markersRef - The ref object for the map container.
 * @return A mapboxgl.Marker object is being returned.
 */
export const initGeoMarker = (
	id: number,
	markersRef: HTMLButtonElement[]
): Element | null => {
	if ( ! markersRef || ! markersRef[ id ] ) return null;

	// Create a new DOM root and save it to the React ref
	markersRef[ id ] = document.createElement( 'button' );
	markersRef[ id ].className = 'marker marker-geocoder disabled';

	const root = createRoot( markersRef[ id ] );

	const defaultStyle = geoMarkerStyle;
	const markerData = geocoderMarkerDefaults( id, defaultStyle );

	// Render a Marker Component on our new DOM node
	root.render(
		(
			<Marker
				classes={ 'marker marker-geocoder disabled' }
				feature={ markerData }
				children={
					<PinPoint
						color={ defaultStyle.color }
						size={ defaultStyle.size }
					/>
				}
			/>
		 ) as JSX.Element
	);

	return markersRef[ id ];
};
