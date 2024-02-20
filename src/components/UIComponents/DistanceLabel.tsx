import { __ } from '@wordpress/i18n';

export const DistanceLabel = ( {
	distance,
	label,
	className,
}: {
	distance?: number | null;
	label?: string;
	className?: string;
} ) => {
	if ( ! distance ) return null;
	return (
		<p className={ className }>
			{ label + `${ distance.toFixed( 2 ) }Km` }
		</p>
	);
};
