import { MountedMapsContextValue } from '../../types';
import { getListing } from '../Mapbox/utils';
import { useMapboxContext } from '../Mapbox/MapboxContext';
import { __ } from '@wordpress/i18n';
import './style.scss';
import Loading from '../Loader';
import { Listings } from './Listings';

/**
 * This is a TypeScript React component that renders a Mapbox sidebar with a geocoder and a list of
 * feature listings.
 *
 * @return JSX element containing a div with the id "map-sidebar" and two child components: a
 * GeoCoder component and a div with the id "feature-listing" and the class "feature-listing". The
 * GeoCoder component is conditionally rendered based on the value of the "geocoderEnabled" property in
 * the "mapboxOptions" object. The "feature-listing" div contains a map
 */
export const Sidebar = (): JSX.Element | null => {
	const {
		map,
		mapRef,
		listings,
		filteredListings,
		loaded,
	}: MountedMapsContextValue = useMapboxContext();

	// return null if the map is not loaded
	if ( ! loaded || ! map.current || ! mapRef?.current ) return <Loading />;

	// return a message if there are no listings
	if ( ! listings )
		return (
			<div className={ 'result' }>
				<p>{ __( 'no listings found', 'vsge-mapbox-block' ) }</p>
			</div>
		);

	return (
		<Listings
			listings={ getListing( listings, filteredListings ) }
			map={ map.current }
			mapRef={ mapRef.current }
		/>
	);
};
