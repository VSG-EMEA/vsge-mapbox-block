import {
	createRef,
	render,
	useContext,
	useEffect,
	useRef,
} from '@wordpress/element';
import mapboxgl from 'mapbox-gl';
import {MapboxContext, MapProvider} from './MapboxContext';
import { Feature } from '@turf/turf';
import { Icon } from '@wordpress/components';
import { mapMarker } from '@wordpress/icons';
import { RefObject } from 'react';
import { enableListing } from '../../utils/dataset';
import { Marker } from './Markers';

export function MarkerPopup( { properties } ): JSX.Element {
	const { partnership, name, address, city, postalCode, country, state } =
		properties;

	return (
		<div>
			<Icon icon={ mapMarker } className={ 'gray-marker' } />
			<h3>
				{ partnership } ${ name }
			</h3>
			<h4>{ address }</h4>
			<p>
				{ city } { postalCode } { country }
				<br />
				{ state ? ' (' + state + ')' : '' }
			</p>
		</div>
	);
}

/**
 * The function highlights a specific feature in a listing by adding a CSS class to it and removing the
 * class from any previously active feature.
 *
 * @param {Feature} item - The `item` parameter is of type `Feature`, which is likely an object
 *                       representing a geographic feature on a map. It may contain properties such as the feature's ID,
 *                       coordinates, and other attributes. The function `highlightListing` is using this parameter to
 *                       identify a specific feature and highlight its corresponding
 */
export function highlightListing( item: Feature ) {
	console.log( item );
	document.getElementById( 'feature-listing' )?.classList.add( 'filtered' );

	const activeItem = document.getElementsByClassName( 'active-store' );
	if ( activeItem[ 0 ] ) {
		activeItem[ 0 ].classList.remove( 'active-store' );
	}

	if ( item.properties ) {
		const listing = document.getElementById( item.properties.id );
		listing?.classList.add( 'active-store' );
	}
}

/**
 * The function removes the active popup from the DOM.
 */
export function removePopup() {
	// removes the active popup
	const popUps = document.getElementsByClassName( 'mapboxgl-popup' );
	if ( popUps[ 0 ] ) popUps[ 0 ].remove();
}

export const MapPopup = ( { children, lngLat } ) => {
	const { map } = useContext( MapboxContext );
	const popupRef: RefObject< HTMLDivElement > = createRef();

	useEffect( () => {
		const popup = new mapboxgl.Popup( {} )
			.setLngLat( lngLat )
			.setDOMContent( popupRef.current )
			.addTo( map );

		return popup.remove;
	}, [ children, lngLat ] );

	return <div ref={ popupRef }>{ children }</div>;
};
