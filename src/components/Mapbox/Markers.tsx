import { RefObject } from 'react';
import { createRef, createRoot } from '@wordpress/element';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import { Marker } from './Marker';
import { DefaultMarker } from './Pin';
import { MarkerItem } from '../../types';

/**
 * This function adds markers to a map based on a GeoJSON object.
 *
 * @param {mapboxgl.MapboxGeoJSONFeature[]} markers - An array of MapboxGeoJSONFeature objects
 *                                                  representing the markers to be added to the map.
 * @param                                   map     - The `map` parameter is a `mapboxgl.Map` object representing the Mapbox map instance on
 *                                                  which the markers will be added.
 * @return an array of `mapboxgl.Marker` objects.
 */
export function addMarkers(
	markers: mapboxgl.MapboxGeoJSONFeature[],
	map: mapboxgl.Map
): mapboxgl.Marker[] {
	return markers?.map( ( marker ) => {
		/* For each feature in the GeoJSON object above add a marker */
		return addMarker( marker, map );
	} );
}

/**
 * This function adds a marker to a Mapbox map using a Marker Component rendered on a new DOM node.
 *
 * @param {MarkerItem} marker - A MarkerItem object that contains information about the marker,
 *                            including its geometry and properties.
 * @param              map    - The `map` parameter is an instance of the `mapboxgl.Map` class, which represents a
 *                            Mapbox map. It is used to add the marker to the map and set its position.
 */
export function addMarker(
	marker: MarkerItem,
	map: mapboxgl.Map
): mapboxgl.Marker | undefined {
	if ( marker?.geometry ) {
		const ref: RefObject< HTMLDivElement > = createRef();
		// Create a new DOM root and save it to the React ref
		ref.current = document.createElement( 'div' );
		const root = createRoot( ref.current );
		// Render a Marker Component on our new DOM node
		root.render( <Marker feature={ marker } map={ map } /> );

		// Add markers to the map at all points
		return new mapboxgl.Marker( ref.current, {
			offset: [ 0, ( marker?.properties?.iconSize || 0 ) * -0.5 ],
		} )
			.setLngLat(
				( marker?.geometry?.coordinates as LngLatLike ) || [ 0, 0 ]
			)
			.addTo( map );
	}
}
