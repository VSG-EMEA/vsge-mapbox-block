import { Button } from '@wordpress/components';
import { enableListing } from '../../utils/dataset';
import { safeSlug } from '../../utils';
import { DefaultMarker } from './Pin';
import { MapBoxListing } from '../../types';
import { DEFAULT_COLOR } from '../../constants';
import { removePopups } from './Popup';
import type { RefObject } from 'react';

/**
 * This is a TypeScript React function that renders a marker with a button and optional children
 * components.
 *
 * @param prop          `Marker`: the name of the function being exported
 * @param prop.feature  `Feature`: the feature being rendered
 * @param prop.map      `Map`: the map being rendered
 * @param prop.children `JSX.Element`: the children of the marker
 * @param prop.mapRef
 * @return JSX element is being returned, which is a button with an onClick event and various data
 * attributes. The content of the button is either the children passed as a prop or a DefaultMarker
 * component with color and size props based on the feature properties.
 */
export function Marker( {
	feature,
	map,
	children = null,
	mapRef,
}: {
	feature: MapBoxListing;
	map: mapboxgl.Map;
	children?: JSX.Element | null;
	mapRef: RefObject< HTMLDivElement >;
} ): JSX.Element {
	const slug = safeSlug( feature.properties.name );
	function clicked() {
		removePopups( mapRef );
		enableListing( map, feature );
	}
	function dragged() {
		feature.getGeometry().setCoordinates( [ 0, 0 ] );
	}
	return (
		<Button
			onClick={ clicked }
			onDragEnd={ dragged }
			className={ 'marker marker-' + slug } // this is important to prevent duplicates
			id={ 'marker-' + feature.id || 'temp' }
			data-id={ feature.id ?? 'temp' }
			data-marker-type={ feature.type }
			data-marker-name={ slug }
		>
			{ children ?? (
				<DefaultMarker
					color={ feature.properties.iconColor || DEFAULT_COLOR }
					size={ feature.properties.iconSize as number }
				/>
			) }
		</Button>
	);
}
