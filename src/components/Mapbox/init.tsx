import type {
	MapAttributes,
	MapboxBlockDefaults,
	MapBoxListing,
} from '../../types';
import type { Feature } from '@turf/turf';
import { getNextId } from '../../utils/dataset';
import { initGeocoder, initGeomarker } from '../Geocoder/Geocoder';
import type { RefObject } from 'react';
import { geoMarkerStyle } from './defaults';
import { setMapElevation, setMapThreeDimensionality } from './utils';
import mapboxgl from 'mapbox-gl';

/**
 * The function initializes a Mapbox map with specified attributes and adds a terrain layer if
 * specified.
 *
 * @param {HTMLElement} mapRef     The HTML element that will contain the map.
 * @param {Object}      attributes An object containing various attributes for initializing the map, including
 *                                 latitude, longitude, pitch, bearing, mapZoom, mapStyle, and freeViewCamera.
 * @param {Object}      defaults   An object containing default values for the map.
 * @return {mapboxgl.Map} a mapboxgl.Map object.
 */
export function initMap(
	mapRef: string | HTMLDivElement,
	attributes: MapAttributes,
	defaults: MapboxBlockDefaults
): mapboxgl.Map {
	const {
		latitude,
		longitude,
		pitch,
		bearing,
		mapZoom,
		mapStyle,
		mouseWheelZoom,
		freeViewCamera,
		mapboxOptions,
	} = attributes;

	const map = new mapboxgl.Map( {
		container: mapRef,
		style: 'mapbox://styles/mapbox/' + mapStyle,
		antialias: true,
		center: [ longitude, latitude ],
		zoom: mapZoom,
		accessToken: defaults.accessToken,
		bearing,
		pitch,
		scrollZoom: mouseWheelZoom,
		dragRotate: freeViewCamera,
	} );

	map.on( 'load', function () {
		// Set the map's terrain layer.
		setMapElevation( map, attributes.elevation );

		// Add navigation control (the +/- zoom buttons)
		map.addControl( new mapboxgl.NavigationControl(), 'top-right' );

		setMapThreeDimensionality( map, attributes.freeViewCamera );

		// Set up the language.
		if ( map.getLayer( 'country-label' ) )
			map.setLayoutProperty( 'country-label', 'text-field', [
				'get',
				'name_' + defaults?.language?.substring( 0, 2 ) || 'en',
			] );

		// Add a GeoJSON source for the stores
		map.addSource( 'geojson-stores', {
			type: 'geojson',
			data: {
				type: 'FeatureCollection',
				features:
					mapboxOptions.listings as Feature< GeoJSON.Geometry >[],
			},
		} );

		// Add a layer showing the places.
		map.addLayer( {
			id: 'geojson-stores',
			type: 'symbol',
			source: 'geojson-stores',
			layout: {
				'icon-allow-overlap': true,
			},
		} );
	} );

	return map;
}

export function initGeoCoder(
	map: mapboxgl.Map,
	mapRef: RefObject< HTMLDivElement >,
	markersRef: RefObject< HTMLButtonElement[] >,
	geocoderRef: RefObject< HTMLDivElement > | undefined,
	listings: MapBoxListing[],
	filteredListings: MapBoxListing[],
	setFilteredListings: ( listings: MapBoxListing[] ) => void,
	mapDefaults: MapboxBlockDefaults
) {
	const geomarkerListing = initGeomarker(
		getNextId( listings ),
		markersRef,
		map,
		mapRef
	);

	const marker: mapboxgl.Marker = {
		element: geomarkerListing,
		offset: [ 0, ( geoMarkerStyle.size || 0 ) * -0.5 ],
		draggable: true,
	};

	return initGeocoder(
		map,
		mapRef,
		geocoderRef,
		marker,
		listings,
		filteredListings,
		setFilteredListings,
		mapDefaults
	);
}
