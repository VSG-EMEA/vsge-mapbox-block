import { Path, SVG } from '@wordpress/components';

/* This code exports a React component called `DefaultMarker` that renders an SVG image of a marker
with a default color of red and size of 48. The component takes in an optional `props` object with a
`color` and `size` property that can be used to customize the color and size of the marker. The SVG
image is defined using the `Path` and `SVG` components from the `@wordpress/components` library. */
export const DefaultMarker = (
	props: {
		color: string;
		size: number;
		children?: JSX.Element;
	} = { color: '#f00', size: 48 }
) => (
	<>
		{ props.children ?? (
			<SVG
				xmlns="http://www.w3.org/2000/svg"
				xmlSpace="preserve"
				viewBox="0 0 365 560"
				width={ props.size }
				height={ props.size }
			>
				<Path
					fill={ props.color }
					d="M182.9 551.7c0 .1.2.3.2.3s175.2-269 175.2-357.4c0-130.1-88.8-186.7-175.4-186.9C96.3 7.9 7.5 64.5 7.5 194.6 7.5 283 182.8 552 182.8 552l.1-.3zm-60.7-364.5c0-33.6 27.2-60.8 60.8-60.8 33.6 0 60.8 27.2 60.8 60.8S216.5 248 182.9 248c-33.5 0-60.7-27.2-60.7-60.8z"
				/>
			</SVG>
		) }
	</>
);
