import { safeSlug } from '../../utils';
import { DefaultMarker } from './marker-icons';
import { MapBoxListing } from '../../types';
import { DEFAULT_COLOR } from '../../constants';
import type { RefObject } from 'react';

/**
 * This is a TypeScript React function that renders a marker with a button and optional children
 * components.
 *
 * @param prop          `Marker`: the name of the function being exported
 * @param prop.feature  `Feature`: the feature being rendered
 * @param prop.children `JSX.Element`: the children of the marker
 * @return JSX element is being returned, which is a button with an onClick event and various data
 * attributes. The content of the button is either the children passed as a prop or a DefaultMarker
 * component with color and size props based on the feature properties.
 */
export function Marker( {
	feature,
	children = null,
}: {
	feature: MapBoxListing;
	children?: JSX.Element | null;
} ): JSX.Element {
	const slug = safeSlug( feature.properties.name );

	return (
		<button
			className={ 'marker marker-' + feature.id } // this is important to prevent duplicates
			id={
				feature.type !== 'temp' ? 'marker-' + feature.id : 'marker-temp'
			}
			data-id={ feature.id }
			data-marker-type={ feature.type }
			data-marker-name={ slug }
		>
			{ children ?? (
				<DefaultMarker
					color={ feature.properties.iconColor || DEFAULT_COLOR }
					size={ feature.properties.iconSize as number }
				/>
			) }
		</button>
	);
}
