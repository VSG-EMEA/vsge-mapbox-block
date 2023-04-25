import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { __ } from '@wordpress/i18n';
import { mapboxgl } from 'mapbox-gl';

export function initGeocoder(
	geocoderRef,
	map,
	attributes,
	defaults
): MapboxGeocoder {
	if ( defaults.accessToken ) {
		const geocoder = new MapboxGeocoder( {
			accessToken: defaults.accessToken,
			mapboxgl,
			lang: defaults.language || 'en',
			placeholder: __( 'Find the nearest store' ),
			marker: {
				element: document.createElement( 'div' ),
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

		geocoderRef.current.appendChild( geocoder.onAdd( map ) );

		geocoder.on( 'clear', function () {
			// document
			// 	.getElementById( 'feature-listing' )
			// 	?.classList.remove( 'filtered' );
			// renderListings( attributes.mapboxOptions.listings );
			// searchResult = undefined;
			// removePopup();
			// fitView( map, attributes.mapboxOptions.listings );
		} );

		geocoder.on( 'result', ( ev ) => {
			console.log( ev?.result );
			// save the search results
			/*searchResult = ev.result.geometry;

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
          /!* Open a popup for the closest store. *!/
          if ( defaults?.siteurl )
            createPopUp( filteredStores[ 0 ], {
              siteurl: defaults.siteurl,
            } );

          /!** Highlight the listing for the closest store. *!/
          const activeListing = filteredStores.length
            ? document.getElementById(
              'listing-' + filteredStores[ 0 ].properties?.id
            )
            : null;
          activeListing?.classList.add( 'active-store' );

          /!**
          * Adjust the map camera:
            * Get a bbox that contains both the geocoder result and
          * the closest store. Fit the bounds to that bbox.
          *!/
          const bbox = getBbox(
            filteredStores,
            0,
            searchResult
          ) as LngLatBoundsLike;

          map.fitBounds( bbox, {
            padding: 100,
          } );
        }*/
		} );

		return geocoder;
	}

	console.log( 'No access token' );
}
