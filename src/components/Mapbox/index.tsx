import { Map } from './Map';
import { TopBar } from '../TopBar';
import { useEffect, useState } from '@wordpress/element';
import { useMapboxContext } from './MapboxContext';
import { getMarkerData, initMap } from './utils';
import mapboxgl, { MapMouseEvent } from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import { GeoCoder, initGeocoder, initGeomarker } from '../Geocoder/Geocoder';
import {
	CoordinatesDef,
	MapAttributes,
	MapboxBlockDefaults,
	MapBoxListing,
	MarkerHTMLElement,
	MountedMapsContextValue,
} from '../../types';
import { removeTempListings, removeTempMarkers } from '../Marker/utils';
import { addPopup } from '../Popup/Popup';
import { getNextId } from '../../utils/dataset';
import type { RefObject } from 'react';
import { generateTempMarkerData } from './defaults';
import { fitInView } from '../../utils/view';
import { clearListingsDistances, getBbox } from '../../utils/spatialCalcs';
import { PinPointPopup } from '../Popup/PopupContent';

/**
 * Renders a MapBox component.
 *
 * @param {Object}              props             - The props object containing attributes, mapDefaults, and isEditor.
 * @param {MapAttributes}       props.attributes  - The attributes of the MapBox component.
 * @param {MapboxBlockDefaults} props.mapDefaults - The default settings for the MapBox component.
 * @param {boolean}             [props.isEditor]  - A boolean indicating whether the component is being used in an editor.
 * @return {JSX.Element} The rendered MapBox component.
 */
export function MapBox( {
	attributes,
	mapDefaults,
	isEditor,
}: {
	attributes: MapAttributes;
	mapDefaults: MapboxBlockDefaults;
	isEditor?: boolean;
} ): JSX.Element {
	const {
		map,
		mapRef,
		setMap,
		setGeoCoder,
		geocoderRef,
		markersRef,
		setLngLat,
		listings,
		setListings,
		filteredListings,
		setFilteredListings,
	}: MountedMapsContextValue = useMapboxContext();
	const [ loaded, setLoaded ] = useState( false );

	/**
	 * This function removes a marker from a map using its ID.
	 *
	 * @param {number} id - The `id` parameter is a number that represents the unique identifier of a
	 *                    marker that needs to be removed from a map.
	 */
	function removeMarker( id: number ) {
		if ( mapRef?.current ) {
			mapRef?.current
				.querySelector( '#marker-' + id )
				?.parentElement?.remove();
		}
	}

	/**
	 * Updates the listing on the map.
	 *
	 * @param {MapBoxListing} mapListing - The map listing to be updated.
	 */
	function updateListing( mapListing: MapBoxListing ) {
		// remove previous marker and popup
		removeMarker( mapListing.id );
	}

	/**
	 * Updates the listings on the map.
	 * @param filteredStores - The filtered listings.
	 */
	function updateCamera( filteredStores: MapBoxListing[] ) {
		if ( ! map ) return;

		// if filtered listings are present
		if ( filteredStores?.length ) {
			if ( filteredStores?.length === 2 ) {
				/**
				 * Adjust the map camera:
				 * Get a bbox that contains both the geocoder result and
				 * the closest store. Fit the bounds to that bbox.
				 */
				const bbox = getBbox(
					filteredStores[ 0 ].geometry,
					filteredStores[ 1 ].geometry
				);

				map?.cameraForBounds( bbox, {
					padding: 50,
				} );
			} else {
				fitInView( map, filteredStores, mapRef );
			}
			return;
		}
		fitInView( map, filteredStores, mapRef );
	}

	/**
	 * Listens for a click event on the map and performs various actions based on the click position and element clicked.
	 *
	 * @param {mapboxgl.Map} currentMap - The current map object.
	 */
	function listenForClick( currentMap: mapboxgl.Map ) {
		if ( currentMap ) {
			currentMap.on( 'click', ( e: MapMouseEvent ) => {
				// store the last clicked position
				setLngLat( e.lngLat );
				const clickedPoint = [
					e.lngLat.lng,
					e.lngLat.lat,
				] as CoordinatesDef;

				const clickedFeatures = currentMap.queryRenderedFeatures(
					e.point
				);

				if ( clickedFeatures?.length ) {
					console.log( clickedFeatures );
				}

				// Find features intersecting the bounding box.
				const clickedEl = (
					e.originalEvent?.target as HTMLElement
				 )?.closest( 'button' ) as MarkerHTMLElement | null;

				if ( listings?.length && clickedEl?.nodeName === 'BUTTON' ) {
					// get the marker data
					const markerData: MapBoxListing | undefined = getMarkerData(
						Number( clickedEl.dataset?.id ) || 0,
						listings
					);
					const markerCoordinates =
						markerData?.geometry?.coordinates || clickedPoint;

					// adds the new Marker popup
					if ( isEditor ) {
						return;
					}

					if ( clickedEl.dataset?.markerName === 'geocoder-marker' ) {
						return;
					}

					if ( clickedEl.dataset?.markerName === 'click-marker' ) {
						// prints the popup that allow the user to find a location
						addPopup(
							currentMap,
							{
								geometry: {
									coordinates:
										markerCoordinates ?? clickedPoint,
								},
							},
							<PinPointPopup
								location={ markerCoordinates ?? clickedPoint }
								listings={ listings }
								setFilteredListings={ setFilteredListings }
								mapRef={ mapRef }
								map={ map }
								filteredListings={ filteredListings }
							/>
						);
						return;
					}

					if ( markerData ) {
						// popup the marker data on the currentMap
						addPopup( currentMap, markerData );
						return;
					}
				}

				clearListingsDistances( filteredListings );

				// Generate the metadata for the pin marker if nothing was clicked
				const newTempMarker = generateTempMarkerData(
					getNextId( listings ),
					clickedPoint
				);

				// clear the temp marker from the list
				removeTempMarkers( mapRef );

				const newListings = [
					...removeTempListings( listings ),
					newTempMarker,
				];

				// store the new marker in the markers array
				setListings( newListings );
			} );
		}
	}

	useEffect( () => {
		if ( loaded ) return;

		if ( mapDefaults?.accessToken && mapRef?.current ) {
			// Initialize map and store the map instance
			const newMap = initMap( mapRef.current, attributes, mapDefaults );
			setMap( newMap );

			// Adds the default listings  to the map
			setListings( attributes.mapboxOptions.listings );

			// Set the state of the map
			setLoaded( true );

			// Add the language control to the map
			const language = new MapboxLanguage();
			newMap.addControl( language );

			// Listen for clicks on the map
			listenForClick( newMap, mapRef );
		} else {
			console.log( 'No access token' );
		}
	}, [] );

	// Geocoder
	// this is needed because it can be enabled and disabled
	useEffect( () => {
		if ( ! loaded ) return;
		if ( attributes.geocoderEnabled ) {
			const geoMarkerId = getNextId( listings );
			markersRef.current[ geoMarkerId ] = null;

			const geomarkerListing = initGeomarker(
				geoMarkerId,
				markersRef.current[ geoMarkerId ],
				map,
				mapRef
			);

			setGeoCoder(
				initGeocoder(
					map,
					mapRef,
					geocoderRef,
					geomarkerListing,
					listings,
					filteredListings,
					setFilteredListings,
					mapDefaults
				)
			);
		}
	}, [ loaded, attributes.geocoderEnabled ] );

	/**
	 * if the access key isn't provided
	 */
	if ( typeof mapDefaults?.accessToken !== 'string' ) {
		return (
			<>
				<div>
					<p>
						<a
							href="//account.mapbox.com/auth/signup/"
							target="_blank"
							rel="noreferrer"
						>
							Get a Mapbox Access Token
						</a>
						then add the token to your config.php file as a constant
						<code>MAPBOX_TOKEN</code>
					</p>
				</div>
			</>
		);
	}

	/**
	 * The mapbox component
	 */
	return (
		<div
			className={ 'map-wrapper' }
			style={ { minHeight: attributes.mapHeight } }
		>
			{ attributes.sidebarEnabled ? (
				<div className={ 'map-sidebar' }>
					{ !! attributes.geocoderEnabled && (
						<GeoCoder geocoderRef={ geocoderRef } />
					) }
					<TopBar />
				</div>
			) : null }
			<div className={ 'map-container' }>
				<TopBar { ...attributes } />
				<Map
					map={ map }
					mapRef={ mapRef as RefObject< HTMLDivElement > }
					markersRef={ markersRef as RefObject< HTMLDivElement > }
					listings={ listings }
					icons={ attributes.mapboxOptions.icons }
				/>
			</div>
		</div>
	);
}
