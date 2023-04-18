import { LngLatBoundsLike, Marker } from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { __ } from '@wordpress/i18n';
import { Coord } from '@turf/turf';

import { MapItem } from '../../types';
import { createPopUp, removePopup } from '../../utils/popups';
import { getBbox, locateNearestStore } from '../../utils/spatialCalcs';
import { renderListings } from '../../utils/map';
import { fitView } from '../../utils/view';

export let searchResult: Coord | undefined;

export const geoMarker = (): JSX.Element => (
	<div id={ 'marker-geocoder' } className={ 'marker marker-geocoder' }></div>
);

export default ( { geocoderRef = null, mapboxgl, listings, defaults } ) => {
	let filteredStores: MapItem[] = listings;

	const geocoder = new MapboxGeocoder( {
		accessToken: defaults.accessToken,
		mapboxgl,
		lang: defaults.language,
		placeholder: __( 'Find the nearest store' ),
		marker: {
			element: () => geoMarker,
			color: 'grey',
			offset: [ 0, -23 ],
		},
		flyTo: {
			bearing: 0,
			// These options control the flight curve, making it move
			// slowly and zoom out almost completely before starting
			// to pan.
			speed: 0.2, // make the flying slow
			curve: 1, // change the speed at which it zooms out
			// This can be any easing function: it takes a number between
			// 0 and 1 and returns another number between 0 and 1.
			easing( t: any ) {
				return t;
			},
		},
	} );

	geocoder.on(
		'result',
		( ev: { result: { geometry: Coord | undefined } } ) => {
			// save the search results
			searchResult = ev.result.geometry;

			if ( searchResult ) {
				filteredStores = locateNearestStore(
					searchResult,
					filteredStores
				);

				const listingContainer: HTMLElement | null =
					document.getElementById( 'feature-listing' );
				while ( listingContainer?.firstChild ) {
					listingContainer.removeChild( listingContainer.firstChild );
				}

				renderListings( filteredStores );
				/* Open a popup for the closest store. */
				if ( defaults?.siteurl )
					createPopUp( filteredStores[ 0 ], {
						siteurl: defaults.siteurl,
					} );

				/** Highlight the listing for the closest store. */
				const activeListing = filteredStores.length
					? document.getElementById(
							'listing-' + filteredStores[ 0 ].properties?.id
					  )
					: null;
				activeListing?.classList.add( 'active-store' );

				/**
				 * Adjust the map camera:
				 * Get a bbox that contains both the geocoder result and
				 * the closest store. Fit the bounds to that bbox.
				 */
				const bbox = getBbox(
					filteredStores,
					0,
					searchResult
				) as LngLatBoundsLike;

				map.fitBounds( bbox, {
					padding: 100,
				} );
			}
		}
	);

	geocoder.on( 'clear', function () {
		document
			.getElementById( 'feature-listing' )
			?.classList.remove( 'filtered' );
		renderListings( filteredStores );
		searchResult = undefined;
		removePopup();
		fitView( map, filteredStores );
	} );

	return <div id="geocoder" className="geocoder" ref={ geocoderRef }></div>;
};
