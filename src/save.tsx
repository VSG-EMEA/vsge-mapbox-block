import './style/style.scss';

import { useBlockProps } from '@wordpress/block-editor';
import { BlockAttributes } from '@wordpress/blocks';
import { MapboxBlock } from './components/Mapbox';
import React from 'react';

/**
 * The save function defines the way in which the different attributes should be combined into the final markup, which is then serialized into post_content.
 *
 * @param  props
 * @param  props.attributes - the block attributes
 * @function Object() { [native code] }
 */
function Save( { attributes }: BlockAttributes ): JSX.Element {
	const blockProps = useBlockProps.save( {
		className: 'block-mapbox',
	} );
	return (
		<div { ...blockProps }>
			<MapboxBlock
				mapboxOptions={ attributes.mapboxOptions }
				innerRef={ undefined }
				geocoderRef={ undefined }
			/>
		</div>
	);
}
export default Save;
