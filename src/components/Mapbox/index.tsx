import { Map } from './Map';
import { TopBar } from '../TopBar';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { useMapboxContext } from './MapboxContext';
import { getListing, getMarkerData } from './utils';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import { GeoCoder } from '../Geocoder/Geocoder';
import {
	CoordinatesDef,
	MapAttributes,
	MapboxBlockDefaults,
	MapBoxListing,
	MarkerHTMLElement,
	MarkerIcon,
	MountedMapsContextValue,
} from '../../types';
import {
	createMarkerEl,
	removeMarkerEl,
	removeTempListings,
	removeTempMarkers,
} from '../Marker/utils';
import { getNextId } from '../../utils/dataset';
import { generateTempMarkerData } from './defaults';
import { clearListingsDistances } from '../../utils/spatialCalcs';
import { mapMarker } from '../Marker/MapMarker';
import { Sidebar } from '../Sidebar';
import { addPopup, removePopups } from '../Popup/Popup';
import { PinPointPopup } from '../Popup/PopupContent';
import { initGeoCoder, initMap } from './init';
import { equalsCheck } from '../../utils';

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
		setGeoCoder,
		geocoderRef,
		markersRef,
		lngLat,
		setLngLat,
		listings,
		setListings,
		filteredListings,
		setFilteredListings,
		loaded,
		setLoaded,
		mapIcons,
	}: MountedMapsContextValue = useMapboxContext();
	const [ lastChangedElements, setLastChangedElements ] = useState<
		null | MapBoxListing[]
	>( null );

	/**
	 * Updates the markers on the map based on the given list of stores.
	 *
	 * @param {MapBoxListing[]}      stores       - The list of stores to update the markers for.
	 * @param {undefined | number[]} updateOnlyID - The list of store IDs to update, if undefined, all stores will be updated.
	 */
	const updateMarkers = useCallback(
		( stores: MapBoxListing[], currentStores?: MapBoxListing[] | null ) => {
			stores?.forEach( ( store ) => {
				// check if the store already exists and has the same coordinates
				if (
					currentStores &&
					currentStores.find(
						( s ) =>
							s.id === store.id &&
							equalsCheck(
								s.geometry.coordinates,
								store.geometry.coordinates
							)
					)
				) {
					// Update the marker
				} else {
					// otherwise create a new marker
					removeMarkerEl(
						store.id,
						mapRef?.current as HTMLDivElement
					);

					// Create the marker element
					mapMarker( store, markersRef, mapIcons as MarkerIcon[] );

					if ( markersRef.current[ store.id ] ) {
						// Add the marker to the DOM
						createMarkerEl(
							markersRef?.current[ store.id ],
							store,
							map
						);
					}
				}
			} );

			return stores;
		},
		[ map, mapRef, markersRef, mapIcons ]
	);

	const listenMapClick = useCallback(
		// useCallback ensures the functions stays identical
		( event: mapboxgl.MapMouseEvent & mapboxgl.EventData ) => {
			// store the last clicked position in oder to add the event listener again
			setLngLat( event.lngLat );
			const clickedPoint = [
				event.lngLat.lng,
				event.lngLat.lat,
			] as CoordinatesDef;

			//const clickedFeatures = _map.queryRenderedFeatures( event.point );

			// Find features intersecting the bounding box.
			const clickedEl = event.originalEvent?.target as HTMLElement;

			/**
			 * The map was clicked
			 */
			if ( clickedEl.nodeName === 'CANVAS' ) {
				// remove the distance data from each listing
				clearListingsDistances( listings );
				removePopups( mapRef );

				// clear the temp marker from the list
				// let newListings = removeTempMarkers( listings, mapRef );

				/**
				 * Add a pin marker case
				 */
				const newTempMarker = generateTempMarkerData(
					getNextId( listings ),
					clickedPoint
				);

				let newListings = removeTempMarkers( listings, mapRef );

				// store the new marker in the markers array
				newListings = [
					...removeTempListings( newListings ),
					newTempMarker,
				];

				setLastChangedElements( [ newTempMarker ] );
				setListings( newListings );
				return;
			}

			const markerEl = clickedEl?.closest(
				'.mapboxgl-marker'
			) as MarkerHTMLElement | null;

			/**
			 * A marker was clicked, get the marker data
			 */
			const markerData: MapBoxListing | undefined = getMarkerData(
				Number( markerEl.dataset?.id ) || 0,
				listings
			);

			/**
			 * Editor case
			 */
			if ( isEditor ) {
				return console.log(
					'todo: handle editor click',
					markerEl,
					markerData
				);
			}

			const markerCoordinates = markerData?.geometry?.coordinates;

			/**
			 * GeoCoder Marker case
			 */
			if ( markerEl?.dataset?.markerName === 'geocoder-marker' ) {
				return;
			}

			/**
			 * Click Marker case
			 */
			if ( markerEl?.dataset?.markerName === 'click-marker' ) {
				// prints the popup that allow the user to find a location
				addPopup(
					map,
					markerData,
					<PinPointPopup
						location={ markerCoordinates ?? clickedPoint }
						listings={ listings }
						setFilteredListings={ setFilteredListings }
						mapRef={ mapRef }
						map={ map }
					/>
				);
				return;
			}

			/**
			 * Default Marker case
			 */
			if ( markerData?.type === 'Feature' ) {
				// popup the marker data on the currentMap
				addPopup( map, markerData );
			}
		},
		[ map, mapRef, listings, setFilteredListings ]
	);

	useEffect( () => {
		// Initialize Mapbox only once
		if ( loaded || map.current ) return;

		if ( mapDefaults?.accessToken && mapRef?.current ) {
			// Initialize map and store the map instance
			map.current = initMap( mapRef.current, attributes, mapDefaults );

			// Add the language control to the map
			const language = new MapboxLanguage();
			map.current.addControl( language );

			// Add the geocoder to the map
			if ( attributes.geocoderEnabled ) {
				setGeoCoder(
					initGeoCoder(
						map,
						mapRef,
						markersRef,
						geocoderRef,
						listings,
						filteredListings,
						setFilteredListings,
						mapDefaults
					)
				);
			}

			// Set the ready state of the map
			setLoaded( true );
		}
	}, [] );

	useEffect( () => {
		if ( loaded && map.current ) {
			if ( lastChangedElements ) {
				updateMarkers( lastChangedElements );
				setLastChangedElements( null );
			} else if ( filteredListings.length > 0 ) {
				// removes all markers from the map if they aren't listed in the filtered list
				listings?.forEach( ( listing ) => {
					// check if the listing is in the filtered list otherwise remove it
					if (
						! filteredListings.find( ( filteredListing ) => {
							return listing.id === filteredListing.id;
						} )
					) {
						removeMarkerEl(
							listing.id,
							mapRef?.current as HTMLDivElement
						);
					}
				} );
			} else {
				updateMarkers( getListing( listings, filteredListings ) );
			}
		}
	}, [ loaded, listings, filteredListings ] );

	useEffect( () => {
		if ( loaded && map.current ) {
			map.current.once( 'click', listenMapClick );
		}
	}, [ lngLat, loaded ] );

	/**
	 * if the access key isn't provided
	 */
	if ( typeof mapDefaults?.accessToken !== 'string' ) {
		return (
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
			{ attributes.sidebarEnabled && (
				<div className={ 'map-sidebar' }>
					{ attributes.geocoderEnabled && <GeoCoder /> }
					<Sidebar />
				</div>
			) }
			<div className={ 'map-container' }>
				<TopBar { ...attributes } />
				<Map />
			</div>
		</div>
	);
}
