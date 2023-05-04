import { Button, Icon } from '@wordpress/components';
import { RefObject } from 'react';
import { createRef, createRoot, render, useContext } from '@wordpress/element';
import { enableListing } from '../../utils/dataset';
import { mapMarker } from '@wordpress/icons';
import mapboxgl from 'mapbox-gl';
import { MountedMapsContextValue } from '../../types';
import { MapboxContext } from './MapboxContext';
import { safeSlug } from '../../utils';

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

export function Marker( { onClick, feature } ): JSX.Element {
	const { map, marker }: MountedMapsContextValue =
		useContext( MapboxContext );
	return (
		<Button
			onClick={ ( e ) => {
				e.preventDefault();
				enableListing( map, marker );
			} }
			className={ 'marker marker-' + safeSlug( feature.properties.name ) }
			id={ 'marker-' + feature.id || 'temp' }
			data-id={ feature.id || 'none' }
			data-marker-type={ feature.type }
			data-marker-name={ safeSlug( feature.properties.name ) }
		>
			<Icon
				icon={ feature.properties.icon || defaultMarkerStyle.icon }
				size={ feature.properties.size || defaultMarkerStyle.size }
				style={ {
					fill: feature.properties.color || defaultMarkerStyle.color,
				} }
			/>
		</Button>
	);
}

const defaultMarkerStyle: { size: number; color: string; icon: any } = {
	icon: mapMarker,
	size: 48,
	color: 'white',
};

export function addMarker( marker, map: mapboxgl.Map ): mapboxgl.Marker {
	if ( marker?.geometry ) {
		const ref: RefObject< HTMLDivElement > = createRef();
		// Create a new DOM root and save it to the React ref
		ref.current = document.createElement( 'div' );
		const root = createRoot( ref.current );
		// Render a Marker Component on our new DOM node
		root.render( <Marker feature={ marker } /> );

		// Add markers to the map at all points
		return new mapboxgl.Marker( ref.current, {
			offset: [
				0,
				( marker.properties.size || defaultMarkerStyle.size ) * -0.5,
			],
		} )
			.setLngLat( marker.geometry.coordinates || [ 0, 0 ] )
			.addTo( map );
	}
}
