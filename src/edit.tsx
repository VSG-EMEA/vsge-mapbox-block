import { useBlockProps } from '@wordpress/block-editor';
import { BlockAttributes, BlockEditProps } from '@wordpress/blocks';
import { MapProvider } from './components/Mapbox/MapboxContext';
import { MapEdit } from './components/Mapbox/Edit';
import { MapAttributes } from './types';

/**
 * The edit function describes the structure of your block in the context of the editor.
 *
 * @param props
 * @param props.attributes    - the block attributes
 * @param props.setAttributes - the setState function
 *
 * @param props.isSelected
 */
export default function Edit( {
	attributes,
	setAttributes,
	isSelected,
}: BlockEditProps< BlockAttributes > ): JSX.Element {
	return (
		<div { ...useBlockProps() }>
			<MapProvider attributes={ attributes as MapAttributes }>
				<MapEdit
					attributes={ attributes as MapAttributes }
					setAttributes={ setAttributes }
					isSelected={ isSelected }
				/>
			</MapProvider>
		</div>
	);
}
