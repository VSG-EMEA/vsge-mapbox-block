import { getNextId, normalizeMapboxLanguage } from '../../utils/dataset';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { __ } from '@wordpress/i18n';
import {
	CoordinatesDef,
	MapboxBlockDefaults,
	MapBoxListing,
} from '../../types';
import { removePopups } from '../Popup/';
import { fitInView, flyToStore } from '../../utils/view';
import { removeTempMarkers } from '../Marker/utils';
import { DEFAULT_GEOCODER_TYPE_SEARCH } from '../../constants';
import { initGeoMarker } from '../Marker/Geomarker';
import type mapboxgl from 'mapbox-gl';
import { getNearestStore } from './utils';
import './style.scss';

export interface InitializedGeocoder {
	geocoder: MapboxGeocoder;
	destroy: () => void;
}

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
 * @param {() => void}                                 [clearPopups]       - Optional function to clear managed popups.
 * @param {import('../Popup').PopupManager}           [popupManager]      - Optional PopupManager instance.
 * @param {import('../Marker/registry').DealerMarkerRegistry} [markerRegistry] - Optional authoritative marker registry.
 * @param {(coords: CoordinatesDef | null) => void}    [setDistanceReference] - Optional function to set the distance reference.
 * @return {InitializedGeocoder | undefined} The initialized Mapbox geocoder wrapper.
 */
export function initGeoCoder(
	mapboxgl: any,
	map: mapboxgl.Map,
	mapRef: HTMLDivElement,
	markersRef: HTMLButtonElement[],
	geocoderRef: HTMLDivElement,
	listings: MapBoxListing[],
	setFilteredListings: ( listings: MapBoxListing[] | null ) => void,
	mapDefaults: MapboxBlockDefaults,
	clearPopups?: () => void,
	popupManager?: import('../Popup').PopupManager | null,
	markerRegistry?: import('../Marker/registry').DealerMarkerRegistry | null,
	setDistanceReference?: ( coords: CoordinatesDef | null ) => void
): InitializedGeocoder | undefined {
	const geoMarkerInit = initGeoMarker( getNextId( listings ), markersRef );
	const marker = geoMarkerInit.markerOptions;
	const geoMarkerRoot = geoMarkerInit.root;

	let searchResult: MapboxGeocoder.Result | undefined;

	if ( mapDefaults.accessToken ) {
		const geocoder = new MapboxGeocoder( {
			accessToken: mapDefaults.accessToken,
			mapboxgl,
			marker: marker as unknown as mapboxgl.Marker,
			language: normalizeMapboxLanguage( mapDefaults.language ) || 'en',
			placeholder: __( 'Find nearest Sales Agent', 'vsge-mapbox-block' ),
			types: DEFAULT_GEOCODER_TYPE_SEARCH,
		} );

		if ( geocoder && geocoderRef ) {
			geocoderRef.innerHTML = '';
			( geocoderRef as HTMLElement ).appendChild( geocoder.onAdd( map ) );
		}

		/**
		 * Clears the geocoder input and resets the displayed listings.
		 */
		function onGeocoderClear() {
			const wrapper =
				mapRef?.closest( '.map-wrapper' ) || mapRef?.parentElement;
			wrapper
				?.querySelector( '.feature-listing' )
				?.classList.remove( 'filtered' );

			// Remove the active class from the geocoder
			geocoderRef?.classList.remove( 'active' );
			// add the hide class to the geocoder
			geocoderRef?.classList.add( 'disabled' );

			// Reset the displayed listings
			setFilteredListings( null );
			setDistanceReference?.( null );

			// Remove the search result
			searchResult = undefined;

			// Remove popups
			if ( clearPopups ) {
				clearPopups();
			} else {
				removePopups( mapRef );
			}

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
			// remove any popup or temp marker from the registry / listings
			listings = removeTempMarkers( listings, markerRegistry || mapRef, [
				'geocoder-marker',
			] );

			if ( clearPopups ) {
				clearPopups();
			} else {
				removePopups( mapRef );
			}

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
					listings,
					undefined,
					popupManager,
					mapboxgl
				);

				// Display the nearest store
				setFilteredListings( filtered );
				if ( searchResult.geometry?.coordinates ) {
					setDistanceReference?.(
						searchResult.geometry.coordinates as CoordinatesDef
					);
				}

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

		const destroy = () => {
			geocoder.off( 'clear', onGeocoderClear );
			geocoder.off( 'result', onGeocoderResult );
			try {
				geoMarkerRoot?.unmount();
			} catch {
				// Ignore if already unmounted
			}
			try {
				geocoder.onRemove();
			} catch {
				// Ignore if already removed
			}
			if ( geocoderRef ) {
				geocoderRef.innerHTML = '';
				geocoderRef.classList.remove( 'active' );
			}
		};

		return { geocoder, destroy };
	}
}
