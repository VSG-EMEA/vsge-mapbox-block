import {
	createContext,
	useContext,
	useRef,
	useState,
} from '@wordpress/element';
import { getMapDefaults } from '../../utils';
import {
	MapAttributes,
	MapBoxListing,
	MountedMapsContextValue,
} from '../../types';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import type { Context, MutableRefObject, RefObject } from 'react';

export const MapboxContext: Context< MountedMapsContextValue > = createContext<
	Context< MountedMapsContextValue > | undefined
>( undefined );

/**
 * This is a MapProvider component that provides a Mapbox context to its children.
 *
 * @param props            This is a functional component in React that provides a Mapbox context to its children
 *                         components. It takes in a single prop called "children" which is a JSX element representing the
 *                         child components that will have access to the Mapbox context. The component uses several state
 *                         variables to manage the Mapbox map.
 * @param props.children   This is a JSX element representing the child components that will have access to the Mapbox context.
 *
 * @param props.attributes
 * @return The `MapProvider` component is being returned, which is a context provider that wraps
 * around the `children` prop passed to it.
 */
export function MapProvider( {
	attributes,
	children,
}: {
	attributes: MapAttributes;
	children: JSX.Element;
} ) {
	const map: MutableRefObject< mapboxgl.Map | null > = useRef( null );
	const [ geoCoder, setGeoCoder ] = useState< MapboxGeocoder | undefined >(
		undefined
	);
	const [ lngLat, setLngLat ] = useState( [ 0, 0 ] as LngLatLike );
	const [ listings, setListings ] = useState(
		attributes.mapboxOptions.listings as MapBoxListing[]
	);
	const [ filteredListings, setFilteredListings ] = useState(
		[] as MapBoxListing[]
	);
	const [ loaded, setLoaded ] = useState( false );
	const mapDefaults = getMapDefaults();
	const mapIcons = attributes.mapboxOptions.icons;

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
				mapIcons,
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
