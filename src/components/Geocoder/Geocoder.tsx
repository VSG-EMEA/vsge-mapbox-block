import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { __ } from '@wordpress/i18n';
import type { RefObject } from 'react';
import { createRoot } from '@wordpress/element';
import mapboxgl from 'mapbox-gl';
import { Marker } from '../Marker/';
import {
	CoordinatesDef,
	MapboxBlockDefaults,
	MapBoxListing,
	MarkerPropsStyle,
	MountedMapsContextValue,
} from '../../types';
import { geoMarkerStyle } from '../Mapbox/defaults';
import { locateNearestStore } from '../../utils/spatialCalcs';
import { removePopups, showNearestStore } from '../Popup/Popup';
import { fitInView, flyToStore } from '../../utils/view';
import { PinPoint } from '../Marker/marker-icons';
import { removeTempMarkers } from '../Marker/utils';
import { DEFAULT_GEOCODER_TYPE_SEARCH } from '../../constants';
import { useMapboxContext } from '../Mapbox/MapboxContext';

function geocoderMarkerDefaults(
	id: number,
	defaultStyle: MarkerPropsStyle
): MapBoxListing {
	return {
		type: 'temp',
		id,
		properties: {
			name: 'geocoder-marker',
			icon: 'geocoder',
			iconSize: defaultStyle.size,
			iconColor: defaultStyle.color,
			draggable: true,
		},
		geometry: {
			type: 'Point',
			coordinates: [ 0, 0 ] as CoordinatesDef,
		},
	};
}

/**
 * This function initializes a map marker using a React component and adds it to a Mapbox map.
 *
 * @param id         - The id of the marker.
 * @param markersRef - The ref object for the map container.
 * @return A mapboxgl.Marker object is being returned.
 */
export const initGeomarker = (
	id: number,
	markersRef: RefObject< HTMLButtonElement[] >
): HTMLButtonElement | null => {
	markersRef.current[ id ] = null;

	// Create a new DOM root and save it to the React ref
	markersRef.current[ id ] = document.createElement(
		'div'
	) as HTMLDivElement;
	markersRef.current[ id ].className = 'marker marker-geocoder disabled';

	const root = createRoot( markersRef.current[ id ] );

	const defaultStyle = geoMarkerStyle;
	const markerData = geocoderMarkerDefaults( id, defaultStyle );

	// Render a Marker Component on our new DOM node
	root.render(
		<Marker
			className={ 'marker marker-geocoder disabled' }
			feature={ markerData }
			children={
				<PinPoint
					color={ defaultStyle.color }
					size={ defaultStyle.size }
				/>
			}
		/>
	);

	return markersRef.current[ id ];
};

/**
 * Initializes the geocoder for the map.
 *
 * @param {mapboxgl.Map}                          map                 - The Mapbox map object.
 * @param                                         map.current
 * @param {RefObject<HTMLDivElement> | undefined} mapRef              - The ref object for the map container.
 * @param {RefObject<HTMLDivElement> | undefined} geocoderRef         - The ref object for the geocoder container.
 * @param                                         marker              - The marker object.
 * @param {MapBoxListing[] | undefined}           listings            - The array of mapbox listings.
 * @param {MapBoxListing[] | null}                filteredListings    - The array of filtered mapbox listings.
 * @param {(listings: MapBoxListing[]) => void}   setFilteredListings - The function to set the filtered listings.
 * @param {MapboxBlockDefaults}                   defaults            - The default settings for the mapbox block.
 * @return {MapboxGeocoder | undefined} The initialized Mapbox geocoder.
 */
export const initGeocoder = (
	map: RefObject< mapboxgl.Map | null >,
	mapRef: RefObject< HTMLDivElement > | undefined,
	geocoderRef: RefObject< HTMLDivElement > | undefined,
	marker: mapboxgl.Marker,
	listings: MapBoxListing[],
	filteredListings: MapBoxListing[],
	setFilteredListings: ( listings: MapBoxListing[] ) => void,
	defaults: MapboxBlockDefaults
): MapboxGeocoder | undefined => {
	let searchResult: MapboxGeocoder.Result | undefined;

	if ( defaults.accessToken ) {
		const geocoder: MapboxGeocoder = new MapboxGeocoder( {
			accessToken: defaults.accessToken,
			mapboxgl,
			marker,
			language: defaults.language || 'en',
			placeholder: __( 'Find the nearest store' ),
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

		function onGeocoderResult( ev ) {
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

			if ( searchResult && filteredListings ) {
				// Remove the active class from the geocoder
				geocoderRef?.current?.classList.remove( 'disabled' );

				const sortedNearestStores = locateNearestStore(
					searchResult.geometry,
					filteredListings
				);

				const geoMarker = geocoder.mapMarker;

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
				setFilteredListings( newFilteredListings );
			}
		}

		geocoder.on( 'clear', onGeocoderClear );

		geocoder.on( 'result', onGeocoderResult );

		return geocoder;
	}
};

/**
 * This is a TypeScript React function that returns a JSX element representing a geocoder marker.
 */
export const GeoCoder = () => {
	const { geocoderRef }: MountedMapsContextValue = useMapboxContext();
	return <div className="geocoder" ref={ geocoderRef }></div>;
};
