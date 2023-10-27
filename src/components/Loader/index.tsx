/**
 * Renders a loading indicator.
 *
 * @return {JSX.Element} The loading indicator element.
 */
function keyframes() {
	return {
		__html: '@keyframes spin { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) }}',
	};
}

/**
 * Generates a style object for a spinner component.
 *
 * @param {string} size          - The size of the spinner.
 * @param {string} stroke        - The stroke width of the spinner.
 * @param {string} color         - The color of the spinner.
 * @param {string} wrapperHeight - The height of the wrapper.
 * @return {Object} An object containing inner and outer style properties for the spinner.
 */
function style(
	size: string,
	stroke: string,
	color: string,
	wrapperHeight: string
) {
	return {
		inner: {
			animation: 'spin 0.5s linear infinite',
			height: size,
			width: size,
			border: `${ stroke } solid transparent`,
			borderTopColor: color,
			borderRadius: '100%',
			boxSize: 'border-box',
		},
		outer: {
			height: wrapperHeight || '100px',
			width: '100%',
			display: 'flex',
			flexFlow: 'column nowrap',
			justifyContent: 'center',
			alignItems: 'center',
		},
	};
}
/**
 * Generates a loading spinner component.
 *
 * @param {Object} props               - The props object.
 * @param {string} props.size          - The size of the spinner (default: '50px').
 * @param {string} props.stroke        - The stroke width of the spinner (default: '3px').
 * @param {string} props.color         - The color of the spinner (default: '#000').
 * @param          props.wrapperHeight
 * @return {JSX.Element} The loading spinner component.
 */
const Loading = ( {
	size = '50px',
	stroke = '3px',
	color = '#000',
	wrapperHeight = '100px',
}: {
	size?: string;
	stroke?: string;
	color?: string;
	wrapperHeight?: string;
} ): JSX.Element => {
	const styles = style( size, stroke, color, wrapperHeight );
	return (
		<div style={ styles.outer }>
			<div style={ styles.inner } />
			<style dangerouslySetInnerHTML={ keyframes() } />
		</div>
	);
};

export default Loading;
