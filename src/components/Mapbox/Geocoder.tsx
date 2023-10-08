import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { __ } from '@wordpress/i18n';
import type { RefObject } from 'react';
import { createRef, createRoot } from '@wordpress/element';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import { Marker } from './Marker';
import { MapboxBlockDefaults, MapBoxListing } from '../../types';
import { geoMarkerStyle } from './defaults';
import { locateNearestStore } from '../../utils/spatialCalcs';
import { addPopup, removePopups } from './Popup';
import { fitInView } from '../../utils/view';
import { PinPoint } from './Pin';
import { getNextId } from '../../utils/dataset';
import { SearchPopup } from './PopupContent';

/**
 * This function initializes a map marker using a React component and adds it to a Mapbox map.
 *
 * @param id
 * @param map - mapboxgl.Map - This is an instance of the Mapbox GL JS map object on which the marker
 *            will be placed.
 * @param mapRef - RefObject< HTMLDivElement > - This is a reference to the DOM node that will be used
 * @return A mapboxgl.Marker object is being returned.
 */
const initGeomarker = (
	id: number,
	map: mapboxgl.Map
): RefObject< HTMLDivElement > => {
	const markerRef = createRef< HTMLDivElement >();
	// Create a new DOM root and save it to the React ref
	markerRef.current = document.createElement( 'div' ) as HTMLDivElement;
	markerRef.current.className = 'marker marker-geocoder disabled';
	const root = createRoot( markerRef.current );
	const defaultStyle = geoMarkerStyle;

	// Render a Marker Component on our new DOM node
	root.render(
		<Marker
			feature={ {
				type: 'GeocoderMarker',
				id,
				properties: {
					name: 'geocoder',
					icon: 'geocoder',
					iconSize: defaultStyle.size,
					iconColor: defaultStyle.color,
				},
				geometry: {
					type: 'Point',
					coordinates: [ 0, 0 ],
				},
			} }
			map={ map }
			children={
				<PinPoint
					color={ defaultStyle.color }
					size={ defaultStyle.size }
				/>
			}
		/>
	);

	// Add markers to the map.
	return markerRef;
};

export const initGeocoder = (
	map: mapboxgl.Map,
	mapRef: React.RefObject< HTMLDivElement > | undefined,
	geocoderRef: React.RefObject< HTMLDivElement > | undefined,
	listings: MapBoxListing[] | undefined,
	filteredListings: MapBoxListing[] | null,
	setFilteredListings: ( listings: MapBoxListing[] ) => void,
	defaults: MapboxBlockDefaults
): MapboxGeocoder | undefined => {
	let searchResult: MapboxGeocoder.Result | undefined;

	const geoMarkerRef = initGeomarker( 0, map );
	const marker = {
		element: geoMarkerRef.current as HTMLElement,
		color: 'grey',
		offset: [ 0, ( geoMarkerStyle.size || 0 ) * -0.5 ],
	};

	if ( defaults.accessToken ) {
		const geocoder: MapboxGeocoder = new MapboxGeocoder( {
			accessToken: defaults.accessToken,
			mapboxgl,
			marker,
			language: defaults.language || 'en',
			placeholder: __( 'Find the nearest store' ),
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
			geoMarkerRef?.current?.classList.add( 'disabled' );

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
				geoMarkerRef?.current?.classList.remove( 'disabled' );

				const sortedNearestStores = locateNearestStore(
					searchResult.geometry,
					filteredListings
				);

				// The map marker element
				// const markerEl = geocoder.mapMarker.getElement() as HTMLElement;

				console.log( 'Search result', searchResult );
				console.log(
					'nearest store to search result coordinates in km: ',
					sortedNearestStores[ 0 ].properties.distance
				);

				const newFilteredListings: MapBoxListing[] = [
					sortedNearestStores[ 0 ],
					{
						id: getNextId( filteredListings ),
						type: 'GeocoderMarker',
						properties: {
							name: 'geocoder',
							icon: 'geocoder',
						},
						geometry: {
							type: 'Point',
							coordinates: searchResult.geometry
								.coordinates as LngLatLike,
						},
					},
				];

				// Display the nearest store
				setFilteredListings( newFilteredListings );

				console.log( newFilteredListings );

				removePopups( mapRef as RefObject< HTMLDivElement > );
				/* Open a popup for the closest store. */
				addPopup(
					map,
					newFilteredListings[ 1 ],
					<SearchPopup
						icon={ 'geocoder' }
						name={ searchResult.text }
						placeName={ searchResult.place_name }
						category={ searchResult.properties?.category }
						maki={ searchResult.properties?.maki }
						distance={
							sortedNearestStores[ 0 ].properties.distance
						}
					/>
				);

				/* Open a popup for the closest store. */
				addPopup( map, newFilteredListings[ 0 ] );

				/** Highlight the listing for the closest store. */
				mapRef?.current
					?.querySelector( '#marker-' + sortedNearestStores[ 0 ].id )
					?.classList.add( 'active-store' );
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
