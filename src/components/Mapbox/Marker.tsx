import { Button, Icon, Path, SVG } from '@wordpress/components';
import { enableListing } from '../../utils/dataset';
import { safeSlug } from '../../utils';
import { DefaultMarker } from './Pin';

export function Marker( { feature, map, children = undefined } ): JSX.Element {
	return (
		<Button
			onClick={ ( e ) => {
				enableListing( map, feature );
			} }
			className={ 'marker marker-' + safeSlug( feature.properties.name ) } // this is important to prevent duplicates
			id={ 'marker-' + feature.id || 'temp' }
			data-id={ feature.id ?? 'temp' }
			data-marker-type={ feature.type }
			data-marker-name={ safeSlug( feature.properties.name ) }
		>
			{ children || (
				<DefaultMarker
					color={ feature.properties.iconColor }
					size={ feature.properties.iconSize as number }
				/>
			) }
		</Button>
	);
}
