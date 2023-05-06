import { Button, Icon } from '@wordpress/components';
import { enableListing } from '../../utils/dataset';
import { safeSlug } from '../../utils';
import { mapMarker } from '@wordpress/icons';

export const defaultMarkerStyle: { size: number; color: string; icon: any } = {
	icon: mapMarker,
	size: 48,
	color: 'white',
};

export function Marker( { feature, map } ): JSX.Element {
	return (
		<Button
			onClick={ ( e ) => {
				e.preventDefault();
				enableListing( map, feature );
			} }
			className={ 'marker marker-' + safeSlug( feature.properties.name ) }
			id={ 'marker-' + feature.id || 'temp' }
			data-id={ feature.id ?? 'temp' }
			data-marker-type={ feature.type }
			data-marker-name={ safeSlug( feature.properties.name ) }
		>
			<Icon
				icon={ feature.properties.icon || defaultMarkerStyle.icon }
				size={ feature.properties.size || defaultMarkerStyle.size }
				style={ {
					fill: feature.properties.color || defaultMarkerStyle.color,
				} }
			/>
		</Button>
	);
}
