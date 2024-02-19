import { DefaultMarker } from './marker-icons';
import { MapBoxListing } from '../../types';
import { DEFAULT_COLOR } from '../../constants';
import './style.scss';

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
	classes = 'marker',
}: {
	feature: MapBoxListing;
	children?: JSX.Element | null;
	classes?: string;
} ): JSX.Element {
	classes = classes + ` marker-${ feature.id } ${ classes }`;
	return (
		<button
			className={ classes } // this is important to prevent duplicates
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
