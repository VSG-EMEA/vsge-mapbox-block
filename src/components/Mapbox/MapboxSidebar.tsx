import { Listing } from './Listing';
import GeoCoder from './Geocoder';

export const MapboxSidebar = ( {
	geocoderRef = null,
	mapboxOptions,
	map,
	defaults,
} ): JSX.Element => {
	return (
		<div id="map-sidebar">
			{ mapboxOptions.geocoderEnabled === true && defaults ? (
				<GeoCoder
					defaults={ defaults }
					geocoderRef={ geocoderRef }
					mapboxgl={ map }
					listings={ mapboxOptions.listings }
				/>
			) : null }
			<div id="feature-listing" className="feature-listing">
				{ mapboxOptions.listings.map( ( data: any, index: number ) => (
					<Listing { ...data } key={ index } />
				) ) }
			</div>
		</div>
	);
};
