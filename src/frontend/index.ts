import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import '../style/style.scss';

import { createMapRoot } from './init';

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
			const attributes = mapElement.dataset;
			const mapboxBlockAttributes = JSON.parse(
				attributes.mapboxAttributes
			);

			mapboxBlockAttributes
				? createMapRoot( mapElement, {
						attributes: mapboxBlockAttributes,
				  } )
				: null;
		} );
	}
} );
