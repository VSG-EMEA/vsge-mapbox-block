import type mapboxgl from 'mapbox-gl';
import {
	CoordinatesDef,
	MapboxBlockDefaults,
	MapBoxListing,
} from '../../types';
import { __ } from '@wordpress/i18n';
import {
	DEFAULT_GEOCODER_TYPE_SEARCH,
	MARKER_TYPE_TEMP,
} from '../../constants';
import { removePopups } from './index';
import type { Dispatch } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { getNearestStore } from '../Geocoder/utils';
import { getTheCurrentTempPin } from '../../utils/view';
import { initGeoMarker } from '../Marker/Geomarker';
import { getNextId } from '../../utils/dataset';

export function PinPointPopup( props: {
	map: mapboxgl.Map;
	location: CoordinatesDef;
	mapRef: HTMLDivElement;
	listings: MapBoxListing[] | null;
	setListings: Dispatch< MapBoxListing[] >;
	setFilteredListings: Dispatch< MapBoxListing[] | null >;
	mapDefaults: MapboxBlockDefaults;
	markersRef: HTMLButtonElement[];
} ): JSX.Element | null {
	const {
		location,
		map,
		mapRef,
		listings,
		setFilteredListings,
		mapDefaults,
		markersRef,
	} = props;

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
					onClick={ ( e ) => {
						const currentPinData = getTheCurrentTempPin( listings );

						const geo = new MapboxGeocoder( {
							accessToken: mapDefaults.accessToken,
							reverseGeocode: true,
							language: mapDefaults.language || 'en',
							types: DEFAULT_GEOCODER_TYPE_SEARCH,
						} );

						map.addControl( geo );

						geo.query( `${ location[ 1 ] },${ location[ 0 ] }` );

						// Add geocoder result to container.
						geo.on( 'result', ( e ) => {
							const marker = initGeoMarker(
								getNextId( listings ),
								markersRef
							);

							const searchResult =
								e.result as MapboxGeocoder.Result;

							// create a new temp pin
							const myLocationPin: MapBoxListing = {
								id: 0,
								type: MARKER_TYPE_TEMP,
								text: searchResult.place_name,
								marker: marker,
								place_name:
									currentPinData.place_name ??
									__( 'My location', 'vsge-mapbox-block' ),
								geometry: {
									type: 'Point',
									coordinates: searchResult.geometry
										.coordinates as CoordinatesDef,
								},
								properties: {
									...currentPinData?.properties,
								},
							};

							const filtered = getNearestStore(
								searchResult,
								mapRef,
								map,
								listings,
								myLocationPin
							);

							map.removeControl( geo );

							setFilteredListings( filtered );
						} );
					} }
				>
					{ __(
						'Find the nearest Sales Agent',
						'vsge-mapbox-block'
					) }
				</button>
				<button
					onClick={ () => {
						removePopups( mapRef );
						setFilteredListings( null );
					} }
				>
					Reset
				</button>
			</div>
		</div>
	);
}
