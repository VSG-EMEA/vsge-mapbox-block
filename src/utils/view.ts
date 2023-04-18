import mapboxgl, { Coordinate } from 'mapbox-gl';
import { Feature } from '@turf/turf';

export function recenterView( map, defaults ) {
	return map.flyTo( {
		center: [ defaults.latitude, defaults.longitude ],
		zoom: defaults.zoom,
	} );
}

export function flyToStore(
	map: mapboxgl.Map,
	coordinates: Coordinate,
	zoom: number = 8
) {
	return map.flyTo( {
		center: coordinates,
		zoom,
	} );
}

export function fitView(map, filteredStores) {
	const bounds = new mapboxgl.LngLatBounds();
	const mapContainer = document.getElementById( 'map-container' );
	if ( mapContainer ) {
		const padding = mapContainer.offsetWidth * 0.1;

		console.log( bounds );

		if ( filteredStores.length !== 0 ) {
			filteredStores.forEach( ( point: Feature ) => {
				bounds.extend( point.geometry.coordinates );
			} );

			if (
				bounds.sw.lat === bounds.ne.lat &&
				bounds.sw.lng === bounds.ne.lng
			) {
				const lat = parseFloat( bounds.sw.lat );
				const lng = parseFloat( bounds.sw.lng );
				bounds.sw.lat = lat + 0.5;
				bounds.ne.lat = lat - 0.5;
				bounds.sw.lng = lng + 0.5;
				bounds.ne.lng = lng - 0.5;
			}
			map.fitBounds( bounds, { padding } );
		}

		map.resize();
	}
}
