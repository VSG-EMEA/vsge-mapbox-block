import mapboxgl, { MapboxGeoJSONFeature } from 'mapbox-gl';
import type { MapBoxListing } from '../../types';
import { SearchMarkerProps } from '../../types';
import { removeMarkerEl } from '../Marker/utils';
import { flyToStore } from '../../utils/view';
import {
	PinPointPopup,
	PopupContent,
	SearchPopup,
} from '../Popup/PopupContent';
import { addPopup } from '../Popup/Popup';

/**
 * The function sets the elevation of a Mapbox map to either a globe or a mercator projection and adds
 * or removes a terrain layer with exaggerated height based on a boolean input.
 *
 * @param           map          - A variable of type `mapboxgl.Map` representing the map object on which the elevation
 *                               will be set.
 * @param {boolean} hasElevation - A boolean value indicating whether or not to enable elevation on the
 *                               map. If true, the map will be displayed with a 3D terrain effect. If false, the map will be
 *                               displayed in 2D.
 */
export function setMapElevation( map: mapboxgl.Map, hasElevation: boolean ) {
	if ( map ) {
		if ( hasElevation ) {
			map.setProjection( 'globe' );
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
			map.setProjection( 'mercator' );
			// unset terrain elevation
			map.setTerrain();
			// unload the DEM source
			if ( map.getSource( 'mapbox-dem' ) )
				map.removeSource( 'mapbox-dem' );
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
 * The function highlights a specific feature in a listing by adding a CSS class to it and removing the
 * class from any previously active feature.
 *
 * @param {MapBoxListing} item - The `item` parameter is of type `Feature`, which is likely an object
 *                             representing a geographic feature on a map. It may contain properties such as the feature's ID,
 *                             coordinates, and other attributes. The function `highlightListing` is using this parameter to
 *                             identify a specific feature and highlight its corresponding
 */
export function highlightListing( item: MapBoxListing ) {
	document.getElementById( 'feature-listing' )?.classList.add( 'filtered' );

	const activeItem = document.getElementsByClassName( 'active-store' );
	if ( activeItem[ 0 ] ) {
		activeItem[ 0 ].classList.remove( 'active-store' );
	}

	if ( item.properties ) {
		const listing = document.getElementById( 'marker-' + item.id );
		listing?.classList.add( 'active-store' );
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
 * Enables the listing feature on the map.
 *
 * @param {mapboxgl.Map}  map    - The map object.
 * @param {MapBoxListing} marker - The listing marker object.
 */
export function enableListing( map: mapboxgl.Map, marker: MapBoxListing ) {
	console.log( 'Listing enabled', marker );

	// 1. Fly to the point
	flyToStore( map, marker );
	const getPopupTemplate = (
		marker: MapBoxListing
	): JSX.Element | undefined => {
		if ( marker.type === 'Feature' ) {
			return <PopupContent { ...marker.properties } />;
		} else if ( marker.properties.name === 'geocoder' ) {
			return (
				<SearchPopup
					{ ...( marker.properties as SearchMarkerProps ) }
				/>
			);
		} else if ( marker.properties.name === 'click-marker' ) {
			return <PinPointPopup location={ marker.geometry.coordinates } />;
		}
		return undefined;
	};

	// 2. Close all other popups and display popup for clicked store
	addPopup( map, marker, getPopupTemplate( marker ) );

	// 3. Highlight listing in sidebar (and remove highlight for all other listings)
	highlightListing( marker );
}

/**
 * The function removes a marker from a list of markers based on its ID.
 *
 * @param {number}                 id          - a number representing the ID of the marker to be removed.
 * @param {MapboxGeoJSONFeature[]} markersList - markersList is an array of MapboxGeoJSONFeature
 *                                             objects. These objects represent markers on a map and contain information such as the marker's
 *                                             location, properties, and ID. The function takes this array as an input parameter and returns a new
 *                                             array with the marker that matches the given ID removed.
 * @return a new array of MapboxGeoJSONFeature objects that do not have the specified id.
 */
export function removeMarkerById(
	id: number,
	markersList: MapboxGeoJSONFeature[]
): MapboxGeoJSONFeature[] {
	return markersList.filter( ( marker ) => marker.id !== id );
}

/**
 * This TypeScript function searches for a specific marker in a list of MapBox listings based on its ID
 * and returns the matching listing.
 *
 * @param {number}          id          - The id parameter is a number that represents the unique identifier of a
 *                                      MapBoxListing object.
 * @param {MapBoxListing[]} markersList - markersList is an array of objects of type MapBoxListing. It
 *                                      contains a list of markers that are displayed on a MapBox map. Each marker object has properties
 *                                      such as id, latitude, longitude, and title. The function takes this array as input and searches for
 *                                      a marker object with a specific
 * @return a `MapBoxListing` object that matches the given `id` parameter from the `markersList`
 * array. If no matching object is found, it will return `undefined`.
 */
export function getMarkerData(
	id: number,
	markersList: MapBoxListing[]
): MapBoxListing | undefined {
	return markersList.find( ( marker ) => marker.id === id );
}

export function getListing(
	listings: MapBoxListing[],
	filteredListings: MapBoxListing[]
): MapBoxListing[] {
	return filteredListings.length > 0 ? filteredListings : listings;
}

/**
 * Updates the listing on the map.
 *
 * @param {MapBoxListing} mapListing - The map listing to be updated.
 * @param                 currentMap
 */
export function updateListing(
	mapListing: MapBoxListing,
	currentMap: HTMLDivElement
) {
	// remove previous marker and popup
	removeMarkerEl( mapListing.id, currentMap );
}
