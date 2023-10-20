/* This is a functional component called `Map` that takes in two props: `attributes` and
`mapContainer`. It returns a JSX element that contains a `div` with class `map-topbar` and three
optional elements based on the values of `fitView`, `tagsEnabled`, and `filtersEnabled` properties
of the `attributes` object. It also contains a `div` with class `map` and a `ref` to the
`mapContainer` prop. The component is exported for use in other parts of the codebase. */
import { RefObject } from 'react';
import { MapMarker } from './Markers';
import { MapBoxListing, MarkerIcon } from '../../types';

export function Map( {
	map,
	mapRef,
	listings,
	markersRef,
	icons,
}: {
	map: mapboxgl.Map;
	mapRef: RefObject< HTMLDivElement >;
	listings: MapBoxListing[];
	markersRef: RefObject< HTMLDivElement >;
	icons: MarkerIcon[];
} ): JSX.Element {
	return (
		<div className={ 'map' } ref={ mapRef }>
			{ listings?.map( ( listing ) => (
				<MapMarker
					key={ listing.id }
					listing={ listing }
					map={ map }
					mapRef={ mapRef }
					markersRef={ markersRef }
					icons={ icons }
				/>
			) ) }
		</div>
	);
}
