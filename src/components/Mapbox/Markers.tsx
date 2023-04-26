import { Button, Icon } from '@wordpress/components';
import { removePopup } from './Popup';
import { RefObject } from 'react';
import { createRef, render } from '@wordpress/element';
import { enableListing } from '../../utils/dataset';
import mapboxgl from 'mapbox-gl';
import { mapMarker } from '@wordpress/icons';

export function Marker( { onClick, children, feature } ): JSX.Element {
	const _onClick = () => {
		onClick( feature.properties.description );
	};

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

export function addMarkers( storesEl, map ) {
	removePopup();

	const markers = [];

	// removes all markers
	markers.forEach( ( marker ) => marker.remove() );

	/* For each feature in the GeoJSON object above: */
	storesEl.features.forEach( function ( marker, i ) {
		if ( marker?.geometry ) {
			const ref: RefObject< HTMLDivElement > = createRef();
			// Create a new DOM node and save it to the React ref
			ref.current = document.createElement( 'div' );
			// Render a Marker Component on our new DOM node
			render(
				<Marker
					onClick={ () => enableListing( map, marker ) }
					feature={ marker }
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
			const newMarker = new mapboxgl.Marker( ref.current, {
				offset: [ 0, -24 ],
			} )
				.setLngLat( marker.geometry.coordinates )
				.addTo( map );

			markers.push( newMarker );
		}
	} );
}
