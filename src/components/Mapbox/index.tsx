import { Map } from './Map';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useEffect, useContext } from '@wordpress/element';
import { MapboxContext } from './MapboxContext';
import { getMarkerData, initMap } from './utils';
import mapboxgl, { LngLatLike, MapMouseEvent, Point } from 'mapbox-gl';
import { initGeocoder } from './Geocoder';
import {
	MapAttributes,
	MapboxBlockDefaults,
	MapBoxListing,
	MarkerHTMLElement,
	MarkerItem,
	MountedMapsContextValue,
} from '../../types';
import { addMarker, addMarkers } from './Markers';
import { addPopup, removePopup } from './Popup';
import { getNextId } from '../../utils/dataset';
import { RefObject } from 'react';
import { Button } from '@wordpress/components';
import { defaultMarkerProps, defaultMarkerStyle, tempMarker } from './defaults';

export function removeTempMarkers(
	maboxRef: React.RefObject< HTMLDivElement > | undefined
) {
	if ( maboxRef?.current ) {
		maboxRef?.current
			.querySelectorAll( '.marker-temp' )
			.forEach( ( marker ) => marker.remove() );
	}
}

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
		setMap,
		setGeoCoder,
		mapRef,
		geocoderRef,
		setLngLat,
		setMarkers,
		markers,
	}: MountedMapsContextValue = useContext( MapboxContext );

	/**
	 * The function restores the initial markers on a map using a setMarkers function and a listings
	 * attribute.
	 */
	function restoreInitialMarkers() {
		setMarkers( attributes.mapboxOptions.listings );
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
		if ( map ) {
			const newItem = {
				id,
				name: 'New Listing',
				type: 'Feature',
				properties: {
					...defaultMarkerProps,
					iconSize: 48,
					iconColor: '#0FF',
					icon: defaultMarkerStyle,
				},
				geometry: {
					type: 'Point',
					coordinates: clickedPoint,
				},
			};
			// remove previous marker and popup
			removeMarker( id );
			removePopup( mapRef );
			// then add the new marker and store the new marker in the markers array
			addMarker( newItem, map );
			setMarkers( [ ...markers, newItem ] );
		}
	}

	function listenForClick( currentMap: mapboxgl.Map ) {
		if ( currentMap ) {
			currentMap.on( 'click', ( e: MapMouseEvent ) => {
				// store the last clicked position
				setLngLat( e.lngLat );
				const clickedPoint = [
					e.lngLat.lng,
					e.lngLat.lat,
				] as LngLatLike;

				console.log( e );

				const clickedFeatures = currentMap.queryRenderedFeatures(
					e.point
				);

				// Find features intersecting the bounding box.
				const clickedEl = (
					e.originalEvent?.target as HTMLElement
				 )?.closest( 'button' ) as MarkerHTMLElement | null;

				if ( markers?.length && clickedEl?.nodeName === 'BUTTON' ) {
					// get the marker data
					const markerData: MapBoxListing | undefined = getMarkerData(
						Number( clickedEl.dataset?.id || 0 ),
						markers
					);

					if ( clickedEl.dataset?.markerName === 'temp' ) {
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
											getNextId( markers ),
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
							<p>Find A location?</p>
						);
					} else if ( markerData ) {
						// popup the marker data on the currentMap
						return addPopup( currentMap, markerData );
					}
				}

				/**
				 * Otherwise the user doesn't click on a marker
				 */
				removeTempMarkers( mapRef );

				const newTempMarker = tempMarker(
					getNextId( markers ),
					clickedPoint
				);

				addMarker( newTempMarker, currentMap );

				setMarkers( [ ...markers, newTempMarker ] );
			} );
		}
	}

	useEffect( () => {
		if ( mapDefaults?.accessToken && mapRef?.current ) {
			// Provide access token
			mapboxgl.accessToken = mapDefaults.accessToken;

			// Initialize map and store the map instance
			setMap( initMap( mapRef.current, attributes, mapDefaults ) );

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
							geocoderRef,
							map,
							attributes,
							mapDefaults,
							markers
						)
					);
				}
			} );

			if ( markers?.length ) {
				// add markers to the map
				addMarkers( markers, map );
			}

			// Listen for clicks on the map
			listenForClick( map );
		}
	}, [ map ] );

	// Geocoder
	// this is needed because it can be enabled and disabled
	useEffect( () => {
		if ( map && attributes.geocoderEnabled ) {
			setGeoCoder(
				initGeocoder(
					geocoderRef,
					map,
					attributes,
					mapDefaults,
					markers
				)
			);
		}
	}, [ attributes.geocoderEnabled ] );

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
				<Sidebar attributes={ attributes } />
			) : null }
			<div className={ 'map-container' }>
				<TopBar { ...attributes } />
				<Map mapRef={ mapRef as RefObject< HTMLDivElement > | null } />
			</div>
		</div>
	);
}
