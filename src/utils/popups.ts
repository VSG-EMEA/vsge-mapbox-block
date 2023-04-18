import { CoordinatesDef, ExtraProperties, MapItem } from '../types';
import mapboxgl from 'mapbox-gl';
import { Feature } from '@turf/turf';
import { getPartnership } from './dataset';

/**
 * This function creates a popup with information about a map feature and adds it to a Mapbox map.
 *
 * @param {mapboxgl.Map|null} map            - The mapboxgl map object on which the popup will be displayed.
 * @param {MapItem}           currentFeature - The current feature is an object that represents a specific
 *                                           location on a map, including its coordinates and properties such as name, address, and partnership.
 *                                           It is used to create a popup that displays information about the location when clicked on the map.
 * @param {Object}            defaults       - The `defaults` parameter is an object that contains default values for various
 *                                           settings or configurations used in the function. It is likely used to provide a fallback value in
 *                                           case a required value is not provided or to allow for customization of the function's behavior.
 */
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

/**
 * The function removes the active popup from the DOM.
 */
export function removePopup() {
	// removes the active popup
	const popUps = document.getElementsByClassName( 'mapboxgl-popup' );
	if ( popUps[ 0 ] ) popUps[ 0 ].remove();
}
