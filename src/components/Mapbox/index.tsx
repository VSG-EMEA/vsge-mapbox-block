import { Map } from './Map';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useEffect, useContext } from '@wordpress/element';
import { MapboxContext } from './MapboxContext';
import { initMap } from './utils/initMap';
import mapboxgl from 'mapbox-gl';
import { initGeocoder } from './utils/geocoder';
import { MountedMapsContextValue } from '../../types';

export function MapBox( { attributes } ): JSX.Element {
	const {
		map,
		setMap,
		setGeoCoder,
		defaults,
		mapRef,
		geocoderRef,
	}: MountedMapsContextValue = useContext( MapboxContext );

	useEffect( () => {
		if ( defaults?.accessToken && mapRef?.current ) {
			// Provide access token
			mapboxgl.accessToken = defaults.accessToken;

			// Initialize map and store the map instance
			setMap( initMap( mapRef.current, attributes, defaults ) );

			if ( attributes.geocoderEnabled ) {
				setGeoCoder(
					initGeocoder( geocoderRef, map, attributes, defaults )
				);
			}
		} else {
			console.log( 'No access token' );
		}
	}, [ mapRef ] );

	return (
		<div
			className={ 'map-wrapper' }
			style={ { minHeight: attributes.mapHeight } }
		>
			{ attributes.sidebarEnabled ? (
				<Sidebar
					attributes={ attributes }
					geocoderRef={ geocoderRef }
				/>
			) : null }
			<div className={ 'map-container' }>
				<TopBar { ...attributes } />
				<Map mapRef={ mapRef } />
			</div>
		</div>
	);
}
