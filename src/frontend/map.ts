import {
	getDefaults,
	mapboxDefaults,
	MapFiltersDefaults,
	MapTagsDefaults,
} from '../constants';
import mapboxgl, { Popup } from 'mapbox-gl';
import {
	addMarkers,
	createSelectOptions,
	filterStores,
	fitView,
	getUserLanguage,
	prepareStores,
	renderListings,
} from '../utils/utils';

export function initMapbox( el: HTMLElement ): void {
	let map;
	let geocoder;

	const language = getUserLanguage();
	const defaults = () => getDefaults;

	const storesData = () => prepareStores();

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

	map.on( 'load', function ( e ) {
		e.currentTarget.setLayoutProperty( 'country-label', 'text-field', [
			'get',
			'name_' + language.substring( 0, 2 ),
		] );

		e.currentTarget.addSource( 'places', storesData.stores );

		const listingEl: HTMLElement | null =
			document.getElementById( 'feature-listing' );

		renderListings( storesData.stores );
		addMarkers( storesData.stores );
		createSelectOptions( MapFiltersDefaults, MapTagsDefaults );
		fitView();
	} );

	const geocoderEl = document.getElementById( 'geocoder' );
	if ( geocoderEl ) {
		geocoder = initGeocoder( geocoderEl, defaults );
	}

	// Fit view button function (placed in the topbar)
	document.getElementById( 'fit-view' )?.addEventListener( 'click', fitView );
	document
		.getElementById( 'filter-by-partnership' )
		?.addEventListener( 'change', filterStores );
	document
		.getElementById( 'filter-by-tag' )
		?.addEventListener( 'change', filterStores );
}
