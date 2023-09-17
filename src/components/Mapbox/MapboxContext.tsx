import {
	createContext,
	useContext,
	useRef,
	useState,
} from '@wordpress/element';
import { getMapDefaults } from '../../utils';
// eslint-disable-next-line import/no-extraneous-dependencies
import { RefObject } from 'react';
import { MapBoxListing, MountedMapsContextValue } from '../../types';
import mapboxgl, { LngLat, LngLatLike } from 'mapbox-gl';

export const MapboxContext = createContext< MountedMapsContextValue >(
	{} as MountedMapsContextValue
);

/**
 * This is a MapProvider component that provides a Mapbox context to its children.
 *
 * @param props          This is a functional component in React that provides a Mapbox context to its children
 *                       components. It takes in a single prop called "children" which is a JSX element representing the
 *                       child components that will have access to the Mapbox context. The component uses several state
 *                       variables to manage the Mapbox map.
 * @param props.children This is a JSX element representing the child components that will have access to the Mapbox context.
 *
 * @return The `MapProvider` component is being returned, which is a context provider that wraps
 * around the `children` prop passed to it. The context value being provided includes state variables
 * and functions related to the Mapbox map, such as `map`, `setMap`, `lngLat`, `setLngLat`, `listings`,
 * `setListings`, `markers`, `setMarkers`, `map
 */
export function MapProvider( { children }: { children: JSX.Element } ) {
	const [ map, setMap ] = useState< mapboxgl.Map | null >( null );
	const [ geoCoder, setGeoCoder ] = useState( null );
	const [ lngLat, setLngLat ] = useState( [ 0, 0 ] as LngLatLike );
	const [ listings, setListings ] = useState( [] as MapBoxListing[] );
	const [ filteredListings, setFilteredListings ] = useState( null );
	const mapDefaults = getMapDefaults();

	const mapRef: RefObject< HTMLDivElement > = useRef< HTMLDivElement | null >(
		null
	);
	const geocoderRef: RefObject< HTMLDivElement > =
		useRef< HTMLDivElement | null >( null );

	return (
		<MapboxContext.Provider
			value={ {
				map,
				setMap,
				lngLat,
				setLngLat,
				listings,
				setListings,
				filteredListings,
				setFilteredListings,
				mapDefaults,
				mapRef,
				geoCoder,
				setGeoCoder,
				geocoderRef,
			} }
		>
			{ children }
		</MapboxContext.Provider>
	);
}

export const useMap = () => {
	const { map } = useContext( MapboxContext );

	if ( ! map ) {
		throw new Error( 'useMap has to be used within <MapProvider>' );
	}

	return map;
};
