import { Map } from './Map';
import { MapboxSidebar } from './MapboxSidebar';
import { getDefaults } from '../../utils';
import { useEffect, useRef } from '@wordpress/element';
import mapboxgl from 'mapbox-gl';
import { initMap } from '../../utils/map';

function MapBox( {
	attributes,
	map = null,
	setMap = null,
} ): JSX.Element {
	const defaults = getDefaults();

	const mapContainer = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( defaults?.accessToken && mapContainer.current ) {
			mapboxgl.accessToken = defaults.accessToken;
			setMap( initMap( mapContainer.current, attributes, map ) );
		} else {
			console.log( 'No access token' );
		}
	}, [] );

	return (
		<div className="map-wrapper">
			{ attributes.sidebarEnabled ? (
				<MapboxSidebar
					defaults={ defaults }
					map={ map }
					geocoderRef={ attributes.geocoderRef }
					mapboxOptions={ attributes.mapboxOptions }
				/>
			) : null }
			<div className={ 'map-container' }>
				<Map attributes={ attributes } mapContainer={ mapContainer } />
			</div>
		</div>
	);
}

export default MapBox;
