import { areValidCoordinates } from '../Sortable/utils';
import { safeSlug } from '../../utils';
import { createRoot } from '@wordpress/element';
import { getMarkerSvg, modifySVG } from '../../utils/svg';
import { Marker } from './index';
import { DefaultMarker, PinPoint } from './marker-icons';
import { createMarkerEl } from './utils';

/**
 * This function adds a marker to a Mapbox map using a Marker Component rendered on a new DOM node.
 *
 *                                          including its geometry and properties.
 *                                          Mapbox map. It is used to add the marker to the map and set its position.
 * @param listing.listing
 * @param listing
 * @param map
 * @param mapRef
 * @param listings
 * @param markersRef
 * @param icons              - An array of MarkerIcon objects representing the icon set.
 * @param listing.listings
 * @param listing.map
 * @param listing.mapRef
 * @param listing.markersRef
 * @param listing.icons
 */
export function MapMarker( {
	listing,
	map,
	mapRef,
	markersRef,
	icons,
} ): JSX.Element {
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
		markersRef.current[ listing.id ].className =
			'marker marker-' + safeSlug( listing.properties.name );
		const root = createRoot( markersRef.current[ listing.id ] );

		let markerIcon: JSX.Element | null;

		if ( listing.properties.icon?.startsWith( 'custom-' ) ) {
			const svgMarker = getMarkerSvg( listing.properties.icon, icons );
			markerIcon = modifySVG(
				svgMarker,
				listing.properties.iconColor,
				listing.properties.iconSize
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

		const element = (
			<Marker feature={ listing } map={ map } mapRef={ mapRef }>
				{ markerIcon }
			</Marker>
		);

		createMarkerEl( markersRef.current[ listing.id ], listing, map );

		root.render( element );

		return element;
	}
}