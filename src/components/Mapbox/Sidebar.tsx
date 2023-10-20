import { Listing } from './Listing';
import mapboxgl from 'mapbox-gl';
import { MapBoxListing, MountedMapsContextValue } from '../../types';
import { useContext } from '@wordpress/element';
import { MapboxContext } from './MapboxContext';
import type { RefObject } from 'react';

/**
 * This is a TypeScript React component that renders a list of MapBox listings with a click event
 * handler.
 *
 * @param props
 * @param props.listings An object with a property "listings" which is an array of MapBoxListing objects.
 * @param props.map      The `map` parameter is an instance of the Mapbox GL JS map object, which is used to
 *                       display and interact with the map on the web page. It is passed as a parameter to the `Listings`
 *                       component so that it can be used by the child `Listing` components to interact with the map.
 * @param props.mapRef
 * @return JSX.Element 	 A React component that renders a list of `Listing` components based on the `listings` prop
 *                       passed to it, along with a `map` and `onClick` function.
 */
function Listings( props: {
	listings: MapBoxListing[];
	map: mapboxgl.Map;
	mapRef: RefObject< HTMLDivElement >;
} ) {
	return (
		<div className={ 'feature-listing' }>
			{ props.listings
				.filter( ( listing ) => listing.type === 'Feature' )
				.map( ( data, index: number ) => (
					<Listing
						key={ index }
						jsonFeature={ data }
						map={ props.map }
						mapRef={ props.mapRef }
					/>
				) ) }
		</div>
	);
}

/**
 * This is a TypeScript React component that renders a Mapbox sidebar with a geocoder and a list of
 * feature listings.
 *
 * @return JSX element containing a div with the id "map-sidebar" and two child components: a
 * GeoCoder component and a div with the id "feature-listing" and the class "feature-listing". The
 * GeoCoder component is conditionally rendered based on the value of the "geocoderEnabled" property in
 * the "mapboxOptions" object. The "feature-listing" div contains a map
 */
export const Sidebar = (): JSX.Element | null => {
	const { map, mapRef, listings, filteredListings }: MountedMapsContextValue =
		useContext( MapboxContext );

	if ( ! map._mapId || ! listings || ! mapRef ) return null;

	const listingToShow = filteredListings.length ? filteredListings : listings;

	return (
		<Listings listings={ listingToShow } map={ map } mapRef={ mapRef } />
	);
};
