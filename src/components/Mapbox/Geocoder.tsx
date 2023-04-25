/**
 * This is a TypeScript React function that returns a JSX element representing a geocoder marker.
 *
 * @param props
 * @param {Ref} props.geocoderRef - The reference to the geocoder element
 */
export const GeoCoder = ( { geocoderRef } ) => {
	return <div className="geocoder" ref={ geocoderRef }></div>;
};
