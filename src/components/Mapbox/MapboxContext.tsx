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
import mapboxgl, { LngLat } from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import type { MutableRefObject } from 'react';
import { __ } from '@wordpress/i18n';

export const MapboxContext = createContext< null | MountedMapsContextValue >(
	null
);

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
	const [ lngLat, setLngLat ] = useState( { lng: 0, lat: 0 } as LngLat );
	const [ listings, setListings ] = useState(
		attributes.mapboxOptions.listings as MapBoxListing[]
	);
	const [ filteredListings, setFilteredListings ] = useState<
		MapBoxListing[] | null
	>( null );
	const [ loaded, setLoaded ] = useState( false );
	const mapDefaults = getMapDefaults();
	const mapIcons = attributes.mapboxOptions.icons;

	const mapRef = useRef< HTMLDivElement >( null );
	const geocoderRef = useRef< HTMLDivElement | null >( null );
	const markersRef = useRef< HTMLButtonElement[] >( [] );

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
	if ( context === null ) {
		throw new Error(
			__( 'useMapboxContext must be used within a MapboxProvider' )
		);
	}
	return context;
}
