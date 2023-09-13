import { RefObject } from 'react';
import { createRef, createRoot } from '@wordpress/element';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import { Marker } from './Marker';
import { DefaultMarker, PinPoint } from './Pin';
import { MapBoxListing, MarkerItem } from '../../types';
import { areValidCoordinates } from '../Sortable/utils';
import { safeSlug } from '../../utils';

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
 * @param              type
 */
export function addMarker(
	marker: MapBoxListing,
	map: mapboxgl.Map
): mapboxgl.Marker | undefined {
	if ( marker?.geometry ) {
		const ref: RefObject< HTMLElement > = createRef< HTMLElement >();

		// Create a new DOM root and save it to the React ref
		ref.current = document.createElement( 'div' );
		ref.current.className =
			'marker marker-' + safeSlug( marker.properties.name );
		const root = createRoot( ref.current );

		console.log(marker.properties.icon)

		let markerIcon = null;
		switch ( marker.properties.icon ) {
			case Number( marker.properties.icon ):
				markerIcon = (
					<DefaultMarker
						color={ marker.properties.iconColor }
						size={ marker.properties.iconSize }
					/>
				);
				break;
			case 'geocoder':
			case 'pin':
				markerIcon = (
					<PinPoint
						color={ marker.properties.iconColor }
						size={ marker.properties.iconSize }
					/>
				);
				break;
			case 'default':
			default:
				markerIcon = (
					<DefaultMarker
						color={ marker.properties.iconColor }
						size={ marker.properties.iconSize }
					/>
				);
				break;
		}

		// Render a Marker Component on our new DOM node
		root.render(
			<Marker feature={ marker } map={ map } children={ markerIcon } />
		);

		// Add markers to the map at all points
		return areValidCoordinates(
			marker?.geometry?.coordinates as [ number, number ]
		)
			? new mapboxgl.Marker( ref.current, {
					offset: [ 0, ( marker?.properties?.iconSize || 0 ) * -0.5 ],
			  } )
					.setLngLat(
						( marker?.geometry?.coordinates as LngLatLike ) || [
							0, 0,
						]
					)
					.addTo( map )
			: console.log(
					'Invalid coordinates for marker ',
					marker.properties.country
			  );
	}
}
