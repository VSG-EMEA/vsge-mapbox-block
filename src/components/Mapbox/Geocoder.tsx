import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { __ } from '@wordpress/i18n';
import { RefObject } from 'react';
import { createRef, createRoot, useContext } from '@wordpress/element';
import mapboxgl from 'mapbox-gl';
import { Marker } from './Marker';
import { MapboxContext } from './MapboxContext';
import { getNextId } from '../../utils/dataset';
import { MapAttributes, MapboxBlockDefaults, MapBoxListing } from '../../types';
import {
	defaultMarkerProps,
	defaultMarkerSize,
	geoMarkerStyle,
} from './defaults';

/* This is a TypeScript React function that returns a JSX element representing a marker for the
geocoder search result. It receives `props` as an argument, which contains `coordinates` and `map`
properties. It also uses the `useContext` hook to access the `markers` state from the
`MapboxContext`. It then returns a `Marker` component with the necessary properties to display the
geocoder marker on the map. The `feature` property contains the marker's `id`, `properties`, and
`geometry`. The `map` property is the map object where the marker will be added. The `children`
property is the style for the marker. */
export const GeoMarker = ( props ): JSX.Element => {
	const { id, coordinates, map } = props;
	return (
		<Marker
			feature={ {
				type: 'Feature',
				id,
				properties: {
					...defaultMarkerProps,
					name: 'geocoder',
					icon: 'geocoder',
					iconSize: defaultMarkerSize,
					iconColor: '#44f',
				},
				geometry: {
					type: 'Point',
					coordinates,
				},
			} }
			map={ map }
			children={ geoMarkerStyle }
		/>
	);
};

/**
 * This function initializes a map marker using a React component and adds it to a Mapbox map.
 *
 * @param id
 * @param map - mapboxgl.Map - This is an instance of the Mapbox GL JS map object on which the marker
 *            will be placed.
 * @return A mapboxgl.Marker object is being returned.
 */
const initGeomarker = ( id: number, map: mapboxgl.Map ): mapboxgl.Marker => {
	const markerRef: RefObject< HTMLDivElement > = createRef();
	// Create a new DOM root and save it to the React ref
	markerRef.current = document.createElement( 'div' );
	const root = createRoot( markerRef.current );
	// Render a Marker Component on our new DOM node
	root.render( <GeoMarker id={ id } map={ map } /> );

	// Add markers to the map.
	return new mapboxgl.Marker( markerRef.current );
};

export function initGeocoder(
	geocoderRef: React.RefObject< HTMLDivElement > | undefined,
	map: mapboxgl.Map,
	attributes: MapAttributes,
	defaults: MapboxBlockDefaults,
	listings: MapBoxListing[]
): MapboxGeocoder | undefined {
	if ( defaults.accessToken ) {
		const geocoder = new MapboxGeocoder( {
			accessToken: defaults.accessToken,
			mapboxgl: map,
			lang: defaults.language || 'en',
			placeholder: __( 'Find the nearest store' ),
			element: null,
			flyTo: {
				bearing: 0,
				// These options control the flight curve, making it move
				// slowly and zoom out almost completely before starting
				// to pan.
				speed: 0.5, // make the flying slow
				curve: 1, // change the speed at which it zooms out
				// This can be any easing function: it takes a number between
				// 0 and 1 and returns another number between 0 and 1.
				easing( t: any ) {
					return t;
				},
			},
		} );

		if ( geocoderRef )
			( geocoderRef.current as HTMLElement ).appendChild(
				geocoder.onAdd( map )
			);

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
			console.log( ev );
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

	console.log( 'No access token given to geocoder' );
}

/**
 * This is a TypeScript React function that returns a JSX element representing a geocoder marker.
 *
 * @param       props
 * @param {Ref} props.geocoderRef - The reference to the geocoder element
 */
export const GeoCoder = ( { geocoderRef } ) => {
	return <div className="geocoder" ref={ geocoderRef }></div>;
};
