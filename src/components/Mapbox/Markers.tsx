import { RefObject } from 'react';
import { createRef, createRoot } from '@wordpress/element';
import mapboxgl from 'mapbox-gl';
import { Marker } from './Marker';
import { DefaultMarker } from './Pin';

// Default marker style
export const defaultMarkerStyle: { icon: JSX.Element } =
	// eslint-disable-next-line prettier/prettier
  DefaultMarker( { color: 'red', size: 48 } )
;

export const tempMarkerStyle: { icon: JSX.Element } =
	// eslint-disable-next-line prettier/prettier
  DefaultMarker( { color: 'green', size: 48 } )
;

// Removes all markers on the map
export function removeMarkers( markers: mapboxgl.Marker[] ) {
	markers.forEach( ( marker ) => marker.remove() );
}

export function addMarkers(
	markers: mapboxgl.MapboxGeoJSONFeature[],
	map: mapboxgl.Map
): mapboxgl.Marker[] {
	return markers.map( ( marker ) => {
		/* For each feature in the GeoJSON object above add a marker */
		return addMarker( marker, map );
	} );
}

export function addMarker( marker, map: mapboxgl.Map ): mapboxgl.Marker {
	if ( marker?.geometry ) {
		const ref: RefObject< HTMLDivElement > = createRef();
		// Create a new DOM root and save it to the React ref
		ref.current = document.createElement( 'div' );
		const root = createRoot( ref.current );
		// Render a Marker Component on our new DOM node
		root.render( <Marker feature={ marker } map={ map } /> );

		// Add markers to the map at all points
		return new mapboxgl.Marker( ref.current, {
			offset: [
				0,
				( Number( marker.properties.size ) as number ) * -0.5 || 0,
			],
		} )
			.setLngLat( marker.geometry.coordinates || [ 0, 0 ] )
			.addTo( map );
	}
}
