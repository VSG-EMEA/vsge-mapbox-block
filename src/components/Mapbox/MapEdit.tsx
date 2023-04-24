import { BlockAttributes, BlockEditProps } from '@wordpress/blocks';
import { MapboxContext, useMap } from './MapboxContext';
import mapboxgl from 'mapbox-gl';
import { useContext, useEffect } from '@wordpress/element';
import { MapBox } from './index';

export function MapEdit( {
	attributes,
	setAttributes,
	isSelected,
} ): JSX.Element {
	const { map } = useContext( MapboxContext );

	function pullMapOptions( currentMap: mapboxgl.Map | undefined ) {
		if ( currentMap && isSelected )
			setAttributes( {
				latitude: currentMap.getCenter().lat,
				longitude: currentMap.getCenter().lng,
				pitch: currentMap.getPitch(),
				bearing: currentMap.getBearing(),
				mapZoom: currentMap.getZoom(),
			} );
	}

	useEffect( () => {
		if ( map ) {
			map.on( 'move', () => pullMapOptions( map ) );
		}
	}, [ attributes ] );

	useEffect( () => {
		if ( map ) {
			map.setStyle( 'mapbox://styles/mapbox/' + attributes.mapStyle );
		}
	}, [ attributes.mapStyle ] );

	useEffect( () => {
		if ( map ) {
			if ( attributes.treeDimensionality ) {
				if ( ! map.getSource( 'mapbox-dem' ) ) {
					map.addSource( 'mapbox-dem', {
						type: 'raster-dem',
						url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
						tileSize: 512,
						maxzoom: 14,
					} );
				}

				// add the DEM source as a terrain layer with exaggerated height
				map.setTerrain( {
					source: 'mapbox-dem',
					exaggeration: 1.5,
				} );
			} else if (
				! attributes.treeDimensionality &&
				map.getSource( 'mapbox-dem' )
			) {
				map.removeSource( 'mapbox-dem' );
			}
		}
	}, [ attributes.treeDimensionality ] );

	return <MapBox attributes={ attributes } />;
}
