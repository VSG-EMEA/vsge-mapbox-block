import { Path, SVG } from '@wordpress/components';
import { MarkerPropsStyle } from '../../types';
import { DEFAULT_COLOR_ALT, ICON_SIZE } from '../../constants';

export const PinPoint = ( props: MarkerPropsStyle ) => {
	const { color = DEFAULT_COLOR_ALT, size = ICON_SIZE } = props;
	return (
		<SVG
			enableBackground="new 0 0 32 32"
			version="1.1"
			viewBox="0 0 32 32"
			width={ size }
			height={ size }
			xmlns="http://www.w3.org/2000/svg"
		>
			<Path
				d="M24,9c0,4.07-3.06,7.44-7,7.94V30c0,0.55-0.45,1-1,1s-1-0.45-1-1V16.94c-3.94-0.5-7-3.87-7-7.94    c0-4.41,3.59-8,8-8S24,4.59,24,9z"
				fill={ color }
			/>
		</SVG>
	);
};
