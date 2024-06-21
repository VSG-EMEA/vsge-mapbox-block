/**
 * Function to render a distance label.
 * @param {object=}       props           - The props object
 * @param {number | null} props.distance  - the distance value
 * @param {string}        props.label     - the label to display
 * @param {string}        props.className - additional class name for styling
 * @return {JSX.Element | null} the rendered distance label or null if distance is not provided
 */
export const DistanceLabel = ( {
	distance,
	label,
	className,
}: {
	distance?: number | null;
	label?: string;
	className?: string;
} ): JSX.Element | null => {
	if ( ! distance ) {
		return null;
	}
	return (
		<p className={ 'mbb-distance-label ' + className }>
			{ label + `: ${ distance.toFixed( 2 ) }Km` }
		</p>
	);
};
