import { MapBoxListing } from '../../types';
import mapboxgl from 'mapbox-gl';
import { Listing } from './Listing';

/**
 * This is a TypeScript React component that renders a list of MapBox listings with a click event
 * handler.
 *
 * @param props
 * @param props.listings An object with a property "listings" which is an array of MapBoxListing objects.
 * @param props.map      The `map` parameter is an instance of the Mapbox GL JS map object, which is used to
 *                       display and interact with the map on the web page. It is passed as a parameter to the `Listings`
 *                       component so that it can be used by the child `Listing` components to interact with the map.
 * @param props.mapRef
 * @return JSX.Element   A React component that renders a list of `Listing` components based on the `listings` prop
 *                       passed to it, along with a `map` and `onClick` function.
 */
export function Listings( props: {
	listings: MapBoxListing[];
	map: mapboxgl.Map;
	mapRef: HTMLDivElement;
} ) {
	return (
		<div className={ 'feature-listing' }>
			{ props.listings
				.filter( ( listing ) => listing.type === 'Feature' )
				.map( ( data, index: number ) => (
					<Listing
						key={ index }
						jsonFeature={ data }
						map={ props.map }
						mapRef={ props.mapRef }
					/>
				) ) }
		</div>
	);
}
