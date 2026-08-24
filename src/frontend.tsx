import './style/frontend.scss';

import { createRoot, lazy, Suspense } from '@wordpress/element';
import { MapProvider } from './components/Mapbox/MapboxContext';
import { MapAttributes } from './types';
import Loader from './components/Loader';
import { getMapDefaults } from './utils';

const MapBox = lazy( async () => ( {
	default: ( await import( './components/Mapbox/index' ) ).MapBox,
} ) );

const isEnabled = ( value: unknown ): boolean =>
	value === true || value === 'true';

/**
 * This function creates a React component that renders a MapBox map with given attributes and default
 * settings.
 *
 * @param {HTMLElement} el         - HTMLElement - the HTML element where the map will be rendered
 * @param               attributes - The `attributes` parameter is an object that contains the configuration options
 *                                 for the MapBox component, such as the map's center coordinates, zoom level, and map style. These
 *                                 options are passed down to the MapBox component as props.
 */
export async function createMapRoot(
	el: HTMLElement,
	attributes: MapAttributes
) {
	// initialize the map with React
	const mapboxgl = await import(
		/* webpackChunkName: "mapbox" */ 'mapbox-gl'
	);
	const componentRoot = createRoot( el );
	componentRoot.render(
		<Suspense fallback={ <Loader wrapperHeight={ '50vh' } /> }>
			<MapProvider attributes={ attributes }>
				<MapBox
					mapboxgl={ mapboxgl.default }
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
			const payload = mapElement.querySelector(
				':scope > script.vsge-mapbox-data'
			)?.textContent;
			let rawAttributes: Record< string, unknown > = {
				...mapElement.dataset,
			};
			if ( payload ) {
				try {
					rawAttributes = JSON.parse( payload ) as Record<
						string,
						unknown
					>;
				} catch ( error ) {
					// Keep rendering legacy data attributes if a malformed payload is encountered.
					// eslint-disable-next-line no-console
					console.error( 'Unable to read Mapbox block data.', error );
				}
			}
			const attributes: MapAttributes = {
				...rawAttributes,
				mapboxOptions: ( typeof rawAttributes.mapboxOptions === 'string'
					? JSON.parse( rawAttributes.mapboxOptions )
					: rawAttributes.mapboxOptions || {
							listings: [],
							tags: [],
							filters: [],
							icons: [],
					  } ) as MapAttributes[ 'mapboxOptions' ],
				align: String( rawAttributes.align || 'center' ),
				bearing: Number( rawAttributes.bearing || 0 ),
				elevation: isEnabled( rawAttributes.elevation ),
				freeViewCamera: isEnabled( rawAttributes.freeViewCamera ),
				mapProjection: String(
					rawAttributes.mapProjection || 'mercator'
				),
				latitude: Number( rawAttributes.latitude || 0 ),
				longitude: Number( rawAttributes.longitude || 0 ),
				pitch: Number( rawAttributes.pitch || 0 ),
				sidebarEnabled: isEnabled( rawAttributes.sidebarEnabled ),
				fitView: isEnabled( rawAttributes.fitView ),
				geocoderEnabled: isEnabled( rawAttributes.geocoderEnabled ),
				tagsEnabled: isEnabled( rawAttributes.tagsEnabled ),
				filtersEnabled: isEnabled( rawAttributes.filtersEnabled ),
				mapHeight: String( rawAttributes.mapHeight || '100vh' ),
				mapStyle:
					String( rawAttributes.mapStyle || '' ) ||
					'mapbox://styles/mapbox/streets-v11',
				mapZoom: Number( rawAttributes.mapZoom || 0 ),
				mouseWheelZoom: isEnabled( rawAttributes.mouseWheelZoom ),
			};
			createMapRoot( mapElement, attributes );
		} );
	}
} );
