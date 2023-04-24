import { createRoot } from '@wordpress/element';
import { MapFrontend } from '../components/Mapbox/MapFrontend';

export function createMapRoot( el: HTMLElement, { attributes } ) {
	// initialize the map with React
	const componentRoot = createRoot( el );
	componentRoot.render( <MapFrontend attributes={ attributes } /> );
}
