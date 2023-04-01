import { useEffect } from '@wordpress/element';
import mapboxgl from 'mapbox-gl';
import { MapboxSidebar } from './MapboxSidebar';
import { Mapbox } from './Map';
import { getDefaults } from '../../constants';

export const MapboxBlock = ( { attributes, mapInstance } ) => {
	const {
		latitude,
		longitude,
		pitch,
		bearing,
		mapZoom,
		mapStyle,
		accessToken,
		mapboxOptions: {
			sidebarEnabled,
			geocoderEnabled,
			tags,
			features,
			listings,
		},
	} = attributes;

	const defaults = getDefaults();

	useEffect( () => {
		if ( accessToken ) {
			mapboxgl.accessToken = accessToken;

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

			// TODO: enable geocoder

			// TODO: refreshMap( mapInstance.current );
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

	return <div className="map-wrapper"></div>;
};
