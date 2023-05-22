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
import mapboxgl from 'mapbox-gl';

export const MapboxContext = createContext< MountedMapsContextValue >(
	{} as MountedMapsContextValue
);

export function MapProvider( { children }: { children: JSX.Element } ) {
	const [ map, setMap ] = useState( null );
	const [ geoCoder, setGeoCoder ] = useState( null );
	const [ listings, setListings ] = useState( null );
	const [ lngLat, setLngLat ] = useState( [ 0, 0 ] );
	const [ markers, setMarkers ] = useState( [] as MapBoxListing[] );
	const mapDefaults = getMapDefaults();

	const mapRef: RefObject< HTMLDivElement > = useRef< HTMLDivElement >();
	const geocoderRef: RefObject< HTMLDivElement > = useRef< HTMLDivElement >();

	return (
		<MapboxContext.Provider
			value={ {
				map,
				setMap,
				lngLat,
				setLngLat,
				listings,
				setListings,
				markers,
				setMarkers,
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
