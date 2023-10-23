import { Map } from './Map';
import { TopBar } from '../TopBar';
import { useCallback, useEffect } from '@wordpress/element';
import { useMapboxContext } from './MapboxContext';
import { getListing, getMarkerData } from './utils';
import { MapMouseEvent } from 'mapbox-gl';
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
import { addPopup } from '../Popup/Popup';
import { PinPointPopup } from '../Popup/PopupContent';
import { initGeoCoder, initMap } from './init';

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
		loaded,
		setLoaded,
		mapIcons,
	}: MountedMapsContextValue = useMapboxContext();

	/**
	 * Updates the markers on the map based on the given list of stores.
	 *
	 * @param {MapBoxListing[]}      stores       - The list of stores to update the markers for.
	 * @param {undefined | number[]} updateOnlyID - The list of store IDs to update, if undefined, all stores will be updated.
	 */
	const updateMarkers = useCallback(
		(
			stores: MapBoxListing[],
			updateOnlyIDs: undefined | number[] = undefined
		) => {
			stores?.forEach( ( store ) => {
				if ( updateOnlyIDs && ! updateOnlyIDs.includes( store.id ) ) {
					return;
				}
				// Remove the marker
				removeMarkerEl( store.id, mapRef?.current as HTMLDivElement );
				// Add the marker to the array
				mapMarker( store, markersRef, mapIcons as MarkerIcon[] );
				// Add the marker to the DOM
				createMarkerEl( markersRef?.current[ store.id ], store, map );
			} );
			return stores;
		},
		[ map, mapRef, markersRef, mapIcons ]
	);

	const listenMapClick = useCallback(
		// useCallback ensures the functions stays identical
		( event: mapboxgl.MapMouseEvent & mapboxgl.EventData ) => {
			// store the last clicked position
			setLngLat( event.lngLat );
			const clickedPoint = [
				event.lngLat.lng,
				event.lngLat.lat,
			] as CoordinatesDef;

			//const clickedFeatures = _map.queryRenderedFeatures( event.point );

			// Find features intersecting the bounding box.
			const clickedEl = (
				event.originalEvent?.target as HTMLElement
			 )?.closest( 'button' ) as MarkerHTMLElement | null;

			/**
			 * The map was clicked
			 */
			if ( clickedEl?.nodeName !== 'BUTTON' ) {
				// remove the distance data from each listing
				clearListingsDistances( listings );

				// clear the temp marker from the list
				removeTempMarkers( mapRef );

				/**
				 * Add a pin marker case
				 */
				const newTempMarker = generateTempMarkerData(
					getNextId( listings ),
					clickedPoint
				);

				// store the new marker in the markers array
				const newListings = [
					...removeTempListings( listings ),
					newTempMarker,
				];

				setListings( newListings );
				updateMarkers( newListings, [ newTempMarker.id ] );
			} else {
				/**
				 * A marker was clicked, get the marker data
				 */
				const markerData: MapBoxListing | undefined = getMarkerData(
					Number( clickedEl.dataset?.id ) || 0,
					listings
				);

				/**
				 * Editor case
				 */
				if ( isEditor ) {
					console.log(
						'todo: handle editor click',
						clickedEl,
						markerData
					);
				}

				const markerCoordinates = markerData?.geometry?.coordinates;

				/**
				 * GeoCoder Marker case
				 */
				if ( clickedEl?.dataset?.markerName === 'geocoder-marker' ) {
					return;
				}

				/**
				 * Click Marker case
				 */
				if ( clickedEl.dataset?.markerName === 'click-marker' ) {
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
				}

				/**
				 * default Marker case
				 */
				if ( markerData ) {
					// popup the marker data on the currentMap
					addPopup( map, markerData );
				}
			}
		},
		[ map, setMap, listings, setFilteredListings ]
	);

	useEffect( () => {
		if ( loaded ) return;

		if ( mapDefaults?.accessToken && mapRef?.current ) {
			// Initialize map and store the map instance
			const _map = initMap( mapRef.current, attributes, mapDefaults );

			setMap( _map );

			// Add the language control to the map
			const language = new MapboxLanguage();
			_map.addControl( language );

			// Add the geocoder to the map
			if ( attributes.geocoderEnabled ) {
				setGeoCoder(
					initGeoCoder(
						_map,
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
		if ( loaded ) {
			map.off( 'click', listenMapClick );
			updateMarkers( getListing( listings, filteredListings ) );
			map.on( 'click', listenMapClick );
		}
	}, [ listings, filteredListings ] );

	useEffect( () => {
		if ( loaded ) {
			updateMarkers( getListing( listings, filteredListings ) );
			map.once( 'click', listenMapClick );
		}
	}, [ loaded ] );

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
