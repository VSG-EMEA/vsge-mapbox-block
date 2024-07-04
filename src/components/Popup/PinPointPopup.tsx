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
import { removeTempMarkers } from '../Marker/utils';

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
						// remove any popup or temp marker (clicked point, another geocoder marker) from the map
						const currentListings = removeTempMarkers(
							listings,
							mapRef,
							[ 'click-marker' ]
						);

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
							const searchResult =
								e.result as MapboxGeocoder.Result;

							const filtered = getNearestStore(
								searchResult,
								mapRef,
								map,
								currentListings,
								null
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
