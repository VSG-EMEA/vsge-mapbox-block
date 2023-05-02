import { Button, Icon } from '@wordpress/components';
import { MarkerPopup, removePopup } from './Popup';
import { RefObject } from 'react';
import { createRef, render, useContext } from '@wordpress/element';
import { enableListing } from '../../utils/dataset';
import mapboxgl from 'mapbox-gl';
import { mapMarker } from '@wordpress/icons';
import { MapboxContext } from './MapboxContext';

export function Marker( { onClick, children, feature } ): JSX.Element {
	return (
		<Button
			onClick={ onClick }
			className={ 'marker' }
			id={ 'marker-' + feature.id }
		>
			{ children }
		</Button>
	);
}

export function addMarkers( stores, map ): mapboxgl.Marker[] {
	// Create an array to store the Markers
	const markers: mapboxgl.Marker[] = [];

	/* For each feature in the GeoJSON object above: */
	stores.features.forEach( function ( marker ) {
		if ( marker?.geometry ) {
			const ref: RefObject< HTMLDivElement > = createRef();
			// Create a new DOM node and save it to the React ref
			ref.current = document.createElement( 'div' );
			// Render a Marker Component on our new DOM node
			render(
				<Marker
					onClick={ () => enableListing( map, marker ) }
					feature={ marker }
					data-marker-id={ marker.id }
				>
					<Icon
						icon={ mapMarker }
						size={ 48 }
						style={ {
							fill: 'white',
						} }
					/>
				</Marker>,
				ref.current
			);

			// Add markers to the map at all points
			const newMarker: mapboxgl.Marker = new mapboxgl.Marker(
				ref.current,
				{
					offset: [ 0, -24 ],
				}
			)
				.setLngLat( marker.geometry.coordinates || [ 0, 0 ] )
				.addTo( map );

			markers.push( newMarker );
		}
	} );

	return markers;
}
