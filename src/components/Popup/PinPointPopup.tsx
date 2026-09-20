import type mapboxgl from 'mapbox-gl';
import {
	CoordinatesDef,
	MapboxBlockDefaults,
	MapBoxListing,
} from '../../types';
import { __ } from '@wordpress/i18n';
import { normalizeMapboxLanguage } from '../../utils/dataset';
import { DEFAULT_GEOCODER_TYPE_SEARCH } from '../../constants';
import { removePopups } from './index';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import type { Dispatch } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { getNearestStore } from '../Geocoder/utils';
import { useContext } from '@wordpress/element';
import { removeTempMarkers } from '../Marker/utils';
import type { PopupManager } from './popupManager';
import type { DealerMarkerRegistry } from '../Marker/registry';
import { MapboxContext } from '../Mapbox/MapboxContext';

export function PinPointPopup( props: {
	map: mapboxgl.Map;
	location: CoordinatesDef;
	mapRef: HTMLDivElement;
	listings: MapBoxListing[] | null;
	setListings: Dispatch< MapBoxListing[] >;
	setFilteredListings: Dispatch< MapBoxListing[] | null >;
	mapDefaults: MapboxBlockDefaults;
	clearPopups?: () => void;
	popupManager?: PopupManager | null;
	markerRegistry?: DealerMarkerRegistry | null;
	mapbox?: any;
	setDistanceReference?: ( coords: CoordinatesDef | null ) => void;
} ): JSX.Element | null {
	const {
		location,
		map,
		mapRef,
		listings,
		setFilteredListings,
		mapDefaults,
		clearPopups,
		popupManager,
		markerRegistry,
		mapbox,
	} = props;

	const context = useContext( MapboxContext );
	const setDistanceReference =
		props.setDistanceReference || context?.setDistanceReference;

	const isDisposedRef = useRef( false );
	const activeGeocoderRef = useRef< {
		geo: MapboxGeocoder;
		container: HTMLElement;
		onResult: ( ev: any ) => void;
		onError: ( ev: any ) => void;
	} | null >( null );

	const cleanupActiveGeocoder = useCallback( () => {
		if ( activeGeocoderRef.current ) {
			const { geo, container, onResult, onError } =
				activeGeocoderRef.current;
			geo.off( 'result', onResult );
			geo.off( 'error', onError );
			try {
				geo.onRemove();
			} catch {
				// Ignore if already removed
			}
			if ( container.parentNode ) {
				container.parentNode.removeChild( container );
			}
			activeGeocoderRef.current = null;
		}
	}, [] );

	useEffect( () => {
		isDisposedRef.current = false;
		return () => {
			isDisposedRef.current = true;
			cleanupActiveGeocoder();
		};
	}, [ cleanupActiveGeocoder ] );

	if ( ! mapRef ) {
		return null;
	}

	return (
		<div className={ 'mapbox-popup-inner mapbox-popup-newpin' }>
			<h3 className={ 'mapbox-popup-newpin-title' }>
				{ __( 'My location', 'vsge-mapbox-block' ) }
			</h3>
			<div className={ 'mapbox-popup-newpin-buttons' }>
				<button
					onClick={ () => {
						cleanupActiveGeocoder();

						// remove any popup or temp marker from the registry / listings
						const currentListings = removeTempMarkers(
							listings || [],
							markerRegistry || mapRef,
							[ 'click-marker' ]
						);

						const geo = new MapboxGeocoder( {
							accessToken: mapDefaults.accessToken,
							reverseGeocode: true,
							language:
								normalizeMapboxLanguage(
									mapDefaults.language
								) || 'en',
							types: DEFAULT_GEOCODER_TYPE_SEARCH,
						} );

						const geoInputMock = document.createElement( 'div' );
						geoInputMock.style.display = 'none';
						mapRef.appendChild( geoInputMock );

						geo.addTo( geoInputMock );

						const onResult = ( ev: any ) => {
							if ( isDisposedRef.current ) {
								cleanupActiveGeocoder();
								return;
							}

							const searchResult =
								ev.result as MapboxGeocoder.Result;

							const filtered = getNearestStore(
								searchResult,
								mapRef,
								map,
								currentListings,
								undefined,
								popupManager,
								mapbox
							);

							cleanupActiveGeocoder();
							setFilteredListings( filtered );
							setDistanceReference?.( location );
						};

						const onError = () => {
							if ( isDisposedRef.current ) {
								cleanupActiveGeocoder();
								return;
							}
							cleanupActiveGeocoder();
						};

						geo.on( 'result', onResult );
						geo.on( 'error', onError );

						activeGeocoderRef.current = {
							geo,
							container: geoInputMock,
							onResult,
							onError,
						};

						geo.query( `${ location[ 1 ] },${ location[ 0 ] }` );
					} }
				>
					{ __( 'Find nearest Sales Agent', 'vsge-mapbox-block' ) }
				</button>
				<button
					onClick={ () => {
						cleanupActiveGeocoder();
						if ( clearPopups ) {
							clearPopups();
						} else {
							removePopups( mapRef );
						}
						setFilteredListings( null );
						setDistanceReference?.( null );
					} }
				>
					{ __( 'Reset', 'vsge-mapbox-block' ) }
				</button>
			</div>
		</div>
	);
}
