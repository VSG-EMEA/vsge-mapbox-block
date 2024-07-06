import { getNextId } from '../../utils/dataset';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { __ } from '@wordpress/i18n';
import { MapboxBlockDefaults, MapBoxListing } from '../../types';
import { removePopups } from '../Popup/';
import { fitInView, flyToStore } from '../../utils/view';
import { removeTempMarkers } from '../Marker/utils';
import { DEFAULT_GEOCODER_TYPE_SEARCH } from '../../constants';
import { initGeoMarker } from '../Marker/Geomarker';
import type mapboxgl from 'mapbox-gl';
import { getNearestStore } from './utils';
import './style.scss';

/**
 * Initializes the geocoder for the map.
 *
 * @param                                              mapboxgl
 * @param {mapboxgl.Map}                               map                 - The Mapbox map object.
 * @param                                              map.current         - The Mapbox current instance.
 * @param {HTMLDivElement}                             mapRef              - The ref object for the map container.
 * @param                                              markersRef          - The ref object for the markers' container.
 * @param {HTMLDivElement}                             geocoderRef         - The ref object for the geocoder container.
 * @param {MapBoxListing[]}                            listings            - The array of mapbox listings.
 * @param {(listings: MapBoxListing[] | null) => void} setFilteredListings - The function to set the filtered listings.
 * @param                                              mapDefaults
 * @return {MapboxGeocoder | undefined} The initialized Mapbox geocoder.
 */
export function initGeoCoder(
	mapboxgl: any,
	map: mapboxgl.Map,
	mapRef: HTMLDivElement,
	markersRef: HTMLButtonElement[],
	geocoderRef: HTMLDivElement,
	listings: MapBoxListing[],
	setFilteredListings: ( listings: MapBoxListing[] | null ) => void,
	mapDefaults: MapboxBlockDefaults
): MapboxGeocoder | undefined {
	const marker = initGeoMarker( getNextId( listings ), markersRef );

	let searchResult: MapboxGeocoder.Result | undefined;

	if ( mapDefaults.accessToken ) {
		const geocoder = new MapboxGeocoder( {
			accessToken: mapDefaults.accessToken,
			mapboxgl,
			marker: marker as unknown as mapboxgl.Marker,
			language: mapDefaults.language || 'en',
			placeholder: __( 'Find nearest Sales Agent', 'vsge-mapbox-block' ),
			types: DEFAULT_GEOCODER_TYPE_SEARCH,
		} );

		if ( geocoder && geocoderRef ) {
			( geocoderRef as HTMLElement ).appendChild( geocoder.onAdd( map ) );
		}

		/**
		 * Clears the geocoder input and resets the displayed listings.
		 */
		function onGeocoderClear() {
			document
				.getElementById( 'feature-listing' )
				?.classList.remove( 'filtered' );
			// Remove the active class from the geocoder
			geocoderRef?.classList.remove( 'active' );
			// add the hide class to the geocoder
			geocoderRef?.classList.add( 'disabled' );

			// Reset the displayed listings
			setFilteredListings( null );

			// Remove the search result
			searchResult = undefined;
			// Remove the popup, if any
			removePopups( mapRef );
			// Center the map
			fitInView( map, listings, mapRef );
		}

		/**
		 * A function that handles the geocoder result.
		 *
		 * @param {Object}                            ev        - An object containing the geocoder result.
		 * @param {MapboxGeocoder.Result | undefined} ev.result - The geocoder result.
		 */
		function onGeocoderResult( ev: {
			result: MapboxGeocoder.Result | undefined;
		} ) {
			// remove any popup or temp marker (clicked point, another geocoder marker) from the map
			listings = removeTempMarkers( listings, mapRef, [
				'geocoder-marker',
			] );
			removePopups( mapRef );

			// save the search results
			searchResult = ev.result;

			// Add the active class to the geocoder
			geocoderRef?.classList.add( 'active' );

			if ( searchResult ) {
				// Remove the active class from the geocoder
				geocoderRef?.classList.remove( 'disabled' );

				// const markerEl = geocoder.mapMarker.getElement() as HTMLElement;
				const geoMarker = {
					// @ts-expect-error - mapMarker is a property on the geocoder
					...geocoder.mapMarker,
					...searchResult,
					geometry: searchResult.geometry,
				};

				const filtered = getNearestStore(
					searchResult,
					mapRef,
					map,
					listings
				);

				// Display the nearest store
				setFilteredListings( filtered );

				geoMarker.onDragEnd = () => {
					// Update the marker's position
					const lngLat = geoMarker.getLngLat();
					// Update the marker's position
					geoMarker.setLngLat( lngLat );
					// Center the map
					flyToStore( map, geoMarker );
				};

				geoMarker.onclick = () => {
					// Remove the active class from the geocoder
					geocoder.clear();
				};
			}
		}

		geocoder.on( 'clear', onGeocoderClear );

		geocoder.on( 'result', onGeocoderResult );

		return geocoder;
	}
}
