import { Map } from './Map';
import { TopBar } from '../TopBar';
import { useEffect } from '@wordpress/element';
import { useMapboxContext } from './MapboxContext';
import { getListing, getMarkerData, initGeoCoder, initMap } from './utils';
import { MapMouseEvent } from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import { GeoCoder } from '../Geocoder/Geocoder';
import {
	CoordinatesDef,
	MapAttributes,
	MapboxBlockDefaults,
	MapBoxListing,
	MarkerHTMLElement,
	MountedMapsContextValue,
} from '../../types';
import {
	createMarkerEl,
	removeTempListings,
	removeTempMarkers,
} from '../Marker/utils';
import { addPopup } from '../Popup/Popup';
import { getNextId } from '../../utils/dataset';
import { generateTempMarkerData } from './defaults';
import { clearListingsDistances } from '../../utils/spatialCalcs';
import { PinPointPopup } from '../Popup/PopupContent';
import { mapMarker } from '../Marker/MapMarker';
import { Sidebar } from '../Sidebar';

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
		loaded,
		setLoaded,
		setListings,
		filteredListings,
		setFilteredListings,
	}: MountedMapsContextValue = useMapboxContext();

	function updateMarkers( stores: MapBoxListing[] ) {
		stores?.forEach( ( store ) => {
			mapMarker(
				store,
				map,
				mapRef,
				markersRef,
				attributes.mapboxOptions.icons
			);
			createMarkerEl( markersRef.current[ store.id ], store, map );
		} );
	}

	function handleMapClick(
		event: MapMouseEvent,
		stores: MapBoxListing[],
		filteredStores: MapBoxListing[]
	) {
		// store the last clicked position
		setLngLat( event.lngLat );
		const clickedPoint = [
			event.lngLat.lng,
			event.lngLat.lat,
		] as CoordinatesDef;

		//const clickedFeatures = map.queryRenderedFeatures( event.point );

		// Find features intersecting the bounding box.
		const clickedEl = (
			event.originalEvent?.target as HTMLElement
		 )?.closest( 'button' ) as MarkerHTMLElement | null;

		if ( stores?.length && clickedEl?.nodeName === 'BUTTON' ) {
			// get the marker data
			const markerData: MapBoxListing | undefined = getMarkerData(
				Number( clickedEl.dataset?.id ) || 0,
				stores
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
					map,
					markerData,
					<PinPointPopup
						location={ markerCoordinates ?? clickedPoint }
						listings={ stores }
						setFilteredListings={ setFilteredListings }
						mapRef={ mapRef }
						map={ map }
						filteredListings={ filteredStores }
					/>
				);
				return;
			}

			if ( markerData ) {
				// popup the marker data on the currentMap
				addPopup( map, markerData );
				return;
			}
		}

		clearListingsDistances( filteredStores );

		// Generate the metadata for the pin marker if nothing was clicked
		const newTempMarker = generateTempMarkerData(
			getNextId( stores ),
			clickedPoint
		);

		// clear the temp marker from the list
		removeTempMarkers( mapRef );

		// add the temp marker to the list
		const newListings = [ ...removeTempListings( stores ), newTempMarker ];

		// store the new marker in the markers array
		setListings( newListings );
	}

	useEffect( () => {
		updateMarkers( getListing( listings, filteredListings ) );
	}, [ listings, filteredListings ] );

	useEffect( () => {
		if ( loaded ) return;

		if ( mapDefaults?.accessToken && mapRef?.current ) {
			// Initialize map and store the map instance
			const _map = initMap( mapRef.current, attributes, mapDefaults );

			// Add the language control to the map
			const language = new MapboxLanguage();
			_map.addControl( language );

			setMap( _map );

			const newListings = attributes.mapboxOptions.listings;

			// Adds the default listings  to the map
			setListings( newListings );

			if ( attributes.geocoderEnabled ) {
				setGeoCoder(
					initGeoCoder(
						_map,
						mapRef,
						markersRef,
						geocoderRef,
						newListings,
						filteredListings,
						setFilteredListings,
						mapDefaults
					)
				);
			}

			// Set the state of the map
			setLoaded( true );

			// Listen for clicks on the map
			_map.on( 'click', ( event: MapMouseEvent ) => {
				handleMapClick(
					event as MapMouseEvent,
					newListings,
					filteredListings
				);
			} );
		}
	}, [] );

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
