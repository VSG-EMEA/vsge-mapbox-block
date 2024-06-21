import type { MapAttributes, MapboxBlockDefaults } from '../../types';
import { prepareStores } from '../../utils/dataset';
import { setMapElevation, setMapThreeDimensionality } from './utils';
import type { Feature } from '@turf/turf';
import type mapboxgl from 'mapbox-gl';
import './style.scss';

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
	mapboxgl: any,
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

	const map = new mapboxgl.Map( {
		container: mapHtmlElement,
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
		if ( map.getLayer( 'country-label' ) ) {
			map.setLayoutProperty( 'country-label', 'text-field', [
				'get',
				'name_' + defaults.language || 'en',
			] );
		}

		// Add a GeoJSON source for the stores
		map.addSource( 'geojson-stores', {
			type: 'geojson',
			data: {
				type: 'FeatureCollection',
				features: prepareStores(
					mapboxOptions.listings as Feature< GeoJSON.Geometry >[]
				),
			},
		} as any );

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
