import { areValidCoordinates } from '../Sortable/utils';
import { safeSlug } from '../../utils';
import { createRoot } from '@wordpress/element';
import { getMarkerSvg, modifySVG } from '../../utils/svg';
import { Marker } from './index';
import { DefaultMarker, PinPoint } from './marker-icons';
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
	markersRef: HTMLButtonElement[],
	icons: MarkerIcon[]
): void {
	// Check if the coordinates are valid
	if ( areValidCoordinates( listing?.geometry?.coordinates ) ) {
		// Render a Marker Component on our new DOM node
		markersRef[ listing.id ] = document.createElement( 'button' );
		markersRef[ listing.id ].id = 'marker-' + listing.id;
		markersRef[ listing.id ].className = `marker-${ safeSlug(
			listing.type
		) }`;
		markersRef[ listing.id ].dataset.id = listing.id.toString();
		markersRef[ listing.id ].dataset.markerType = listing.type;
		markersRef[ listing.id ].dataset.markerName = safeSlug(
			listing.properties.name
		);

		const root = createRoot( markersRef[ listing.id ] );

		let markerIcon: JSX.Element | undefined;

		/**
		 * The user defined icons are prefixed with 'custom-'
		 */
		if ( listing.properties.icon?.startsWith( 'custom-' ) ) {
			let svgIcon = getMarkerSvg( listing.properties.icon, icons );
			if ( svgIcon !== undefined ) {
				svgIcon = modifySVG(
					svgIcon,
					listing.properties.iconColor,
					listing.properties.iconSize
				);
				markerIcon = (
					<div dangerouslySetInnerHTML={ { __html: svgIcon } } />
				);
			}
		} else if (
			[ 'geocoder', 'pin' ].includes( listing.properties.icon )
		) {
			/**
			 * The GeoCoder and the ClickedPoint pin icons were thin pin marker
			 */
			markerIcon = (
				<PinPoint
					color={ listing.properties.iconColor }
					size={ listing.properties.iconSize }
				/>
			);
		}

		/**
		 * if no marker is defined, use the default one
		 */
		if ( ! markerIcon ) {
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
