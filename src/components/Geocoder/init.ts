import { getNextId } from '../../utils/dataset';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { __ } from '@wordpress/i18n';
import type { RefObject } from 'react';
import {
	CoordinatesDef,
	MapboxBlockDefaults,
	MapBoxListing,
} from '../../types';
import { geoMarkerStyle } from '../Marker/defaults';
import { locateNearestStore } from '../../utils/spatialCalcs';
import { removePopups, showNearestStore } from '../Popup/';
import { fitInView, flyToStore } from '../../utils/view';
import { removeTempMarkers } from '../Marker/utils';
import { DEFAULT_GEOCODER_TYPE_SEARCH } from '../../constants';
import { initGeoMarker } from '../Marker/Geomarker';
import './style.scss';

/**
 * Initializes the geocoder for the map.
 *
 * @param                                         mapboxgl
 * @param {mapboxgl.Map}                          map                 - The Mapbox map object.
 * @param                                         map.current
 * @param {RefObject<HTMLDivElement> | undefined} mapRef              - The ref object for the map container.
 * @param                                         markersRef
 * @param {RefObject<HTMLDivElement> | undefined} geocoderRef         - The ref object for the geocoder container.
 * @param {MapBoxListing[] | undefined}           listings            - The array of mapbox listings.
 * @param {MapBoxListing[] | null}                filteredListings    - The array of filtered mapbox listings.
 * @param {(listings: MapBoxListing[]) => void}   setFilteredListings - The function to set the filtered listings.
 * @param                                         mapDefaults
 * @return {MapboxGeocoder | undefined} The initialized Mapbox geocoder.
 */
export function initGeoCoder(
	mapboxgl: any,
	map: RefObject< mapboxgl.Map >,
	mapRef: RefObject< HTMLDivElement >,
	markersRef: RefObject< HTMLButtonElement[] >,
	geocoderRef: RefObject< HTMLDivElement > | undefined,
	listings: MapBoxListing[],
	filteredListings: MapBoxListing[],
	setFilteredListings: ( listings: MapBoxListing[] ) => void,
	mapDefaults: MapboxBlockDefaults
): MapboxGeocoder | undefined {
	if ( map.current === null ) {
		return;
	}

	const geomarkerListing = initGeoMarker( getNextId( listings ), markersRef );

	const marker = {
		element: geomarkerListing,
		offset: [ 0, ( geoMarkerStyle.size || 0 ) * -0.5 ],
		draggable: true,
	};

	let searchResult: MapboxGeocoder.Result | undefined;

	if ( mapDefaults.accessToken ) {
		const geocoder = new MapboxGeocoder( {
			accessToken: mapDefaults.accessToken,
			mapboxgl,
			marker,
			language: mapDefaults.language || 'en',
			placeholder: __( 'Find the nearest store', 'vsge-mapbox-block' ),
			types: DEFAULT_GEOCODER_TYPE_SEARCH,
		} );

		if ( geocoder && geocoderRef ) {
			( geocoderRef.current as HTMLElement ).appendChild(
				geocoder.onAdd( map.current )
			);
		}

		function onGeocoderClear() {
			document
				.getElementById( 'feature-listing' )
				?.classList.remove( 'filtered' );
			// Remove the active class from the geocoder
			geocoderRef?.current?.classList.remove( 'active' );
			// add the hide class to the geocoder
			geocoderRef?.current?.classList.add( 'disabled' );

			// Reset the displayed listings
			if ( filteredListings.length > 0 ) {
				setFilteredListings( [] );
			}
			// Remove the search result
			searchResult = undefined;
			// Remove the popup, if any
			removePopups( mapRef as RefObject< HTMLDivElement > );
			// Center the map
			fitInView( map, listings, mapRef );
		}

		function onGeocoderResult( ev: {
			result: MapboxGeocoder.Result | undefined;
		} ) {
			// remove any popup or temp marker (clicked point, another geocoder marker) from the map
			listings = removeTempMarkers( listings, mapRef, [
				'geocoder-marker',
			] );
			removePopups( mapRef as RefObject< HTMLDivElement > );

			// if there are no filtered listings, copy the listings to the filtered listings
			if ( ! filteredListings?.length ) {
				filteredListings = listings as MapBoxListing[];
			}

			// save the search results
			searchResult = ev.result;

			// Add the active class to the geocoder
			geocoderRef?.current?.classList.add( 'active' );

			if ( searchResult ) {
				// Remove the active class from the geocoder
				geocoderRef?.current?.classList.remove( 'disabled' );

				const sortedNearestStores = locateNearestStore(
					searchResult.geometry,
					filteredListings
				);

				// @ts-ignore
				const geoMarker = geocoder.mapMarker;
				console.log( geocoder );

				// The map marker element
				// const markerEl = geocoder.mapMarker.getElement() as HTMLElement;
				geoMarker.geometry = searchResult.geometry;

				geoMarker.onclick = () => {
					// Remove the active class from the geocoder
					console.log( 'geocoder.clear' );
					geocoder.clear();
				};
				geoMarker.on( 'dragend', () => {
					// Update the marker's position
					const lngLat = geoMarker.getLngLat();
					// Update the marker's position
					geoMarker.setLngLat( lngLat );

					flyToStore( map, geoMarker );
				} );

				console.log( 'Search result', searchResult );
				console.log(
					'nearest store to search result coordinates in km: ',
					sortedNearestStores[ 0 ].properties.distance
				);

				const newFilteredListings = showNearestStore(
					searchResult,
					sortedNearestStores,
					mapRef as RefObject< HTMLDivElement >,
					map
				);

				// Display the nearest store
				setFilteredListings( [ ...newFilteredListings, geoMarker ] );
			}
		}

		geocoder.on( 'clear', onGeocoderClear );

		geocoder.on( 'result', onGeocoderResult );

		return geocoder;
	}
}
