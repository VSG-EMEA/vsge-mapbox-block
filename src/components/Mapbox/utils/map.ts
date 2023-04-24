import mapboxgl from 'mapbox-gl';

/**
 * The function initializes a Mapbox map with specified attributes and adds a terrain layer if
 * specified.
 *
 * @param {HTMLElement} mapRef The HTML element that will contain the map.
 * @param {Object}      attributes   An object containing various attributes for initializing the map, including
 *                                   latitude, longitude, pitch, bearing, mapZoom, mapStyle, and treeDimensionality.
 * @return {mapboxgl.Map} a mapboxgl.Map object.
 */
export function initMap( mapRef, attributes ) {
	const { latitude, longitude, pitch, bearing, mapZoom, mapStyle } =
		attributes;

	const map = new mapboxgl.Map( {
		container: mapRef,
		style: 'mapbox://styles/mapbox/' + mapStyle,
		center: [ longitude, latitude ],
		zoom: mapZoom,
		bearing,
		pitch,
	} );

	if ( attributes.treeDimensionality ) {
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
		! attributes.treeDimensionality &&
		map.getSource( 'mapbox-dem' )
	) {
		map.removeSource( 'mapbox-dem' );
	}

	return map;
}
