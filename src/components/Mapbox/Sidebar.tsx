import { Listing } from './Listing';
import { GeoCoder } from './Geocoder';
import { Feature } from '@turf/turf';
import mapboxgl from 'mapbox-gl';
import { MountedMapsContextValue } from '../../types';
import { useContext } from '@wordpress/element';
import { MapboxContext } from './MapboxContext';

function Listings( props: { listings: Feature[] }, map: mapboxgl.Map, onClick: Function ) {
	return (
		<div className={ 'feature-listing' }>
			{ props.listings.map( ( data: any, index: number ) => (
				<Listing jsonFeature={ data } key={ index } map={ map } onClick={onClick} />
			) ) }
		</div>
	);
}

/**
 * This is a TypeScript React component that renders a Mapbox sidebar with a geocoder and a list of
 * feature listings.
 *
 * @param {Object} Props
 * @param {Object} Props.geocoderRef a reference to the geocoder component
 * @param {Object} Props.attributes  the mapboxOptions object
 * @param          Props.map
 * @return A JSX element containing a div with the id "map-sidebar" and two child components: a
 * GeoCoder component and a div with the id "feature-listing" and the class "feature-listing". The
 * GeoCoder component is conditionally rendered based on the value of the "geocoderEnabled" property in
 * the "mapboxOptions" object. The "feature-listing" div contains a map
 */
export const Sidebar = ( { attributes } ): JSX.Element => {
	const { geocoderEnabled, mapboxOptions } = attributes;
	const { geocoderRef }: MountedMapsContextValue =
		useContext( MapboxContext );

	return (
		<div className={ 'map-sidebar' }>
			{ geocoderEnabled ? (
				<GeoCoder geocoderRef={ geocoderRef } />
			) : null }
			<Listings listings={ mapboxOptions.listings } />
		</div>
	);
};
