import {
	createContext,
	useContext,
	useRef,
	useState,
} from '@wordpress/element';
import { getDefaults } from '../../utils';
// eslint-disable-next-line import/no-extraneous-dependencies
import { RefObject } from 'react';
import { MountedMapsContextValue } from '../../types';
import mapboxgl from 'mapbox-gl';

export const MapboxContext = createContext< MountedMapsContextValue >(
	{} as MountedMapsContextValue
);
export const useMap = () => {
	const { map } = useContext( MapboxContext );

	if ( ! map ) {
		throw new Error( 'useMap has to be used within <MapProvider>' );
	}

	return map;
};

export function MapProvider( { children }: { children: JSX.Element } ) {
	const [ map, setMap ] = useState( null );
	const [ geoCoder, setGeoCoder ] = useState( null );
	const [ listings, setListings ] = useState( null );
	const [ lngLat, setLngLat ] = useState( [ 0, 0 ] );
	const [ markers, setMarkers ] = useState(
		[] as mapboxgl.MapboxGeoJSONFeature[]
	);
	const defaults = getDefaults();

	const mapRef: RefObject< HTMLDivElement > =
		useRef< HTMLDivElement >( null );
	const geocoderRef: RefObject< HTMLDivElement > =
		useRef< HTMLDivElement >( null );

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
				defaults,
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
