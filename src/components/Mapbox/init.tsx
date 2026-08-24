import type { MapAttributes, MapboxBlockDefaults } from '../../types';
import { getMapStyleUrl, toFeatureCollection } from '../../utils/dataset';
import { setMapElevation, setMapThreeDimensionality } from './utils';
import type mapboxgl from 'mapbox-gl';
import './style.scss';

type MapboxGL = typeof mapboxgl;

/**
 * The function initializes a Mapbox map with specified attributes and adds a terrain layer if
 * specified.
 *
 * @param               mapboxgl
 * @param {HTMLElement} mapHtmlElement The HTML element that will contain the map.
 * @param {Object}      attributes     An object containing various attributes for initializing the map, including
 *                                     latitude, longitude, pitch, bearing, mapZoom, mapStyle, and freeViewCamera.
 * @param {Object}      defaults       An object containing default values for the map.
 * @return {mapboxgl.Map} a mapboxgl.Map object.
 */
export function initMap(
	mapbox: MapboxGL,
	mapHtmlElement: HTMLDivElement,
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

	const map = new mapbox.Map( {
		container: mapHtmlElement,
		style: getMapStyleUrl( mapStyle ),
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
		map.addControl( new mapbox.NavigationControl(), 'top-right' );

		setMapThreeDimensionality( map, attributes.freeViewCamera );

		// Add a GeoJSON source for the stores
		map.addSource( 'geojson-stores', {
			type: 'geojson',
			data: toFeatureCollection( mapboxOptions.listings ),
		} );

		// Add a layer showing the places.
		map.addLayer( {
			id: 'stores',
			type: 'symbol',
			source: 'geojson-stores',
			layout: {
				'icon-allow-overlap': true,
			},
		} );
	} );

	return map;
}
