import type mapboxgl from 'mapbox-gl';
import { CoordinatesDef, MapBoxListing } from '../../types';
import { __ } from '@wordpress/i18n';
import { MARKER_TYPE_TEMP } from '../../constants';
import { locateNearestStore } from '../../utils/spatialCalcs';
import { removePopups, showNearestStore } from './index';
import type { Dispatch } from 'react';
import { Result } from '@mapbox/mapbox-gl-geocoder';

export function PinPointPopup( props: {
	map: mapboxgl.Map;
	location: CoordinatesDef;
	mapRef: HTMLDivElement;
	listings: MapBoxListing[] | null;
	setListings: Dispatch< MapBoxListing[] >;
	setFilteredListings: Dispatch< MapBoxListing[] | null >;
} ): JSX.Element | null {
	const { location, map, mapRef, listings, setFilteredListings } = props;

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
						// get the current temp pin data
						const currentPinData = listings?.find( ( listing ) => {
							return listing.type === MARKER_TYPE_TEMP;
						} );
						if ( ! currentPinData ) {
							// eslint-disable-next-line no-console
							console.error( 'currentPinData not found' );
							return;
						}
						// sort the array and get the nearest store
						const sortedNearestStores = locateNearestStore(
							location,
							listings
						);
						// create a new temp pin
						const myLocationPin = {
							...currentPinData,
							text: __( 'My location', 'vsge-mapbox-block' ),
							geometry: {
								type: 'Point',
								coordinates: location as CoordinatesDef,
							},
							properties: {
								icon: 'myLocation',
								draggable: false,
								name: __( 'My location', 'vsge-mapbox-block' ),
							},
						};
						const sortedListings = showNearestStore(
							myLocationPin as Result & MapBoxListing,
							sortedNearestStores,
							mapRef,
							map
						);
						const filtered = [ ...sortedListings, myLocationPin ];
						setFilteredListings( filtered );
					} }
				>
					{ __( 'Find the nearest store?', 'vsge-mapbox-block' ) }
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
