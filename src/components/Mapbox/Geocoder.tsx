import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

/**
 * This is a TypeScript React function that returns a JSX element representing a geocoder marker.
 *
 * @param geocoderRef.geocoderRef
 * @param geocoderRef
 */
export const GeoCoder = ( { geocoderRef } ) => {
	return <div className="geocoder" ref={ geocoderRef }></div>;
};
