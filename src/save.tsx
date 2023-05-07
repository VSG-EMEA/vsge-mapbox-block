import { useBlockProps } from '@wordpress/block-editor';

/**
 * The save function
 */
function Save(): JSX.Element {
	return <div { ...useBlockProps.save() } />;
}
export default Save;
