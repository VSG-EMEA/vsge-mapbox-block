import { MarkerIcon } from '../../types';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/components';
import { getMarkerSvg } from '../../utils/svg';

/**
 * Renders an icon preview based on the provided `iconID` and `iconset`.
 *
 * @param {Object}       props          - The props object containing the icon ID and iconset.
 * @param {number}       props.iconID   - The ID of the icon to be previewed.
 * @param {MarkerIcon[]} props.iconset  - The array of available icons.
 * @param                props.icon
 * @param                props.iconName
 * @param                props.iconSet
 * @return {JSX.Element} The rendered icon preview component.
 */
export function IconPreview( props: {
	iconName: string;
	iconSet: MarkerIcon[];
} ) {
	const { iconName, iconSet } = props;
	return iconName ? (
		<div
			className={ 'marker-preview' }
			dangerouslySetInnerHTML={ {
				__html:
					getMarkerSvg( iconName, iconSet ) ??
					__( 'error 😥', 'vsge-mapbox-block' ),
			} }
		/>
	) : (
		<div className={ 'marker-preview' }>
			<Icon icon={ 'warning' } size={ 24 } />
		</div>
	);
}
