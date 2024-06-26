import { getNextId } from '../../utils/dataset';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { __ } from '@wordpress/i18n';
import { MapboxBlockDefaults, MapBoxListing, MarkerProps } from '../../types';
import { geoMarkerStyle } from '../Marker/defaults';
import { locateNearestStore } from '../../utils/spatialCalcs';
import { removePopups, showNearestStore } from '../Popup/';
import { fitInView, flyToStore } from '../../utils/view';
import { removeTempMarkers } from '../Marker/utils';
import { DEFAULT_GEOCODER_TYPE_SEARCH } from '../../constants';
import { initGeoMarker } from '../Marker/Geomarker';
import './style.scss';
import type mapboxgl from 'mapbox-gl';

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
 * @param {MapBoxListing[]}                            filteredListings    - The array of filtered mapbox listings.
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
			marker: marker as unknown as mapboxgl.Marker,
			language: mapDefaults.language || 'en',
			placeholder: __( 'Find the nearest store', 'vsge-mapbox-block' ),
			types: DEFAULT_GEOCODER_TYPE_SEARCH,
		} );

		if ( geocoder && geocoderRef ) {
			( geocoderRef as HTMLElement ).appendChild( geocoder.onAdd( map ) );
		}

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

				const sortedNearestStores = locateNearestStore(
					searchResult.geometry,
					listings
				);

				// @ts-ignore
				const geoMarker = geocoder.mapMarker;

				// The map marker element
				// const markerEl = geocoder.mapMarker.getElement() as HTMLElement;
				geoMarker.geometry = searchResult.geometry;

				geoMarker.onclick = () => {
					// Remove the active class from the geocoder
					geocoder.clear();
				};

				geoMarker.on( 'dragend', () => {
					// Update the marker's position
					const lngLat = geoMarker.getLngLat();
					// Update the marker's position
					geoMarker.setLngLat( lngLat );
					// Center the map
					flyToStore( map, geoMarker );
				} );

				const newFilteredListings = showNearestStore(
					{
						...searchResult,
						id: getNextId( listings ),
						properties: searchResult.properties as MarkerProps,
						geometry: {
							coordinates: [
								geoMarker.getLngLat().lng,
								geoMarker.getLngLat().lat,
							],
							type: 'Point',
						},
					},
					sortedNearestStores,
					mapRef,
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
