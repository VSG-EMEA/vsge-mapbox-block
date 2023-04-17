import { MapFiltersDefaults, MapTagsDefaults } from '../constants';
import mapboxgl, { Popup } from 'mapbox-gl';
import {
	addMarkers,
	createSelectOptions,
	filterStores,
	fitView,
	getDefaults,
	getUserLanguage,
	initMap,
	prepareStores,
	renderListings,
} from '../utils/';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import { Coord } from '@turf/turf';

export const markers: any[] = [];

const mapboxWrapper: HTMLElement[] | null = document.querySelectorAll(
	'.wp-block-vsge-mapbox'
);

export function initMapbox( el: HTMLElement ): void {
	let geocoder;
	let mapbox;

	// get the user data
	const language = getUserLanguage();

	// get the mapbox options defaults
	const defaults = getDefaults();
	if ( defaults.accessToken ) {
		mapboxgl.accessToken = defaults.accessToken;
	} else {
		// TODO: throw a visual error
		console.log( 'error' );
	}

	// get the mapbox map data
	const attributes = JSON.parse( el.dataset.mapboxOptions || '{}' );

  // the map div container
	const map = el.querySelector( '.map' );

  // finally initialize the mapbox container
	initMap( map, attributes );

	const storesData = () => prepareStores( attributes.listings | [] );

	// Create a popup, but don't add it to the map yet.
	const popup: Popup = new mapboxgl.Popup( {
		closeButton: false,
	} );

	// This will let you use the .remove() function later on
	if ( 'remove' in Element.prototype !== null ) {
		Element.prototype.remove = function () {
			if ( this.parentNode ) {
				this.parentNode.removeChild( this );
			}
		};
	}
}

/**
 * @function Object() { [native code] } Initial Mapbox setup
 */
if ( mapboxWrapper ) {
	document.addEventListener( 'DOMContentLoaded', () =>
		mapboxWrapper.forEach( ( el ) => {
			initMapbox( el );
		} )
	);
}
