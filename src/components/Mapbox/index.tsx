import { Map } from './Map';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useContext, useEffect } from '@wordpress/element';
import { MapboxContext } from './MapboxContext';
import { getMarkerData, initMap } from './utils';
import mapboxgl, { LngLatLike, MapMouseEvent, Point } from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import { GeoCoder, initGeocoder } from './Geocoder';
import {
	MapAttributes,
	MapboxBlockDefaults,
	MapBoxListing,
	MarkerHTMLElement,
	MountedMapsContextValue,
} from '../../types';
import { addMarker, addMarkers, removeTempMarkers } from './Markers';
import { addPopup, removePopups } from './Popup';
import { getNextId } from '../../utils/dataset';
import type { RefObject } from 'react';
import { Button } from '@wordpress/components';
import { defaultMarkerProps, generateTempMarkerData } from './defaults';
import { fitInView } from '../../utils/view';
import { getBbox, locateNearestStore } from '../../utils/spatialCalcs';

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
		setLngLat,
		listings,
		setListings,
		filteredListings,
		setFilteredListings,
	}: MountedMapsContextValue = useContext( MapboxContext );

	/**
	 * The function restores the initial markers on a map using a setMarkers function and a listings
	 * attribute.
	 */
	function restoreInitialMarkers() {
		setListings( attributes.mapboxOptions.listings );
		setFilteredListings( null );
	}

	/**
	 * This function removes a marker from a map using its ID.
	 *
	 * @param {number} id - The `id` parameter is a number that represents the unique identifier of a
	 *                    marker that needs to be removed from a map.
	 */
	function removeMarker( id: number ) {
		if ( mapRef?.current ) {
			mapRef?.current.querySelector( '#marker-' + id )?.remove();
		}
	}

	/**
	 * This function adds a new marker to a map with a given ID and coordinates.
	 *
	 * @param {number}     id           - A number representing the unique identifier for the new listing being added.
	 * @param {LngLatLike} clickedPoint - LngLatLike is a type that represents a longitude and latitude
	 *                                  coordinate pair on a map. In this function, clickedPoint is the location where the user clicked on
	 *                                  the map, and it is used to set the coordinates of a new marker that will be added to the map.
	 */
	function addNewListing( id: number, clickedPoint: LngLatLike ) {
		if ( mapRef?.current ) {
			// remove previous marker and popup
			removeMarker( id );
			removePopups( mapRef );
		}
		// then add the new marker and store the new marker in the markers array
		if ( map && listings ) {
			const mapBoxListing: MapBoxListing = {
				id,
				type: 'Feature',
				properties: {
					...defaultMarkerProps,
					name: 'New Listing',
					iconSize: 48,
					iconColor: '#0FF',
					icon: 'pin',
				},
				geometry: {
					type: 'Point',
					coordinates: clickedPoint,
				},
			};

			// then add the new marker and store the new marker in the markers array
			addMarker( mapBoxListing, map, attributes.mapboxOptions.icons );
			setListings( [ ...listings, mapBoxListing ] );
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

		// then add the new marker and store the new marker in the markers array
		addMarker( mapListing, map, attributes.mapboxOptions.icons );
	}

	/**
	 * Listens for a click event on the map and performs various actions based on the click position and element clicked.
	 *
	 * @param {mapboxgl.Map} currentMap - The current map object.
	 * @param                ref
	 */
	function listenForClick(
		currentMap: mapboxgl.Map,
		ref: RefObject< HTMLDivElement > | undefined
	) {
		if ( currentMap ) {
			currentMap.on( 'click', ( e: MapMouseEvent ) => {
				// store the last clicked position
				setLngLat( e.lngLat );
				const clickedPoint = [
					e.lngLat.lng,
					e.lngLat.lat,
				] as LngLatLike;

				const clickedFeatures = currentMap.queryRenderedFeatures(
					e.point
				);

				// Find features intersecting the bounding box.
				const clickedEl = (
					e.originalEvent?.target as HTMLElement
				 )?.closest( 'button' ) as MarkerHTMLElement | null;

				if ( listings?.length && clickedEl?.nodeName === 'BUTTON' ) {
					// get the marker data
					const markerData: MapBoxListing | undefined = getMarkerData(
						Number( clickedEl.dataset?.id || 0 ),
						listings
					);

					if ( clickedEl.dataset?.markerName === 'geocoder' ) {
						// get the info of the geocoder place?
						return addPopup(
							currentMap,
							{
								geometry: {
									coordinates: clickedPoint,
								},
							},
							<p>Find A location?</p>
						);
					} else if ( clickedEl.dataset?.markerName === 'temp' ) {
						// add the popup
						if ( isEditor ) {
							// prints the popup that allow the editor to add a new marker
							return addPopup(
								currentMap,
								{
									geometry: {
										coordinates:
											markerData?.geometry.coordinates ||
											clickedPoint,
									},
								},
								<Button
									onClick={ () =>
										addNewListing(
											getNextId( listings ),
											clickedPoint
										)
									}
								>
									Add a new Marker?
								</Button>
							);
						}

						// prints the popup that allow the user to find a location
						addPopup(
							currentMap,
							{
								geometry: {
									coordinates: clickedPoint,
								},
							},
							<>
								<p>Find A location?</p>
								<Button
									onClick={ () => {
										const sortedNearestStores =
											locateNearestStore(
												clickedPoint,
												filteredListings ?? listings
											);

										console.log( sortedNearestStores );
									} }
								>
									Get the nearest store?
								</Button>
								<Button
									onClick={ () => {
										setFilteredListings( listings );
									} }
								>
									Reset
								</Button>
							</>
						);
					} else if ( markerData ) {
						// popup the marker data on the currentMap
						return addPopup( currentMap, markerData );
					}
				}

				/**
				 * Otherwise the user doesn't click on a marker
				 */
				removeTempMarkers( ref );

				// Generate the metadata for the pin marker if nothing was clicked
				const newTempMarker = generateTempMarkerData(
					getNextId( listings ),
					clickedPoint
				);

				// add the new marker to the map
				addMarker(
					newTempMarker,
					currentMap,
					attributes.mapboxOptions.icons
				);

				// store the new marker in the markers array
				setListings( [ ...listings, newTempMarker ] );
			} );
		}
	}

	useEffect( () => {
		if ( mapDefaults?.accessToken && mapRef?.current ) {
			// Provide access token
			mapboxgl.accessToken = mapDefaults.accessToken;

			// Initialize map and store the map instance
			const mapObj = initMap( mapRef.current, attributes, mapDefaults );
			setMap( mapObj );

			const language = new MapboxLanguage();
			mapObj.addControl( language );

			// Add the stored listings to the markers list
			restoreInitialMarkers();
		} else {
			console.log( 'No access token' );
		}
	}, [ mapRef ] );

	useEffect( () => {
		if ( map ) {
			map.on( 'load', () => {
				// Add geocoder
				if ( attributes.sidebarEnabled && attributes.geocoderEnabled ) {
					setGeoCoder(
						initGeocoder(
							map,
							mapRef,
							geocoderRef,
							listings,
							filteredListings,
							setFilteredListings,
							mapDefaults
						)
					);
				}
			} );

			if ( listings?.length ) {
				// add markers to the map
				addMarkers( listings, map, attributes.mapboxOptions.icons );
			}

			// Listen for clicks on the map
			listenForClick( map, mapRef );
		}
	}, [ map ] );

	// Geocoder
	// this is needed because it can be enabled and disabled
	useEffect( () => {
		if ( map && attributes.geocoderEnabled ) {
			setGeoCoder(
				initGeocoder(
					map,
					mapRef,
					geocoderRef,
					listings,
					filteredListings,
					setFilteredListings,
					mapDefaults
				)
			);
		}
	}, [ attributes.geocoderEnabled ] );

	useEffect( () => {
		if ( ! map ) return;

		if ( filteredListings?.length ) {
			// if there are filtered listings hide the "unselected"
			listings?.forEach( ( listing ) => {
				if (
					filteredListings.find( ( item ) => item.id === listing.id )
				) {
					updateListing( listing );
				} else {
					removeMarker( listing.id );
				}
			} );
			if ( listings?.length === 2 ) {
				/**
				 * Adjust the map camera:
				 * Get a bbox that contains both the geocoder result and
				 * the closest store. Fit the bounds to that bbox.
				 */
				const bbox = getBbox(
					listings[ 0 ].geometry,
					listings[ 1 ].geometry
				);

				map?.cameraForBounds( bbox, {
					padding: 50,
				} );
			} else {
				fitInView( map, filteredListings, mapRef );
			}
			return;
		}
		// if no filtered listings show all
		listings?.forEach( ( listing ) => {
			updateListing( listing );
			fitInView( map, listings, mapRef );
		} );
	}, [ filteredListings ] );

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
			<div className={ 'map-sidebar' }>
				{ attributes.geocoderEnabled ? (
					<GeoCoder geocoderRef={ geocoderRef } />
				) : null }
				{ attributes.sidebarEnabled ? <Sidebar /> : null }
			</div>
			<div className={ 'map-container' }>
				<TopBar { ...attributes } />
				<Map mapRef={ mapRef as RefObject< HTMLDivElement > } />
			</div>
		</div>
	);
}
