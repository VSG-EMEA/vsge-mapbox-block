import { createRoot } from '@wordpress/element';
import type mapboxgl from 'mapbox-gl';
import type { LngLatLike } from 'mapbox-gl';
import type { MapBoxListing } from '../../types';
import { PinPoint } from './marker-icons';
import { tempMarkerStyle } from './defaults';
import { MARKER_TYPE_TEMP } from '../../constants';
import './style.scss';

type ElementRoot = ReturnType< typeof createRoot >;

export interface TempMarkerResource {
	id: number;
	marker: mapboxgl.Marker;
	root: ElementRoot;
	element: HTMLButtonElement;
	dragEndHandler: () => void;
	destroy: () => void;
	listing: MapBoxListing;
}

/**
 * Creates an explicitly owned temporary click pinpoint marker on the Mapbox map.
 *
 * @param mapbox  Mapbox GL constructor/runtime
 * @param map     Mapbox Map instance
 * @param listing Temporary marker listing data
 * @return Managed TempMarkerResource with symmetric destroy()
 */
export function createTempMarker(
	mapbox: typeof mapboxgl,
	map: mapboxgl.Map,
	listing: MapBoxListing
): TempMarkerResource {
	const button = document.createElement( 'button' );
	button.id = 'marker-' + listing.id;
	button.className = 'marker marker-temp';
	button.dataset.id = listing.id.toString();
	button.dataset.markerType = MARKER_TYPE_TEMP;
	button.dataset.markerName = 'click-marker';

	const root = createRoot( button );
	root.render(
		<PinPoint
			color={ listing.properties?.iconColor || tempMarkerStyle.color }
			size={ listing.properties?.iconSize || tempMarkerStyle.size }
		/>
	);

	const marker = new mapbox.Marker( button, {
		offset: [
			0,
			( listing?.properties?.iconSize || tempMarkerStyle.size ) * -0.5,
		],
		draggable: Boolean( listing.properties?.draggable ?? true ),
	} )
		.setLngLat( listing.geometry.coordinates as LngLatLike )
		.addTo( map );

	const dragEndHandler = () => {
		const lngLat = marker.getLngLat();
		marker.setLngLat( lngLat );
	};
	marker.on( 'dragend', dragEndHandler );

	let isDestroyed = false;
	const destroy = () => {
		if ( isDestroyed ) {
			return;
		}
		isDestroyed = true;
		marker.off( 'dragend', dragEndHandler );
		marker.remove();
		try {
			root.unmount();
		} catch {
			// Ignore if already unmounted
		}
	};

	return {
		id: listing.id,
		marker,
		root,
		element: button,
		dragEndHandler,
		destroy,
		listing,
	};
}
