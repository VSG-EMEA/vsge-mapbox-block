import { Map } from './Map';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useEffect, useContext } from '@wordpress/element';
import { MapboxContext } from './MapboxContext';
import { getMarkerData, initMap, tempMarker } from './utils';
import mapboxgl, { Coordinate, LngLat, MapMouseEvent, Point } from 'mapbox-gl';
import { initGeocoder } from './Geocoder';
import {
	MapAttributes,
	MapboxBlockDefaults,
	MarkerHTMLElement,
	MountedMapsContextValue,
} from '../../types';
import { addMarker, addMarkers, removeMarkers } from './Markers';
import { addPopup } from './Popup';
import { getNextId } from '../../utils/dataset';
import { RefObject } from 'react';
import { Button } from '@wordpress/components';

export function removeMarker(
	id: number,
	maboxRef: React.RefObject< HTMLDivElement >
) {
	if ( maboxRef?.current ) {
		maboxRef?.current.querySelector( '#marker-' + id )?.remove();
	}
}

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

	function restoreInitialMarkers() {
		setMarkers( attributes.mapboxOptions.listings );
	}

	function listenForClick( currentMap: mapboxgl.Map ) {
		if ( currentMap ) {
			currentMap.on( 'click', ( e: MapMouseEvent ) => {
				// store the last clicked position
				setLngLat( e.lngLat );
				const clickedPoint = [ e.lngLat.lng, e.lngLat.lat ];

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
					const markerData = getMarkerData(
						parseInt( clickedEl.dataset?.id, 10 ),
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
										coordinates: clickedPoint,
									},
								},
								<p>Add a new Marker?</p>
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
							mapDefaults
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

	useEffect( () => {
		if ( map && attributes.geocoderEnabled ) {
			setGeoCoder(
				initGeocoder( geocoderRef, map, attributes, mapDefaults )
			);
		}
	}, [ attributes.geocoderEnabled ] );

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
