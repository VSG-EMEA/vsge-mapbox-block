import { useMapboxContext } from '../Mapbox/MapboxContext';
import type { MountedMapsContextValue } from '../../types';

/**
 * This is a TypeScript React function that returns a JSX element representing a geocoder marker.
 */
export const GeoCoder = () => {
	const { geocoderRef }: MountedMapsContextValue = useMapboxContext();
	return <div className="geocoder" ref={ geocoderRef }></div>;
};
