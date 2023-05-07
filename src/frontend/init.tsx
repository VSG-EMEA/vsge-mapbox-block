import { createRoot } from '@wordpress/element';
import { MapBox } from '../components/Mapbox';
import { MapProvider } from '../components/Mapbox/MapboxContext';
import { getMapDefaults } from '../utils';

export function createMapRoot( el: HTMLElement, { attributes } ) {
	// initialize the map with React
	const componentRoot = createRoot( el );
	componentRoot.render(
		<MapProvider>
			<MapBox
				attributes={ attributes }
				mapDefaults={ getMapDefaults() }
			/>
		</MapProvider>
	);
}
