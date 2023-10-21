import {
	createContext,
	useContext,
	useRef,
	useState,
} from '@wordpress/element';
import { getMapDefaults } from '../../utils';
import { MapBoxListing, MountedMapsContextValue } from '../../types';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import type { Context, RefObject } from 'react';

export const MapboxContext: Context< MountedMapsContextValue > = createContext<
	Context< MountedMapsContextValue > | undefined
>( undefined );

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
	const [ map, setMap ] = useState< mapboxgl.Map >( {} as mapboxgl.Map );
	const [ geoCoder, setGeoCoder ] = useState< MapboxGeocoder | undefined >(
		undefined
	);
	const [ lngLat, setLngLat ] = useState( [ 0, 0 ] as LngLatLike );
	const [ listings, setListings ] = useState( [] as MapBoxListing[] );
	const [ filteredListings, setFilteredListings ] = useState(
		[] as MapBoxListing[]
	);
	const [ loaded, setLoaded ] = useState( false );
	const mapDefaults = getMapDefaults();

	const mapRef: RefObject< HTMLDivElement > = useRef< HTMLDivElement | null >(
		null
	);
	const geocoderRef: RefObject< HTMLDivElement > =
		useRef< HTMLDivElement | null >( null );
	const markersRef: RefObject< HTMLButtonElement[] > = useRef<
		HTMLButtonElement[]
	>( [] );

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
				loaded,
				setLoaded,
				mapDefaults,
				mapRef,
				geoCoder,
				setGeoCoder,
				geocoderRef,
				markersRef,
			} }
		>
			{ children }
		</MapboxContext.Provider>
	);
}

/**
 * A hook to access the Mapbox context.
 *
 * @return {MapboxContext} The Mapbox context object.
 */
export function useMapboxContext() {
	const context = useContext( MapboxContext );
	if ( context === undefined ) {
		throw new Error(
			'useMapboxContext must be used within a MapboxProvider'
		);
	}
	return context;
}
