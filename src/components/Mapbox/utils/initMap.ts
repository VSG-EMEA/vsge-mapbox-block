import mapboxgl from 'mapbox-gl';
import { addMarkers } from '../Markers';

export function setMapElevation( map: mapboxgl.Map, hasElevation: boolean ) {
	if ( hasElevation ) {
		if ( ! map.getSource( 'mapbox-dem' ) ) {
			map.addSource( 'mapbox-dem', {
				type: 'raster-dem',
				url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
				tileSize: 512,
				maxzoom: 14,
			} );
		}

		// add the DEM source as a terrain layer with exaggerated height
		map.setTerrain( {
			source: 'mapbox-dem',
			exaggeration: 1.5,
		} );
	} else {
		if ( map.getSource( 'mapbox-dem' ) ) map.removeSource( 'mapbox-dem' );
		map.setTerrain();
	}
}

export function setMapThreeDimensionality(
	map: mapboxgl.Map,
	hasThreeDimensionality: boolean
) {
	if ( hasThreeDimensionality ) {
		// enable map rotation using right click + drag
		map.dragRotate.enable();

		// enable map rotation using touch rotation gesture
		map.touchZoomRotate.enableRotation();
	} else {
		// disable map rotation using right click + drag
		map.dragRotate.disable();

		// disable map rotation using touch rotation gesture
		map.touchZoomRotate.disableRotation();
	}
}

/**
 * The function initializes a Mapbox map with specified attributes and adds a terrain layer if
 * specified.
 *
 * @param {HTMLElement} mapRef     The HTML element that will contain the map.
 * @param {Object}      attributes An object containing various attributes for initializing the map, including
 *                                 latitude, longitude, pitch, bearing, mapZoom, mapStyle, and threeDimensionality.
 * @param               defaults
 * @return {mapboxgl.Map} a mapboxgl.Map object.
 */
export function initMap( mapRef, attributes, defaults ) {
	const {
		latitude,
		longitude,
		pitch,
		bearing,
		mapZoom,
		mapStyle,
		mapboxOptions,
	} = attributes;

	const stores = {
		type: 'FeatureCollection',
		features: mapboxOptions.listings,
	};

	const markers = [];

	const map = new mapboxgl.Map( {
		container: mapRef,
		style: 'mapbox://styles/mapbox/' + mapStyle,
		center: [ longitude, latitude ],
		zoom: mapZoom,
		bearing,
		pitch,
	} );

	map.on( 'load', function () {
		map.setLayoutProperty( 'country-label', 'text-field', [
			'get',
			'name_' + defaults?.language?.substring( 0, 2 ) || 'en',
		] );

		// Add navigation control (the +/- zoom buttons)
		map.addControl( new mapboxgl.NavigationControl(), 'top-right' );

		addMarkers( stores, map, stores, markers );

		if ( map ) {
			setMapThreeDimensionality( map, attributes.threeDimensionality );

			setMapElevation( map, attributes.elevation );
		}
	} );

	return map;
}
