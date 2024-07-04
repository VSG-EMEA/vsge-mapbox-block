import { PinPoint } from './marker-icons';
import { createRoot } from '@wordpress/element';
import { Marker } from './';
import { geocoderMarkerDefaults, geoMarkerStyle } from './defaults';
import type mapboxgl from 'mapbox-gl';

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
): mapboxgl.Marker => {
	// Create a new DOM root and save it to the React ref
	markersRef[ id ] = document.createElement( 'button' );
	markersRef[ id ].className = 'marker marker-geocoder disabled';

	makeGeoMarker( markersRef[ id ], id );

	return {
		element: markersRef[ id ] as HTMLButtonElement,
		offset: [ 0, ( geoMarkerStyle.size || 0 ) * -0.5 ],
		draggable: true,
	};
};

export function makeGeoMarker( markersRef, id ) {
	const root = createRoot( markersRef );

	const defaultStyle = geoMarkerStyle;
	const markerData = geocoderMarkerDefaults( id, defaultStyle );

	// Render a Marker Component on our new DOM node
	root.render(
		<Marker
			classes={ 'marker marker-geocoder disabled' }
			feature={ markerData }
		>
			<PinPoint color={ defaultStyle.color } size={ defaultStyle.size } />
		</Marker>
	);
}
