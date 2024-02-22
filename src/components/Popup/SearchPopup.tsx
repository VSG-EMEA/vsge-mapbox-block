import { MarkerProps } from '../../types';
import { ICON_SIZE } from '../../constants';
import { Icon } from '@wordpress/components';
import { mapMarker } from '@wordpress/icons';
import { getIcon } from './utils';

export function SearchPopup( props: MarkerProps ): JSX.Element {
	const { name = '', category = '', maki = '', distance = 0 } = props;

	const icon = getIcon( maki );

	return (
		<div
			className={ 'mapbox-popup-inner mapbox-popup-search' }
			style={ { display: 'flex' } }
		>
			<div
				style={ {
					minWidth: ICON_SIZE + 'px',
					height: ICON_SIZE + 'px',
				} }
			>
				{ icon ? (
					<span
						dangerouslySetInnerHTML={ {
							__html: icon,
						} }
					/>
				) : (
					<Icon icon={ mapMarker } size={ ICON_SIZE } />
				) }
			</div>
			<div className={ 'mapbox-popup-content' }>
				<h3 className={ 'mapbox-popup-name' }>{ name }</h3>
				<span className={ 'mapbox-popup-category' } title={ category }>
					{ category }
				</span>
			</div>
		</div>
	);
}
