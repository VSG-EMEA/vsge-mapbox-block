import { Button } from '@wordpress/components';
import { enableListing } from '../../utils/dataset';
import { safeSlug } from '../../utils';
import { DefaultMarker } from './Pin';
import { MapBoxListing, MountedMapsContextValue } from '../../types';
import { useContext } from '@wordpress/element';
import { MapboxContext } from './MapboxContext';
import { DEFAULT_COLOR } from '../../constants';
import { removePopups } from './Popup';
import { getMarkerData } from './utils';

function updateFeature( feature: MapBoxListing, listings ) {
	feature.getGeometry().setCoordinates( [ 0, 0 ] );
	const markerData = getMarkerData( feature.id, listings );
}

/**
 * This is a TypeScript React function that renders a marker with a button and optional children
 * components.
 *
 * @param prop          `Marker`: the name of the function being exported
 * @param prop.feature  `Feature`: the feature being rendered
 * @param prop.map      `Map`: the map being rendered
 * @param prop.children `JSX.Element`: the children of the marker
 * @return JSX element is being returned, which is a button with an onClick event and various data
 * attributes. The content of the button is either the children passed as a prop or a DefaultMarker
 * component with color and size props based on the feature properties.
 */
export function Marker( {
	feature,
	map,
	children = undefined,
}: {
	feature: MapBoxListing;
	map: mapboxgl.Map;
	children?: JSX.Element;
} ): JSX.Element {
	const { mapRef, listings }: MountedMapsContextValue = useContext( MapboxContext );
	return (
		<Button
			onClick={ () => {
				removePopups( mapRef );
				enableListing( map, feature );
			} }
			onDragEnd={ () => {
				updateFeature( feature, listings );
			} }
			className={ 'marker marker-' + safeSlug( feature.type ) } // this is important to prevent duplicates
			id={ 'marker-' + feature.id || 'temp' }
			data-id={ feature.id ?? 'temp' }
			data-marker-type={ feature.type }
			data-marker-name={ safeSlug( feature.properties.name ) }
		>
			{ children ? (
				children
			) : (
				<DefaultMarker
					color={ feature.properties.iconColor || DEFAULT_COLOR }
					size={ feature.properties.iconSize as number }
				/>
			) }
		</Button>
	);
}
