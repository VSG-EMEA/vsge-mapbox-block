import { areValidCoordinates } from '../Sortable/utils';
import { safeSlug } from '../../utils';
import { createRoot } from '@wordpress/element';
import { getMarkerSvg, modifySVG } from '../../utils/svg';
import { Marker } from './index';
import { DefaultMarker, PinPoint } from './marker-icons';
import type { RefObject } from 'react';
import { MapBoxListing, MarkerIcon } from '../../types';

/**
 * This function adds a marker to a Mapbox map using a Marker Component rendered on a new DOM node.
 *
 *                                          including its geometry and properties.
 *                                          Mapbox map. It is used to add the marker to the map and set its position.
 * @param listing
 * @param markersRef
 * @param icons      - An array of MarkerIcon objects representing the icon set.
 */
export function mapMarker(
	listing: MapBoxListing,
	markersRef: RefObject< HTMLButtonElement[] >,
	icons: MarkerIcon[]
): JSX.Element {
	// Check if the coordinates are valid
	if (
		listing?.geometry &&
		areValidCoordinates(
			listing?.geometry?.coordinates as [ number, number ]
		)
	) {
		// Render a Marker Component on our new DOM node
		markersRef.current[ listing.id ] = null;
		markersRef.current[ listing.id ] = document.createElement( 'div' );
		markersRef.current[ listing.id ].id = 'marker-' + listing.id;
		markersRef.current[ listing.id ].className = `marker-${ safeSlug(
			listing.type
		) }`;
		markersRef.current[ listing.id ].dataset.id = Number( listing.id );
		markersRef.current[ listing.id ].dataset.markerType = listing.type;
		markersRef.current[ listing.id ].dataset.markerName = safeSlug(
			listing.properties.name
		);

		const root = createRoot( markersRef.current[ listing.id ] );

		let markerIcon: JSX.Element | null;

		/**
		 * The user defined icons are prefixed with 'custom-'
		 */
		if ( listing.properties.icon?.startsWith( 'custom-' ) ) {
			let svgIcon = getMarkerSvg( listing.properties.icon, icons );
			svgIcon = modifySVG(
				svgIcon,
				listing.properties.iconColor,
				listing.properties.iconSize
			);
			markerIcon = (
				<div dangerouslySetInnerHTML={ { __html: svgIcon } } />
			);
		} else if (
			[ 'geocoder', 'pin' ].includes( listing.properties.icon )
		) {
			markerIcon = (
				<PinPoint
					color={ listing.properties.iconColor }
					size={ listing.properties.iconSize }
				/>
			);
		} else {
			markerIcon = (
				<DefaultMarker
					color={ listing.properties.iconColor }
					size={ listing.properties.iconSize }
				/>
			);
		}

		const element = <Marker feature={ listing }>{ markerIcon }</Marker>;

		root.render( element );
	}
}
