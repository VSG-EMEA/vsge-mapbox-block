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
} from '../../types';
import { geoMarkerStyle } from '../Mapbox/defaults';
import { locateNearestStore } from '../../utils/spatialCalcs';
import { removePopups } from '../Popup/Popup';
import { fitInView, flyToStore } from '../../utils/view';
import { PinPoint } from '../Marker/marker-icons';
import { showNearestStore } from '../../utils/dataset';
import { removeTempMarkers } from '../Marker/utils';
import { DEFAULT_GEOCODER_TYPE_SEARCH } from '../../constants';

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
 * @param id
 * @param ref
 * @param map    - mapboxgl.Map - This is an instance of the Mapbox GL JS map object on which the marker
 *               will be placed.
 * @param mapRef
 * @return A mapboxgl.Marker object is being returned.
 */
export const initGeomarker = (
	id: number,
	ref: HTMLButtonElement,
	map: mapboxgl.Map,
	mapRef: RefObject< HTMLDivElement >
): MapBoxListing => {
	// Create a new DOM root and save it to the React ref
	ref = document.createElement( 'div' ) as HTMLDivElement;
	ref.className = 'marker marker-geocoder disabled';

	const root = createRoot( ref );

	const defaultStyle = geoMarkerStyle;
	const markerData = geocoderMarkerDefaults( id, defaultStyle );

	// Render a Marker Component on our new DOM node
	root.render(
		<Marker
			className={ 'marker marker-geocoder disabled' }
			feature={ markerData }
			map={ map }
			mapRef={ mapRef }
			children={
				<PinPoint
					color={ defaultStyle.color }
					size={ defaultStyle.size }
				/>
			}
		/>
	);

	return ref;
};

/**
 * Initializes the geocoder for the map.
 *
 * @param {mapboxgl.Map}                          map                 - The Mapbox map object.
 * @param {RefObject<HTMLDivElement> | undefined} mapRef              - The ref object for the map container.
 * @param                                         markersRef
 * @param {RefObject<HTMLDivElement> | undefined} geocoderRef         - The ref object for the geocoder container.
 * @param geomarkerListing
 * @param {MapBoxListing[] | undefined}           listings            - The array of mapbox listings.
 * @param {MapBoxListing[] | null}                filteredListings    - The array of filtered mapbox listings.
 * @param {(listings: MapBoxListing[]) => void}   setFilteredListings - The function to set the filtered listings.
 * @param {MapboxBlockDefaults}                   defaults            - The default settings for the mapbox block.
 * @return {MapboxGeocoder | undefined} The initialized Mapbox geocoder.
 */
export const initGeocoder = (
	map: mapboxgl.Map,
	mapRef: RefObject< HTMLDivElement > | undefined,
	geocoderRef: RefObject< HTMLDivElement > | undefined,
	geomarkerListing: MapBoxListing,
	listings: MapBoxListing[],
	filteredListings: MapBoxListing[],
	setFilteredListings: ( listings: MapBoxListing[] ) => void,
	defaults: MapboxBlockDefaults
): MapboxGeocoder | undefined => {
	let searchResult: MapboxGeocoder.Result | undefined;

	const marker = {
		element: geomarkerListing,
		offset: [ 0, ( geoMarkerStyle.size || 0 ) * -0.5 ],
		draggable: true,
	};

	if ( defaults.accessToken ) {
		const geocoder: MapboxGeocoder = new MapboxGeocoder( {
			accessToken: defaults.accessToken,
			mapboxgl,
			marker,
			language: defaults.language || 'en',
			placeholder: __( 'Find the nearest store' ),
			types: DEFAULT_GEOCODER_TYPE_SEARCH,
		} );

		if ( geocoderRef ) {
			( geocoderRef.current as HTMLElement ).appendChild(
				geocoder.onAdd( map )
			);
		}

		geocoder.on( 'clear', function () {
			document
				.getElementById( 'feature-listing' )
				?.classList.remove( 'filtered' );
			// Remove the active class from the geocoder
			geocoderRef?.current?.classList.remove( 'active' );
			// add the hide class to the geocoder
			geomarkerListing.ref?.current?.classList.add( 'disabled' );

			// Reset the displayed listings
			setFilteredListings( listings );
			// Remove the search result
			searchResult = undefined;
			// Remove the popup, if any
			removePopups( mapRef as RefObject< HTMLDivElement > );
			// Center the map
			fitInView( map, listings, mapRef );
		} );

		geocoder.on( 'result', ( ev ) => {
			// remove any popup or temp marker (clicked point, another geocoder marker) from the map
			removeTempMarkers( mapRef as RefObject< HTMLDivElement >, [
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
				geomarkerListing.ref?.current?.classList.remove( 'disabled' );

				const sortedNearestStores = locateNearestStore(
					searchResult.geometry,
					filteredListings
				);

				const geoMarker = geocoder.mapMarker as Mapboxgl.Marker;

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
					filteredListings,
					mapRef as RefObject< HTMLDivElement >,
					map
				);

				// Display the nearest store
				setFilteredListings( newFilteredListings );
			}
		} );

		return geocoder;
	}

	console.log( 'No access token given to geocoder' );
};

/**
 * This is a TypeScript React function that returns a JSX element representing a geocoder marker.
 *
 * @param       props
 * @param {Ref} props.geocoderRef - The reference to the geocoder element
 */
export const GeoCoder = ( { geocoderRef } ) => {
	return <div className="geocoder" ref={ geocoderRef }></div>;
};
