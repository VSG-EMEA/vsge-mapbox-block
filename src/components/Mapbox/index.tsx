import { Map } from './Map';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useEffect, useContext, useState } from '@wordpress/element';
import { MapboxContext } from './MapboxContext';
import { initMap } from './utils/initMap';
import mapboxgl from 'mapbox-gl';
import { initGeocoder } from './utils/geocoder';
import { MountedMapsContextValue } from '../../types';
import { MarkerPopup } from './Popup';
import { initMarkers } from './utils/markers';

export function MapBox( { attributes } ): JSX.Element {
	const {
		map,
		setMap,
		setGeoCoder,
    setLngLat,
		defaults,
		mapRef,
		geocoderRef,
	}: MountedMapsContextValue = useContext( MapboxContext );

	function listenForClick( map ) {
		if ( map ) {
			map.on( 'click', ( e ) => {
				const labels = e.features?.map( ( feature ) => (
					<MarkerPopup
						key={ feature.properties?.id }
						{ ...feature.properties }
					/>
				) );

				console.log( e.lngLat );

				// setPopupContent( labels );
				setLngLat( e.lngLat );
			} );
		}
	}

	useEffect( () => {
		if ( defaults?.accessToken && mapRef?.current ) {
			// Provide access token
			mapboxgl.accessToken = defaults.accessToken;

			// Initialize map and store the map instance
			setMap( initMap( mapRef.current, attributes, defaults ) );
		} else {
			console.log( 'No access token' );
		}
	}, [ mapRef ] );

	useEffect( () => {
		if ( map ) {
			map.on( 'load', () => {
				// Add markers
				initMarkers( attributes.mapboxOptions.listings, map );

				// Add geocoder
				if ( attributes.sidebarEnabled && attributes.geocoderEnabled ) {
					setGeoCoder(
						initGeocoder( geocoderRef, map, attributes, defaults )
					);
				}

				// Listen for marker clicks
				listenForClick( map );
			} );
		}
	}, [ map ] );

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
