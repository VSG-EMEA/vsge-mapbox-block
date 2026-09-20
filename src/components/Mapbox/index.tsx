import { Map as MapCanvas } from './Map';
import { TopBar } from '../TopBar';
import {
	createInterpolateElement,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { useMapboxContext } from './MapboxContext';
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
	getCanonicalDealerListings,
	getNextId,
	normalizeMapboxLanguage,
} from '../../utils/dataset';
import { generateTempMarkerData } from '../Marker/defaults';
import { clearListingsDistances } from '../../utils/spatialCalcs';
import { Sidebar } from '../Sidebar';
import {
	createManagedPopup,
	createPopupManager,
	type PopupManager,
	type PopupOptions,
} from '../Popup';
import {
	createTempMarker,
	type TempMarkerResource,
} from '../Marker/tempMarker';
import {
	DEALER_CUSTOM_LAYER_ID,
	DEALER_POINTS_LAYER_ID,
	ensureDealerResources,
	ensureDealerLayers,
	ensureDealerSource,
} from './dealerResources';
import {
	fitEuropeViewport,
	getMatchingCountryDealers,
	getPreferredCountryCode,
} from '../../utils/countryPreference';
import { fitInView, flyToStore } from '../../utils/view';
import { initMap } from './init';
import { initGeoCoder } from '../Geocoder/init';
import { PinPointPopup } from '../Popup/PinPointPopup';
import type mapboxgl from 'mapbox-gl';

type MapboxGL = typeof mapboxgl;

/**
 * Renders a MapBox component.
 *
 * @param {Object}              props             - The props object containing attributes, mapDefaults, and isEditor.
 * @param {MapAttributes}       props.attributes  - The attributes of the MapBox component.
 * @param {MapboxBlockDefaults} props.mapDefaults - The default settings for the MapBox component.
 * @param {boolean}             [props.isEditor]  - A boolean indicating whether the component is being used in an editor.
 * @param                       props.mapboxgl
 * @return {JSX.Element} The rendered MapBox component.
 */
export function MapBox( {
	mapboxgl: mapbox,
	attributes,
	mapDefaults,
}: {
	mapboxgl: MapboxGL;
	attributes: MapAttributes;
	mapDefaults: MapboxBlockDefaults;
	isEditor?: boolean;
} ): JSX.Element {
	const {
		map,
		mapRef,
		geocoderRef,
		markersRef,
		setLngLat,
		listings,
		setListings,
		filteredListings,
		setFilteredListings,
		selectedDealerId,
		setSelectedDealerId,
		loaded,
		setLoaded,
		mapIcons,
		setDistanceReference,
	}: MountedMapsContextValue = useMapboxContext();

	const geocoderInstanceRef = useRef< MapboxGeocoder | null >( null );
	const geocoderCleanupRef = useRef< ( () => void ) | null >( null );
	const tempMarkerRef = useRef< TempMarkerResource | null >( null );
	const popupManagerRef = useRef< PopupManager | null >( null );
	const hasAppliedInitialViewportRef = useRef( false );

	if ( ! popupManagerRef.current ) {
		popupManagerRef.current = createPopupManager();
	}

	const destroyTempMarker = useCallback( () => {
		if ( tempMarkerRef.current ) {
			tempMarkerRef.current.destroy();
			tempMarkerRef.current = null;
		}
	}, [] );

	const clearPopups = useCallback( () => {
		popupManagerRef.current?.clear();
	}, [] );

	const initContextRef = useRef( {
		mapbox,
		attributes,
		mapDefaults,
		listings,
		setFilteredListings,
		clearPopups,
		map,
		mapRef,
		markersRef,
		geocoderRef,
		setLoaded,
		setDistanceReference,
	} );

	initContextRef.current = {
		mapbox,
		attributes,
		mapDefaults,
		listings,
		setFilteredListings,
		clearPopups,
		map,
		mapRef,
		markersRef,
		geocoderRef,
		setLoaded,
		setDistanceReference,
	};

	const openPopup = useCallback(
		(
			marker: MapBoxListing,
			children?: JSX.Element,
			options?: PopupOptions
		) => {
			if ( ! map.current || ! popupManagerRef.current ) {
				return null;
			}
			return createManagedPopup(
				mapbox,
				map.current,
				popupManagerRef.current,
				marker,
				children,
				options
			);
		},
		[ mapbox, map ]
	);

	const clearGeocoder = useCallback( () => {
		destroyTempMarker();
		if ( geocoderInstanceRef.current ) {
			geocoderInstanceRef.current.clear();
		}
	}, [ destroyTempMarker ] );

	const listenMapClick = useCallback(
		( event: mapboxgl.MapMouseEvent ) => {
			if ( ! map.current || ! mapRef?.current ) {
				return;
			}

			// 1. Check if clicked on a canonical dealer feature in either symbol layer
			const dealerFeatures = map.current.queryRenderedFeatures(
				event.point,
				{
					layers: [ DEALER_POINTS_LAYER_ID, DEALER_CUSTOM_LAYER_ID ],
				}
			);

			if ( dealerFeatures && dealerFeatures.length > 0 ) {
				const feature = dealerFeatures[ 0 ];
				const dealerId = Number( feature.id ?? feature.properties?.id );
				const targetListing = listings.find(
					( l ) => l.id === dealerId
				);
				if ( targetListing ) {
					setSelectedDealerId( dealerId );
					openPopup( targetListing );
					flyToStore( map.current, targetListing );
				}
				// Early return: NEVER fall through to empty-map click
				return;
			}

			// 2. Check if clicked on a temporary marker or geocoder marker DOM element
			const clickedEl = event.originalEvent?.target as HTMLElement;
			const markerEl = clickedEl?.closest(
				'.mapboxgl-marker'
			) as MarkerHTMLElement | null;

			if ( markerEl?.dataset?.markerName === 'geocoder-marker' ) {
				return;
			}

			if (
				markerEl?.dataset?.markerName === 'click-marker' &&
				tempMarkerRef.current
			) {
				const clickedPoint = [
					event.lngLat.lng,
					event.lngLat.lat,
				] as CoordinatesDef;
				const tempListing = generateTempMarkerData(
					tempMarkerRef.current.id,
					clickedPoint
				);
				openPopup(
					tempListing,
					<PinPointPopup
						location={ clickedPoint }
						listings={ listings }
						setListings={ setListings }
						setFilteredListings={ setFilteredListings }
						mapRef={ mapRef.current }
						map={ map.current }
						mapDefaults={ mapDefaults }
						clearPopups={ clearPopups }
						popupManager={ popupManagerRef.current }
						mapbox={ mapbox }
						setDistanceReference={ setDistanceReference }
					/>
				);
				return;
			}

			/**
			 * 3. Empty map click on canvas: clear selection/popups and create temporary pin
			 */
			if ( clickedEl.nodeName === 'CANVAS' ) {
				setLngLat( event.lngLat );
				const clickedPoint = [
					event.lngLat.lng,
					event.lngLat.lat,
				] as CoordinatesDef;

				clearListingsDistances( listings );
				clearPopups();
				setSelectedDealerId( null );

				// Destroy previous temporary marker symmetrically
				destroyTempMarker();

				const newTempMarker = generateTempMarkerData(
					getNextId( listings ),
					clickedPoint
				);

				tempMarkerRef.current = createTempMarker(
					mapbox,
					map.current,
					newTempMarker
				);

				openPopup(
					newTempMarker,
					<PinPointPopup
						location={ clickedPoint }
						listings={ listings }
						setListings={ setListings }
						setFilteredListings={ setFilteredListings }
						mapRef={ mapRef.current }
						map={ map.current }
						mapDefaults={ mapDefaults }
						clearPopups={ clearPopups }
						popupManager={ popupManagerRef.current }
						mapbox={ mapbox }
						setDistanceReference={ setDistanceReference }
					/>
				);
			}
		},
		[
			map,
			mapRef,
			listings,
			setFilteredListings,
			clearPopups,
			openPopup,
			mapDefaults,
			mapbox,
			setListings,
			setLngLat,
			setSelectedDealerId,
			destroyTempMarker,
			setDistanceReference,
		]
	);

	const onMouseEnter = useCallback( () => {
		if ( map.current ) {
			map.current.getCanvas().style.cursor = 'pointer';
		}
	}, [ map ] );

	const onMouseLeave = useCallback( () => {
		if ( map.current ) {
			map.current.getCanvas().style.cursor = '';
		}
	}, [ map ] );

	const setupResources = useCallback( async () => {
		if ( ! map.current ) {
			return;
		}
		const activeListings =
			filteredListings !== null ? filteredListings : listings;
		await ensureDealerResources(
			map.current,
			activeListings,
			mapIcons as MarkerIcon[],
			selectedDealerId
		);
	}, [ map, filteredListings, listings, mapIcons, selectedDealerId ] );

	const listenersRef = useRef( {
		listenMapClick,
		onMouseEnter,
		onMouseLeave,
		setupResources,
	} );

	listenersRef.current = {
		listenMapClick,
		onMouseEnter,
		onMouseLeave,
		setupResources,
	};

	const handleMapClick = useCallback( ( event: mapboxgl.MapMouseEvent ) => {
		listenersRef.current.listenMapClick( event );
	}, [] );

	const handleMouseEnter = useCallback( () => {
		listenersRef.current.onMouseEnter();
	}, [] );

	const handleMouseLeave = useCallback( () => {
		listenersRef.current.onMouseLeave();
	}, [] );

	const handleStyleLoad = useCallback( () => {
		void listenersRef.current.setupResources();
	}, [] );

	const accessToken = mapDefaults?.accessToken;
	const mapStyle = attributes.mapStyle;

	useLayoutEffect( () => {
		const {
			mapbox: currentMapbox,
			attributes: currentAttributes,
			mapDefaults: currentMapDefaults,
			listings: currentListings,
			setFilteredListings: currentSetFilteredListings,
			clearPopups: currentClearPopups,
			map: currentMap,
			mapRef: currentMapRef,
			markersRef: currentMarkersRef,
			geocoderRef: currentGeocoderRef,
			setLoaded: currentSetLoaded,
			setDistanceReference: currentSetDistanceReference,
		} = initContextRef.current;

		if ( currentMap.current ) {
			return;
		}

		const container = currentMapRef?.current;

		if ( currentMapDefaults?.accessToken && container ) {
			// Initialize map and store the map instance
			currentMap.current = initMap(
				currentMapbox,
				container,
				currentAttributes,
				currentMapDefaults
			);
			( container as any )._mapboxMap = currentMap.current;

			// Add the language control to the map
			const language = new MapboxLanguage( {
				defaultLanguage: normalizeMapboxLanguage(
					currentMapDefaults.language
				),
			} );
			currentMap.current.addControl( language );

			// Add the geocoder to the map
			if (
				currentAttributes.geocoderEnabled &&
				currentMarkersRef?.current &&
				currentGeocoderRef?.current
			) {
				const initResult = initGeoCoder(
					currentMapbox,
					currentMap.current,
					container,
					currentMarkersRef.current,
					currentGeocoderRef.current,
					currentListings,
					currentSetFilteredListings,
					currentMapDefaults,
					currentClearPopups,
					popupManagerRef.current,
					null,
					currentSetDistanceReference
				);
				if ( initResult ) {
					geocoderInstanceRef.current = initResult.geocoder;
					geocoderCleanupRef.current = initResult.destroy;
				}
			}

			// Set the ready state of the map
			currentMap.current.on( 'load', async () => {
				currentSetLoaded( true );
				currentMap.current?.resize();
				await listenersRef.current.setupResources();

				// One-time initial viewport contract: matching country dealers once, otherwise Europe fallback
				if (
					! hasAppliedInitialViewportRef.current &&
					currentMap.current
				) {
					hasAppliedInitialViewportRef.current = true;
					const preferredCountry = getPreferredCountryCode();
					let fitted = false;
					if ( preferredCountry ) {
						const countryDealers = getMatchingCountryDealers(
							currentListings,
							preferredCountry
						);
						if ( countryDealers.length > 0 ) {
							fitInView(
								currentMap.current,
								countryDealers,
								container
							);
							fitted = true;
						}
					}
					if ( ! fitted ) {
						fitEuropeViewport( currentMap.current );
					}
				}

				currentMap.current?.on( 'click', handleMapClick );
				currentMap.current?.on(
					'mouseenter',
					DEALER_POINTS_LAYER_ID,
					handleMouseEnter
				);
				currentMap.current?.on(
					'mouseleave',
					DEALER_POINTS_LAYER_ID,
					handleMouseLeave
				);
				currentMap.current?.on(
					'mouseenter',
					DEALER_CUSTOM_LAYER_ID,
					handleMouseEnter
				);
				currentMap.current?.on(
					'mouseleave',
					DEALER_CUSTOM_LAYER_ID,
					handleMouseLeave
				);
			} );

			currentMap.current.on( 'style.load', handleStyleLoad );
		}

		return () => {
			destroyTempMarker();
			if ( geocoderCleanupRef.current ) {
				geocoderCleanupRef.current();
				geocoderCleanupRef.current = null;
				geocoderInstanceRef.current = null;
			}
			if ( popupManagerRef.current ) {
				popupManagerRef.current.destroy();
			}
			if ( currentMap.current ) {
				currentMap.current.off( 'click', handleMapClick );
				currentMap.current.off(
					'mouseenter',
					DEALER_POINTS_LAYER_ID,
					handleMouseEnter
				);
				currentMap.current.off(
					'mouseleave',
					DEALER_POINTS_LAYER_ID,
					handleMouseLeave
				);
				currentMap.current.off(
					'mouseenter',
					DEALER_CUSTOM_LAYER_ID,
					handleMouseEnter
				);
				currentMap.current.off(
					'mouseleave',
					DEALER_CUSTOM_LAYER_ID,
					handleMouseLeave
				);
				currentMap.current.off( 'style.load', handleStyleLoad );
				currentMap.current.remove();
				currentMap.current = null;
			}
			if ( container ) {
				delete ( container as any )._mapboxMap;
			}
			currentSetLoaded( false );
		};
	}, [
		accessToken,
		mapStyle,
		destroyTempMarker,
		handleMapClick,
		handleMouseEnter,
		handleMouseLeave,
		handleStyleLoad,
	] );

	// Effect 1: Synchronize GeoJSON source data on filter / listings changes
	useEffect( () => {
		if ( loaded && map.current ) {
			const activeListings =
				filteredListings !== null ? filteredListings : listings;
			ensureDealerSource( map.current, activeListings );

			// Reset selection if selected dealer is no longer in visible listings
			if ( selectedDealerId !== null ) {
				const visible = getCanonicalDealerListings( activeListings );
				if ( ! visible.some( ( l ) => l.id === selectedDealerId ) ) {
					setSelectedDealerId( null );
				}
			}
		}
	}, [
		loaded,
		map,
		listings,
		filteredListings,
		selectedDealerId,
		setSelectedDealerId,
	] );

	// Effect 2: Update selected dealer icon-size expression when selectedDealerId changes
	useEffect( () => {
		if ( loaded && map.current ) {
			// Update icon-size on both layers to reflect the new selection state
			ensureDealerLayers(
				map.current,
				selectedDealerId,
				mapIcons as MarkerIcon[]
			);
			if ( selectedDealerId !== null ) {
				destroyTempMarker();
			}
		}
	}, [ loaded, map, selectedDealerId, mapIcons, destroyTempMarker ] );

	/**
	 * if the access key isn't provided
	 */
	if ( ! mapDefaults?.accessToken ) {
		return (
			<div>
				<p>
					{ createInterpolateElement(
						__(
							'Get a <a>Mapbox Access Token</a>, then add the token to your config.php file as a constant <code>MAPBOX_TOKEN</code>',
							'vsge-mapbox-block'
						),
						{
							a: (
								// eslint-disable-next-line jsx-a11y/anchor-has-content
								<a
									href="//account.mapbox.com/auth/signup/"
									target="_blank"
									rel="noreferrer"
								/>
							),
							code: <code />,
						}
					) }
				</p>
			</div>
		);
	}

	/**
	 * The mapbox component
	 */
	return (
		<div className={ 'map-wrapper' }>
			{ attributes.sidebarEnabled && (
				<div className={ 'map-sidebar' }>
					{ attributes.geocoderEnabled && <GeoCoder /> }
					<Sidebar
						clearPopups={ clearPopups }
						openPopup={ openPopup }
					/>
				</div>
			) }
			<div className={ 'map-container' }>
				<TopBar
					{ ...attributes }
					onClearGeocoder={ clearGeocoder }
					onClearPopups={ clearPopups }
				/>
				<MapCanvas />
			</div>
		</div>
	);
}
