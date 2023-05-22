import { createRef, createRoot, render } from '@wordpress/element';
import mapboxgl, { LngLat, LngLatLike } from 'mapbox-gl';
import { Feature } from '@turf/turf';
import { Icon } from '@wordpress/components';
import { mapMarker } from '@wordpress/icons';
import { MapBoxListing, MarkerProps } from '../../types';
import { RefObject } from 'react';
import MarkerPropsCustom from '../../types';
import { children } from '@wordpress/blocks';

export function MarkerPopup( {
	itemTags,
	itemFilters,
	name,
	description,
	address,
	city,
	postalCode,
	country,
	state,
	website,
}: MarkerProps ) {
	return (
		<div>
			<a href={ website }>
				<Icon icon={ mapMarker } />
				{ itemFilters?.length || <h4>{ itemFilters?.join( ' ' ) }</h4> }
				<h3>{ name }</h3>
				{ address || <h4>{ address }</h4> }
				<p>
					{ description }
					<br />
					{ `${ city } ${ postalCode } ${ country } (${ state })` }
				</p>
				<p>{ itemTags?.length || itemTags?.join( ' ' ) }</p>
			</a>
		</div>
	);
}
export function MarkerPopupCustom( { children }: MarkerPropsCustom ) {
	return (
		<div>
			<a>{ children }</a>
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

export function addPopup(
	map: mapboxgl.Map,
	marker: MapBoxListing | { geometry: { coordinates: number[] } },
	__children: JSX.Element | null = null
): mapboxgl.Popup {
	const popupRef: RefObject< HTMLDivElement > = createRef();

	// Create a new DOM root and save it to the React ref
	popupRef.current = document.createElement( 'div' );
	const root = createRoot( popupRef.current );

	// Render a Marker Component on our new DOM node
	root.render(
		__children ? (
			<MarkerPopupCustom children={ __children } />
		) : (
			<MarkerPopup { ...marker.properties } />
		)
	);

	return new mapboxgl.Popup( {} )
		.setLngLat( marker?.geometry?.coordinates as LngLat )
		.setDOMContent( popupRef.current )
		.addTo( map );
}
