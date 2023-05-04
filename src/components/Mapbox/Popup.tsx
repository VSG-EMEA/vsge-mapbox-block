import { createRef, createRoot, render } from '@wordpress/element';
import mapboxgl from 'mapbox-gl';
import { Feature } from '@turf/turf';
import { Icon } from '@wordpress/components';
import { mapMarker } from '@wordpress/icons';
import { RefObject } from 'react';

export const MarkerPopup = ( props ): JSX.Element => {
	const {
		itemTags,
		itemFilters,
		name,
		address,
		city,
		postalCode,
		country,
		state,
		onClick,
	} = props;

	return (
		<div>
			<Icon icon={ mapMarker } className={ 'gray-marker' } />
			<a onClick={ () => onClick() } />
			<h3>
				{ itemTags?.join( ' ' ) } { name }
			</h3>
			<h4>{ address }</h4>
			<p>
				{ city } { postalCode } { country }
				<br />
				{ state ? ' (' + state + ')' : '' }
				{ itemFilters?.join( ' ' ) }
			</p>
		</div>
	);
};

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
		const listing = document.getElementById( item.id );
		listing?.classList.add( 'active-store' );
	}
}

/**
 * The function removes the active popup from the DOM.
 *
 * @param mapRef
 */
export function removePopup( mapRef ) {
	// removes the active popup
	const popUps = mapRef.querySelectorAll( '.mapboxgl-popup' );
	if ( popUps[ 0 ] ) popUps[ 0 ].remove();
}

export const addPopup = (map, marker ) => {
	const popupRef: RefObject< HTMLDivElement > = createRef();

	// Create a new DOM root and save it to the React ref
	popupRef.current = document.createElement( 'div' );
	const root = createRoot( popupRef.current );

	// Render a Marker Component on our new DOM node
	root.render( <MarkerPopup { ...marker.properties } /> );

	return new mapboxgl.Popup( {} )
		.setLngLat( marker.geometry.coordinates )
		.setDOMContent( popupRef.current )
		.addTo( map );
};
