import { Map } from './Map';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useEffect, useContext } from '@wordpress/element';
import { MapboxContext } from './MapboxContext';
import { getMarkerData, initMap, tempMarker } from './utils';
import mapboxgl, { MapMouseEvent, Point } from 'mapbox-gl';
import { initGeocoder } from './Geocoder';
import {
	MapAttributes,
	MapboxBlockDefaults,
	MarkerHTMLElement,
	MountedMapsContextValue,
} from '../../types';
import { addMarker, addMarkers } from './Markers';
import { addPopup } from './Popup';

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

	function removeTempMarkers(
		mapRef: React.RefObject< HTMLDivElement > | undefined
	) {
		if ( mapRef?.current ) {
			mapRef?.current
				.querySelectorAll( '.marker-temp' )
				.forEach( ( marker ) => marker.remove() );
		}
	}

	function listenForClick( map: mapboxgl.Map ) {
		if ( map ) {
			map.on( 'click', ( e: MapMouseEvent ) => {
				// store the last clicked position
				setLngLat( e.lngLat );

				// Find features intersecting the bounding box.
				// const selectedFeatures = map.queryRenderedFeatures( bbox );
				const clickedEl: MarkerHTMLElement = e.originalEvent
					?.target as HTMLElement;

				if (
					! markers?.length &&
					clickedEl?.parentElement?.nodeName === 'BUTTON'
				) {
					const MarkerElement =
						clickedEl.parentElement as MarkerHTMLElement;
					// get the marker data
					const markerData = getMarkerData(
						parseInt( MarkerElement.dataset?.id, 10 ),
						markers
					);

					if ( MarkerElement.dataset?.markerName === 'temp' ) {
						// add the popup
						if ( isEditor ) {
							// prints the popup that allow the editor to add a new marker
							return addPopup(
								map,
								{
									id: null,
									geometry: {
										type: 'Point',
										coordinates:
											markerData.geometry.coordinates,
									},
								},
								<p>Add a new Marker?</p>
							);
						}
						// prints the popup that allow the user to find a location
						addPopup(
							map,
							{
								id: null,
								geometry: {
									type: 'Point',
									coordinates:
										markerData.geometry.coordinates,
								},
							},
							<p>Find A location?</p>
						);
					} else {
						// prints the standard marker
						if ( markerData ) {
							return addPopup( map, markerData );
						}
					}
				}

				removeTempMarkers( mapRef );

				const newTempMarker = tempMarker( markers?.length, [
					e.lngLat.lng,
					e.lngLat.lat,
				] );

				addMarker( newTempMarker, map );

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
		}

		if ( map && markers?.length ) {
			// add markers to the map
			addMarkers( markers, map );

			// highlight the first listing
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
				<Map mapRef={ mapRef } />
			</div>
		</div>
	);
}
