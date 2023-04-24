import { Map } from './Map';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useEffect, useContext, useRef } from '@wordpress/element';
import { MapboxContext } from './MapboxContext';
import { initMap } from './utils/map';
import mapboxgl from 'mapbox-gl';

export function MapBox( { attributes } ): JSX.Element {
	const { setMap, defaults, mapRef, geocoderRef } =
		useContext( MapboxContext );

	useEffect( () => {
		if ( defaults?.accessToken && mapRef.current ) {
			mapboxgl.accessToken = defaults.accessToken;
			setMap( initMap( mapRef.current, attributes ) );
		} else {
			console.log( 'No access token' );
		}
	}, [ mapRef ] );

	return (
		<div className={ 'map-wrapper' }>
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
