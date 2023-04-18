import { CoordinatesDef, ExtraProperties, MapItem } from '../types';
import mapboxgl from 'mapbox-gl';
import { Feature } from '@turf/turf';
import {getPartnership} from "./dataset";

export function createPopUp(
	map: mapboxgl.Map,
	currentFeature: MapItem,
	defaults
) {
	removePopup();

	let { state, city, country, partnership, name, address, postalCode } =
		currentFeature.properties as ExtraProperties;

	if ( name ) {
		address = address ? address : '';
		city = city ? city + ' ' : '';
		postalCode = postalCode ? postalCode + ' ' : '';
		country = country ? country + ' ' : '';
		state = state ? ' (' + state + ')' : '';

		const mapPopup = new mapboxgl.Popup( { closeOnClick: false } )
			.setLngLat( currentFeature.geometry.coordinates as CoordinatesDef )
			.setHTML(
				`<img src="${
					defaults.siteurl
				}/wp-content/themes/brb/assets/images/elements/grey-marker.png" class="gray-marker" /><h3>${ getPartnership(
					partnership
				) }<br/>${ name }</h3><h4>${ address }</h4><p>${ city }${ postalCode }${ country }${ state }</p>`
			)
			.addTo( map );

		mapPopup.on( 'close', function () {
			document
				.getElementById( 'feature-listing' )
				?.classList.remove( 'filtered' );
		} );
	}
}

export function highlightListing( item: Feature ) {
	document.getElementById( 'feature-listing' )?.classList.add( 'filtered' );

	const activeItem = document.getElementsByClassName( 'active-store' );
	if ( activeItem[ 0 ] ) {
		activeItem[ 0 ].classList.remove( 'active-store' );
	}

	if ( item.properties ) {
		const listing = document.getElementById(
			'listing-' + item.properties.id
		);
		listing?.classList.add( 'active-store' );
	}
}

export function removePopup() {
	// removes the active popup
	const popUps = document.getElementsByClassName( 'mapboxgl-popup' );
	if ( popUps[ 0 ] ) popUps[ 0 ].remove();
}
