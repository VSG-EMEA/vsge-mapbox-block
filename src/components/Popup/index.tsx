import './style.scss';
import { createRef, createRoot } from '@wordpress/element';
import mapboxgl from 'mapbox-gl';
import { CoordinatesDef, MapBoxListing, MarkerProps } from '../../types';
import { PopupContent } from './PopupContent';
import { defaultMarkerSize } from '../Marker/defaults';
import { SEARCH_RESULTS_SHOWN } from '../../constants';
import { SearchPopup } from './SearchPopup';
import { enableListing } from '../Sidebar/Listing';

/**
 * The function removes the active popup from the DOM.
 *
 * @param mapRef
 */
export function removePopups( mapRef: HTMLDivElement ) {
	if ( ! mapRef ) {
		return;
	}
	// removes the active popup
	const popUps = mapRef?.querySelectorAll( '.mapboxgl-popup' );
	if ( popUps?.length ) {
		popUps.forEach( ( popUp ) => popUp.remove() );
	}
}

/**
 * This function adds a popup to a Mapbox map with custom content or default content based on a
 * marker's properties.
 *
 * @param                      map             - The map parameter is a mapboxgl.Map object
 * @param                      map.current     - The mapboxgl.Map object representing the map on which the popup will be displayed.
 * @param {MapBoxListing}      marker          - The marker parameter is
 *                                             either a MapBoxListing object or an object with a geometry property that contains coordinates in the
 *                                             LngLatLike format. It is used to set the location of the popup on the map.
 * @param {JSX.Element | null} [children=null] - The `children` parameter is an optional JSX element
 *                                             that can be passed as a child to the `PopupCustom` component. If provided, it will be rendered
 *                                             inside the popup. If not provided, the `PopupContent` component will be rendered with the properties
 *                                             of the `marker` object.
 * @param                      popupRef
 * @return A `mapboxgl.Popup` object is being returned.
 */
export function addPopup(
	map: mapboxgl.Map,
	marker: MapBoxListing,
	popupRef: HTMLDivElement | null = null,
	children?: JSX.Element
): mapboxgl.Popup | null {
	if ( ! marker ) {
		return null;
	}

	// Create a new DOM root and save it to the React ref
	popupRef = document.createElement( 'div' );
	const root = createRoot( popupRef );

	// Render a Marker Component on our new DOM node
	root.render(
		children ?? <PopupContent { ...( marker.properties as MarkerProps ) } />
	);

	return map !== null
		? new mapboxgl.Popup( {
				offset:
					( marker?.properties?.iconSize || defaultMarkerSize ) * 0.5,
		  } )
				.setLngLat( marker?.geometry?.coordinates as CoordinatesDef )
				.setDOMContent( popupRef )
				.addTo( map )
		: null;
}

/**
 * Displays the nearest store and updates the filtered listings.
 *
 * @param {MapboxGeocoder.Result} location            - The location object.
 * @param {MapBoxListing[]}       sortedNearestStores - The sorted list of nearest stores.
 * @param {HTMLDivElement}        mapRef              - The reference to the map container.
 * @param                         map                 The map object.
 * @param                         map.current
 */
export function showNearestStore(
	location: MapBoxListing,
	sortedNearestStores: MapBoxListing[],
	mapRef: HTMLDivElement,
	map: mapboxgl.Map
): MapBoxListing[] {
	removePopups( mapRef as HTMLDivElement );

	/* Open a popup for the closest store. */
	const popupStoreRef = createRef< HTMLDivElement | null >();
	addPopup(
		map,
		location as unknown as MapBoxListing,
		popupStoreRef.current,
		<SearchPopup
			icon={ 'home' }
			name={ location?.place_name }
			category={
				location.properties?.category ??
				location?.place_type?.join( ', ' ) ??
				''
			}
			maki={ location.properties?.maki }
			draggable={ location.properties?.draggable ?? true }
		/>
	);

	/* Open a popup for the closest store. */
	const popupRef = createRef< HTMLDivElement | null >();
	addPopup( map, sortedNearestStores[ 0 ], popupRef.current );

	/** Highlight the listing for the closest store. */
	mapRef
		?.querySelector( '#marker-' + sortedNearestStores[ 0 ]?.id )
		?.classList.add( 'active' );

	enableListing( map, sortedNearestStores[ 0 ] );
}
