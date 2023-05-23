import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import '../../style/style.scss';

import { createRoot, Suspense } from '@wordpress/element';
import { MapBox } from './';
import { MapProvider } from './MapboxContext';
import { getMapDefaults } from '../../utils';
import { MapAttributes } from '../../types';

/**
 * This function creates a React component that renders a MapBox map with given attributes and default
 * settings.
 *
 * @param {HTMLElement} el         - HTMLElement - the HTML element where the map will be rendered
 * @param               attributes - The `attributes` parameter is an object that contains the configuration options
 *                                 for the MapBox component, such as the map's center coordinates, zoom level, and map style. These
 *                                 options are passed down to the MapBox component as props.
 */
export function createMapRoot( el: HTMLElement, attributes ) {
	// initialize the map with React
	const componentRoot = createRoot( el );
	componentRoot.render(
		<Suspense fallback={ <div className="wp-block-placeholder" /> }>
			<MapProvider>
				<MapBox
					attributes={ attributes }
					mapDefaults={ getMapDefaults() }
				/>
			</MapProvider>
		</Suspense>
	);
}

/**
 * This code block is checking if there are any elements with the class "wp-block-vsge-mapbox" on the
 * page. If there are, it adds an event listener to the document that listens for the
 * "DOMContentLoaded" event. Once the DOM content has loaded, it loops through each element with the
 * "wp-block-vsge-mapbox" class and calls the "initMapbox" function on each one. This initializes the
 * Mapbox map on each element.
 *
 *
 * @function Object() { [native code] } Initial Mapbox setup
 */

document.addEventListener( 'DOMContentLoaded', () => {
	/* get the mapbox elements */
	const mapboxWrapper: NodeListOf< HTMLElement > | null =
		document.querySelectorAll( '.wp-block-vsge-mapbox' );

	// Then create a Mapbox map React element for each element with the class "wp-block-vsge-mapbox"
	if ( mapboxWrapper.length > 0 ) {
		mapboxWrapper.forEach( ( mapElement ) => {
			const rawAttributes = { ...mapElement.dataset };
			const attributes: MapAttributes = {
				...rawAttributes,
				mapboxOptions: JSON.parse(
					rawAttributes.mapboxOptions ||
						'{ "pin": { "icon": "", "size": 48, "color": "white" }, "listings": [], "tags": [], "filters": [] }'
				),
				bearing: Number( rawAttributes.bearing ),
				elevation: Boolean( rawAttributes.elevation ),
				filtersEnabled: Boolean( rawAttributes.filtersEnabled ),
				fitView: Boolean( rawAttributes.fitView ),
				freeViewCamera: Boolean( rawAttributes.freeViewCamera ),
				geocoderEnabled: Boolean( rawAttributes.geocoderEnabled ),
				latitude: Number( rawAttributes.latitude ),
				longitude: Number( rawAttributes.longitude ),
				pitch: Number( rawAttributes.pitch ),
				sidebarEnabled: Boolean( rawAttributes.sidebarEnabled ),
				tagsEnabled: Boolean( rawAttributes.tagsEnabled ),
				mapHeight: rawAttributes.mapHeight || '100vh',
				mapStyle:
					rawAttributes.mapStyle ||
					'mapbox://styles/mapbox/streets-v11',
				mapZoom: Number( rawAttributes.mapZoom ),
				mouseWheelZoom: Boolean( rawAttributes.mouseWheelZoom ),
			};
			createMapRoot( mapElement, attributes );
		} );
	}
} );
