import { Map } from './Map';
import { MapboxSidebar } from './MapboxSidebar';
import { getDefaults } from '../../utils';
import { useEffect, useRef } from '@wordpress/element';
import mapboxgl from 'mapbox-gl';
import { initMap } from '../../utils/map';

/**
 * This is a TypeScript React component that renders a Mapbox map with optional sidebar functionality.
 *
 * @param -            - `attributes`: an object containing various attributes for the MapBox component
 * @param -.attributes
 * @param -.map
 * @param -.setMap
 * @return A JSX element containing a div with class "map-wrapper" and either a MapboxSidebar
 * component or null (depending on the value of attributes.sidebarEnabled prop) followed by another div
 * with class "map-container" containing a Map component.
 */
function MapBox( { attributes, map = null, setMap = null } ): JSX.Element {
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
