import { Listing } from './Listing';
import GeoCoder from './Geocoder';

/**
 * This is a TypeScript React component that renders a Mapbox sidebar with a geocoder and a list of
 * feature listings.
 *
 * @param {Object}       Props
 * @param {Object}       Props.geocoderRef   a reference to the geocoder component
 * @param {Object}       Props.mapboxOptions the mapboxOptions object
 * @param {mapboxgl.Map} Props.map           the map object
 * @param {Object}       Props.defaults      the plugin defaults object
 * @return A JSX element containing a div with the id "map-sidebar" and two child components: a
 * GeoCoder component and a div with the id "feature-listing" and the class "feature-listing". The
 * GeoCoder component is conditionally rendered based on the value of the "geocoderEnabled" property in
 * the "mapboxOptions" object. The "feature-listing" div contains a map
 */
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
