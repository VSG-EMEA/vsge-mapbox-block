import { createRoot } from '@wordpress/element';
import { MapBox } from '../components/Mapbox';

export function createMapRoot( el: HTMLElement, attributes ) {
	// initialize the map with React
	const componentRoot = createRoot( el );
	componentRoot.render( <MapBox attributes={ attributes } /> );
}
