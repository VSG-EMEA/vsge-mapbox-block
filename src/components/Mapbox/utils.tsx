import type mapboxgl from 'mapbox-gl';
import type { MapBoxListing } from '../../types';
import { getEffectiveProjection } from '../../utils/projection';

/**
 * The function sets the elevation of a Mapbox map to either a globe or configured projection and adds
 * or removes a terrain layer with exaggerated height based on a boolean input.
 *
 * @param map           - A variable of type `mapboxgl.Map` representing the map object on which the elevation will be set.
 * @param hasElevation  - A boolean value indicating whether or not to enable elevation on the map.
 * @param mapProjection - The configured map projection.
 */
export function setMapElevation(
	map: mapboxgl.Map,
	hasElevation: boolean,
	mapProjection?: string
) {
	if ( map ) {
		if ( hasElevation ) {
			map.setProjection( getEffectiveProjection( mapProjection, true ) );
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
			map.setProjection( getEffectiveProjection( mapProjection, false ) );
			// unset terrain elevation
			map.setTerrain();
			// unload the DEM source
			if ( map.getSource( 'mapbox-dem' ) ) {
				map.removeSource( 'mapbox-dem' );
			}
		}
	}
}

/**
 * This function enables or disables map rotation based on a boolean input.
 *
 * @param           map                    - A variable of type `mapboxgl.Map` representing the map object that we want to modify.
 * @param {boolean} hasThreeDimensionality - A boolean value indicating whether the map should have
 *                                         three dimensionality enabled or not. If set to true, the map will allow rotation using right click +
 *                                         drag and touch rotation gesture. If set to false, the map rotation will be disabled.
 */
export function setMapThreeDimensionality(
	map: mapboxgl.Map,
	hasThreeDimensionality: boolean
) {
	if ( map ) {
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
}

/**
 * This function enables or disables mouse wheel zoom and touch zoom/rotate on a map depending on the
 * boolean value passed as an argument.
 *
 * @param           map            - A variable representing a map object from the Mapbox GL JS library.
 * @param {boolean} mouseWheelZoom - A boolean value that determines whether the map should zoom in or
 *                                 out when the user scrolls the mouse wheel. If set to true, the map will zoom in or out when the user
 *                                 scrolls the mouse wheel. If set to false, the map will not zoom in or out when the user scrolls the
 *                                 mouse
 */
export function setMapWheelZoom( map: mapboxgl.Map, mouseWheelZoom: boolean ) {
	if ( map ) {
		if ( mouseWheelZoom ) {
			map.scrollZoom.enable();
		} else {
			map.scrollZoom.disable();
			map.touchZoomRotate.disable();
		}
	}
}

/**
 * Returns a list of MapBoxListing objects based on the given listings and filteredListings.
 *
 * @param {MapBoxListing[]} listings         - An array of MapBoxListing objects representing all the listings.
 * @param {MapBoxListing[]} filteredListings - An array of MapBoxListing objects representing the filtered listings.
 * @return {MapBoxListing[]} - A filtered list (including an intentionally empty one), or all listings when no filter is active.
 */
export function getListing(
	listings: MapBoxListing[],
	filteredListings: MapBoxListing[] | null
): MapBoxListing[] {
	return filteredListings === null ? listings : filteredListings;
}
