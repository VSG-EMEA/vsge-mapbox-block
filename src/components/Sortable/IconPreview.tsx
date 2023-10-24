import { MarkerIcon } from '../../types';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/components';

/**
 * Renders an icon preview based on the provided `iconID` and `iconset`.
 *
 * @param {Object}       props         - The props object containing the icon ID and iconset.
 * @param {number}       props.iconID  - The ID of the icon to be previewed.
 * @param {MarkerIcon[]} props.iconset - The array of available icons.
 * @param                props.icon
 * @return {JSX.Element} The rendered icon preview component.
 */
export function IconPreview( props: {
	icon: MarkerIcon;
	iconset: MarkerIcon[];
} ) {
	const { icon, iconset } = props;
	const iconMarkup = iconset.find( ( obj ) => obj?.id === icon?.id );
	return iconMarkup ? (
		<div
			className={ 'marker-preview' }
			dangerouslySetInnerHTML={ {
				__html: iconMarkup?.content || __( 'error 😥' ),
			} }
		/>
	) : (
		<div className={ 'marker-preview' }>
			<Icon icon={ 'marker' } size={ 24 } />
		</div>
	);
}
