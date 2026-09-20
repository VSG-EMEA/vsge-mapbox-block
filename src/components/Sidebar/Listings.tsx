import { MapBoxListing } from '../../types';
import type mapboxgl from 'mapbox-gl';
import { Listing } from './Listing';

import type { PopupOptions, PopupResource } from '../Popup';

/**
 * This is a TypeScript React component that renders a list of MapBox listings with a click event
 * handler.
 *
 * @param props
 * @param props.listings    An object with a property "listings" which is an array of MapBoxListing objects.
 * @param props.map         The Mapbox map instance.
 * @param props.mapRef      The container element.
 * @param props.clearPopups Optional function to clear popups.
 * @param props.openPopup   Optional function to open a managed popup.
 * @return JSX.Element   A React component that renders a list of `Listing` components.
 */
export function Listings( props: {
	listings: MapBoxListing[];
	map: mapboxgl.Map;
	mapRef: HTMLDivElement;
	clearPopups?: () => void;
	openPopup?: (
		marker: MapBoxListing,
		children?: JSX.Element,
		options?: PopupOptions
	) => PopupResource | null;
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
						clearPopups={ props.clearPopups }
						openPopup={ props.openPopup }
					/>
				) ) }
		</div>
	);
}
