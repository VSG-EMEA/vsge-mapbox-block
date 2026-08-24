import type { BlockEditProps } from '@wordpress/blocks';
import { MapEdit } from './components/Edit/Edit';
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
}: BlockEditProps ): JSX.Element {
	return (
		<MapEdit
			attributes={ attributes as MapAttributes }
			setAttributes={
				setAttributes as ( updates: Partial< MapAttributes > ) => void
			}
			isSelected={ isSelected }
		/>
	);
}
