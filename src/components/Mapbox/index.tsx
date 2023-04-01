import { useEffect, useRef } from '@wordpress/element';
import mapboxgl from 'mapbox-gl';
import { MapboxSidebar } from './MapboxSidebar';
import { Mapbox } from './Map';
import { defaults } from '../../constants';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

export default ( { attributes, mapInstance } ) => {
	const {
		latitude,
		longitude,
		pitch,
		bearing,
		mapZoom,
		mapStyle,
		mapboxOptions,
	} = attributes;

	const geocoderRef: React.MutableRefObject< MapboxGeocoder | undefined > =
		useRef();

	useEffect( () => {
		if ( defaults?.accessToken ) {
			mapboxgl.accessToken = defaults.accessToken;
			if ( mapboxgl.accessToken && mapInstance.current !== null ) {
				const map = new mapboxgl.Map( {
					container: mapInstance.current || '',
					style: 'mapbox://styles/mapbox/' + mapStyle,
					center: [ parseFloat( longitude ), parseFloat( latitude ) ],
					pitch: parseFloat( pitch ),
					bearing: parseFloat( bearing ),
					zoom: parseFloat( mapZoom ),
				} );
			}
		} else {
			console.error( 'cannot find access token' );
		}
	}, [] );

	useEffect( () => {
		if ( defaults?.accessToken ) {
			if ( mapboxgl.accessToken && mapInstance.current !== null ) {
				const currentMap = new mapboxgl.Map( {
					container: mapInstance.current,
					style: 'mapbox://styles/mapbox/' + mapStyle,
					center: [ parseFloat( longitude ), parseFloat( latitude ) ],
					pitch: parseFloat( pitch ),
					bearing: parseFloat( bearing ),
					zoom: parseFloat( mapZoom ),
				} );
			}
		} else {
			throw new Error( 'cannot find access token' );
		}
	}, [ defaults ] );

	return (
		<div className="map-wrapper">
			{ mapboxOptions.sidebarEnabled ? (
				<MapboxSidebar
					map={ map }
					geocoderEnabled={ mapboxOptions.geocoderEnabled }
					geocoderRef={ geocoderRef }
					mapboxOptions={ mapboxOptions }
					listings={ mapboxOptions.listings }
				/>
			) : null }
			<div id="map-container">
				<Mapbox { ...mapboxOptions } />
			</div>
		</div>
	);
};
