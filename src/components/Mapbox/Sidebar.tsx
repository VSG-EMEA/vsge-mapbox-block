import { Listing } from './Listing';
import { GeoCoder } from './Geocoder';
import mapboxgl from 'mapbox-gl';
import { MapBoxListing, MountedMapsContextValue } from '../../types';
import { useContext } from '@wordpress/element';
import { MapboxContext } from './MapboxContext';

/**
 * This is a TypeScript React component that renders a list of MapBox listings with a click event
 * handler.
 *
 * @param props
 * @param props.listings An object with a property "listings" which is an array of MapBoxListing objects.
 * @param props.map      The `map` parameter is an instance of the Mapbox GL JS map object, which is used to
 *                       display and interact with the map on the web page. It is passed as a parameter to the `Listings`
 *                       component so that it can be used by the child `Listing` components to interact with the map.
 * @return JSX.Element 	 A React component that renders a list of `Listing` components based on the `listings` prop
 *                       passed to it, along with a `map` and `onClick` function.
 */
function Listings( props: { listings: MapBoxListing[]; map: mapboxgl.Map } ) {
	return (
		<div className={ 'feature-listing' }>
			{ props.listings.map( ( data, index: number ) => (
				<Listing key={ index } jsonFeature={ data } map={ props.map } />
			) ) }
		</div>
	);
}

/**
 * This is a TypeScript React component that renders a Mapbox sidebar with a geocoder and a list of
 * feature listings.
 *
 * @param {Object} Props
 * @param {Object} Props.attributes the mapboxOptions object
 *
 * @return A JSX element containing a div with the id "map-sidebar" and two child components: a
 * GeoCoder component and a div with the id "feature-listing" and the class "feature-listing". The
 * GeoCoder component is conditionally rendered based on the value of the "geocoderEnabled" property in
 * the "mapboxOptions" object. The "feature-listing" div contains a map
 */
export const Sidebar = ( { attributes } ): JSX.Element => {
	const { geocoderEnabled, mapboxOptions } = attributes;
	const { geocoderRef, map }: MountedMapsContextValue =
		useContext( MapboxContext );

	return (
		<div className={ 'map-sidebar' }>
			{ geocoderEnabled ? (
				<GeoCoder geocoderRef={ geocoderRef } />
			) : null }
			<Listings listings={ mapboxOptions.listings } map={ map } />
		</div>
	);
};
