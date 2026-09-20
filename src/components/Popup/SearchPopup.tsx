import { useEffect, useState } from '@wordpress/element';
import { MarkerProps } from '../../types';
import { ICON_SIZE } from '../../constants';
import { Icon } from '@wordpress/components';
import { mapMarker } from '@wordpress/icons';
import { getMakiSvg } from '../../utils/maki';

export function SearchPopup( props: MarkerProps ): JSX.Element {
	const { name = '', category = '', maki = '', distance = 0 } = props;
	const [ iconSvg, setIconSvg ] = useState< string | null >( null );

	useEffect( () => {
		let cancelled = false;
		if ( maki ) {
			getMakiSvg( maki ).then( ( svg ) => {
				if ( ! cancelled && svg ) {
					setIconSvg( svg );
				}
			} );
		}
		return () => {
			cancelled = true;
		};
	}, [ maki ] );

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
				{ iconSvg ? (
					<span
						dangerouslySetInnerHTML={ {
							__html: iconSvg,
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
