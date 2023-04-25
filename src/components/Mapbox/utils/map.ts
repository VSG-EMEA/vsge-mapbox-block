import mapboxgl from 'mapbox-gl';
import { addMarkers, renderListings } from '../MapComponents';

/**
 * The function initializes a Mapbox map with specified attributes and adds a terrain layer if
 * specified.
 *
 * @param {HTMLElement} mapRef     The HTML element that will contain the map.
 * @param {Object}      attributes An object containing various attributes for initializing the map, including
 *                                 latitude, longitude, pitch, bearing, mapZoom, mapStyle, and threeDimensionality.
 * @return {mapboxgl.Map} a mapboxgl.Map object.
 */
export function initMap( mapRef, attributes ) {
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

	const map = new mapboxgl.Map( {
		container: mapRef,
		style: 'mapbox://styles/mapbox/' + mapStyle,
		center: [ longitude, latitude ],
		zoom: mapZoom,
		bearing,
		pitch,
	} );

	map.on( 'load', function () {
		/*		map.setLayoutProperty( 'country-label', 'text-field', [
			'get',
			'name_' + defaults.language.substr( 0, 2 ),
		] );*/

		map.addSource( 'places', {
			type: 'geojson',
			data: stores,
		} );

		addMarkers( stores, map );

		if ( map && attributes.threeDimensionality ) {
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
		} else if (
			! attributes.threeDimensionality &&
			map.getSource( 'mapbox-dem' )
		) {
			map.removeSource( 'mapbox-dem' );
		}
	} );

	return map;
}
