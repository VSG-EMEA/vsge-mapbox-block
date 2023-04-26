import {
	createContext,
	useContext,
	useRef,
	useState,
} from '@wordpress/element';
import { getDefaults } from '../../utils';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MutableRefObject } from 'react';
import { MountedMapsContextValue } from '../../types';

export const MapboxContext = createContext< MountedMapsContextValue >( {} );
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
	const [ lngLat, setLngLat ] = useState( { lng: null, lat: null } );
	const [ popupContent, setPopupContent ] = useState( [] );
	const defaults = getDefaults();

	const mapRef: MutableRefObject< HTMLDivElement | null > =
		useRef< HTMLDivElement >( null );
	const geocoderRef: MutableRefObject< HTMLDivElement | null > =
		useRef< HTMLDivElement >( null );

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
