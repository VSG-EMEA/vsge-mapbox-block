import { RefObject } from 'react';
import { createRef, createRoot } from '@wordpress/element';
import mapboxgl, { LngLatLike, MapEventType, MapMouseEvent } from 'mapbox-gl';
import { Marker } from './Marker';
import { DefaultMarker, PinPoint } from './Pin';
import { MapBoxListing, MarkerIcon } from '../../types';
import { areValidCoordinates } from '../Sortable/utils';
import { safeSlug } from '../../utils';
import { getMarkerSvg, modifySVG } from '../../utils/svg';

/**
 * This function adds markers to a map based on a GeoJSON object.
 *
 * @param {mapboxgl.MapboxGeoJSONFeature[]} markers - An array of MapboxGeoJSONFeature objects
 *                                                  representing the markers to be added to the map.
 * @param                                   map     - The `map` parameter is a `mapboxgl.Map` object representing the Mapbox map instance on
 *                                                  which the markers will be added.
 * @param                                   icons
 * @return an array of `mapboxgl.Marker` objects.
 */
export function addMarkers(
	markers: MapBoxListing[],
	map: mapboxgl.Map,
	icons: []
): mapboxgl.Marker[] {
	return markers?.map( ( marker ) => {
		/* For each feature in the GeoJSON object above add a marker */
		return addMarker( marker, map, icons );
	} );
}

/**
 * This function adds a marker to a Mapbox map using a Marker Component rendered on a new DOM node.
 *
 * @param {MapBoxListing.properties} marker - A MarkerItem object that contains information about the marker,
 *                                          including its geometry and properties.
 * @param                            map    - The `map` parameter is an instance of the `mapboxgl.Map` class, which represents a
 *                                          Mapbox map. It is used to add the marker to the map and set its position.
 * @param                            icons  - An array of MarkerIcon objects representing the icon set.
 */
export function addMarker(
	marker: MapBoxListing,
	map: mapboxgl.Map,
	icons: MarkerIcon[]
): mapboxgl.Marker | undefined {
	if ( marker?.geometry ) {
		// Check if the coordinates are valid
		if (
			! areValidCoordinates(
				marker?.geometry?.coordinates as [ number, number ]
			)
		)
			return undefined;

		// Create a new DOM root and save it to the React ref
		const ref: RefObject< HTMLElement > = createRef< HTMLElement >();

		// Render a Marker Component on our new DOM node
		ref.current = document.createElement( 'div' );
		ref.current.className =
			'marker marker-' + safeSlug( marker.properties.name );
		const root = createRoot( ref.current );

		let markerIcon: JSX.Element | undefined;

		if ( marker.properties.icon?.startsWith( 'custom-' ) ) {
			const svgMarker = getMarkerSvg( marker.properties.icon, icons );
			markerIcon = modifySVG(
				svgMarker,
				marker.properties.iconColor,
				marker.properties.iconSize
			);
		} else if ( [ 'geocoder', 'pin' ].includes( marker.properties.icon ) ) {
			markerIcon = (
				<PinPoint
					color={ marker.properties.iconColor }
					size={ marker.properties.iconSize }
				/>
			);
		} else {
			markerIcon = (
				<DefaultMarker
					color={ marker.properties.iconColor }
					size={ marker.properties.iconSize }
				/>
			);
		}

		// Render a Marker Component on our new DOM node
		root.render(
			<Marker feature={ marker } children={ markerIcon } map={ map } />
		);

		// Add markers to the map at all points
		const thisMarker = new mapboxgl.Marker( ref.current, {
			offset: [ 0, ( marker?.properties?.iconSize || 0 ) * -0.5 ],
			draggable: marker.properties.draggable, // if the icon is the clickable marker, it should be draggable
		} )
			.setLngLat(
				( marker?.geometry?.coordinates as LngLatLike ) || [ 0, 0 ]
			)
			.addTo( map );

		thisMarker.on( 'dragend', ( event: MapEventType ) => {
			const lngLat = thisMarker.getLngLat();
			// Update the marker's position
			thisMarker.setLngLat( lngLat );
		} );

		return thisMarker;
	}
}

/**
 * Removes temporary markers from the specified element.
 *
 * @param {React.RefObject<HTMLDivElement>} maboxRef - The reference to the HTMLDivElement
 * @return {void} This function does not return anything
 */
export function removeTempMarkers(
	maboxRef: React.RefObject< HTMLDivElement > | undefined
) {
	console.log( 'removeTempMarkers' );
	if ( maboxRef?.current ) {
		maboxRef?.current
			.querySelectorAll( '.marker-temp' )
			.forEach( ( marker ) => marker.parentElement?.remove() );
	}
}
