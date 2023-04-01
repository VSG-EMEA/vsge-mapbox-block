import { Listing } from './Listing';
import GeoCoder from './Geocoder';

export const MapboxSidebar = ( {
	geocoderEnabled,
	geocoderRef,
	listings,
	map,
} ): JSX.Element => {
	return (
		<div id="map-sidebar">
			{ geocoderEnabled === true ? (
				<GeoCoder
					geocoderRef={ geocoderRef }
					mapboxgl={ map }
					listings={ listings }
				/>
			) : null }
			<div id="feature-listing" className="feature-listing">
				{ listings.map( ( data: any, index: number ) => (
					<Listing { ...data } key={ index } />
				) ) }
			</div>
		</div>
	);
};
