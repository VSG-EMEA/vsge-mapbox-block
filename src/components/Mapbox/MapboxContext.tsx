import {
	createContext,
	useContext,
	useRef,
	useState,
} from '@wordpress/element';
import mapboxgl from 'mapbox-gl';
import { getDefaults } from '../../utils';
import { Ref } from 'react';

type MountedMapsContextValue = {
	map?: mapboxgl.Map | null;
	popupContent?: any;
	setPopupContent?: any;
	setMap?: any;
	mapRef?: Ref< HTMLDivElement >;
	geocoderRef?: Ref< HTMLDivElement >;
	defaults?: any;
};

export const MapboxContext = createContext< MountedMapsContextValue >( {} );
export const useMap = () => {
	const { map } = useContext( MapboxContext );

	if ( ! map ) {
		throw new Error( 'useMap has to be used within <Map.Provider>' );
	}

	return map;
};

export function MapProvider( { children }: { children: JSX.Element } ) {
	const [ map, setMap ] = useState( null );
	const [ geoCoder, setGeoCoder ] = useState( null );
	const [ listings, setListings ] = useState( null );
	const [ lngLat, setLngLat ] = useState( { lng: null, lat: null } );
	const [ popupContent, setPopupContent ] = useState( [] );
	const defaults = getDefaults();

	const mapRef = useRef< HTMLDivElement >( null );
	const geocoderRef = useRef< HTMLDivElement >( null );

	return (
		<MapboxContext.Provider
			value={ {
				map,
				setMap,
				popupContent,
				setPopupContent,
				lngLat,
				setLngLat,
				listings,
				setListings,
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
