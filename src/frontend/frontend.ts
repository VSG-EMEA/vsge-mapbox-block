import { MapFiltersDefaults, MapTagsDefaults } from '../constants';
import mapboxgl, { Popup } from 'mapbox-gl';
import { getDefaults, getUserLanguage } from '../utils/';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import { MapItem } from '../types';
import { addMarkers, initMap, renderListings } from '../utils/map';
import { filterStores, prepareStores } from '../utils/dataset';
import { fitView } from '../utils/view';

export function initMapbox( el: Element ): void {
	// get the mapbox options defaults
	const defaults = getDefaults();
	// get the user data
	const language = getUserLanguage();

	/** get the mapbox map data */
	const attributes = JSON.parse( el.dataset.mapboxOptions || '{}' );

	const filteredStores: MapItem[] = attributes.mapboxOptions.listings;

	// the mapbox markers points
	let markers: any[] = [];

	/** the Sidebar */
	const listingEl: Element | null = el.querySelector( '.feature-listing' );

	/** the TopBar elements and values */

	// the filter by partnership select element
	const companyFilter: HTMLSelectElement | null = el.querySelector(
		'.filter-by-partnership'
	);
	const getCompanyFilter = () => companyFilter?.value || '';

	if ( defaults?.accessToken ) {
		mapboxgl.accessToken = defaults.accessToken;
	} else {
		// TODO: throw a visual error
		console.warn( 'error' );
	}

	// the map div container
	const mapContainer = el.querySelector( '.map' );

	// finally initialize the mapbox container
	const map: mapboxgl.Map = initMap( mapContainer, attributes );

	const storesData = () =>
		prepareStores( attributes.mapboxOptions.listings ) || [];

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

	map.on( 'load', function ( e: Event ) {
		/** set the browser language map language */
		map.setLayoutProperty( 'country-label', 'text-field', [
			'get',
			'name_' + language.substring( 0, 2 ),
		] );

		/** set the browser language map language */
		map.addSource( 'places', {
			type: 'geojson',
			data: () => storesData,
		} );

		// add the sidebar listings
		markers = addMarkers(
			attributes.mapboxOptions.listings,
			map,
			defaults
		);

		/* add the listing to the map */
		renderListings(
			getCompanyFilter(),
			attributes.mapboxOptions.listings,
			listingEl
		);

		fitView( mapContainer, attributes.mapboxOptions.listings );
	} );

	// Fit view button function (placed in the topbar)
	document.getElementById( 'fit-view' )?.addEventListener( 'click', fitView );
	document
		.getElementById( 'filter-by-partnership' )
		?.addEventListener( 'change', ( e ) =>
			filterStores( e, stores, attributes.mapboxOptions.listings )
		);
	document
		.getElementById( 'filter-by-tag' )
		?.addEventListener( 'change', ( e ) =>
			filterStores( e, stores, attributes.mapboxOptions.listings )
		);
}

/**
 * the main wrapper for the map
 */
const mapboxWrapper: NodeListOf< Element > | null = document.querySelectorAll(
	'.wp-block-vsge-mapbox'
);

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
