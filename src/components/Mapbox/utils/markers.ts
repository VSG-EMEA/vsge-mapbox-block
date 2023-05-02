import { addMarkers } from '../Markers';
import mapboxgl from 'mapbox-gl';

// Removes all markers on the map
function removeMarkers( markers: mapboxgl.Marker[] ) {
	markers.forEach( ( marker ) => marker.remove() );
}

export function initMarkers( markers: mapboxgl.Marker[], map: mapboxgl.Map ) {
	addMarkers(
		{
			type: 'FeatureCollection',
			features: markers,
		},
		map
	);
}
