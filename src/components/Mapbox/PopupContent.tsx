import { MarkerProps, MarkerPropsCustom } from '../../types';
import { Icon } from '@wordpress/components';
import { TagList } from './TagItem';
import { mapMarker } from '@wordpress/icons';

/* This code exports a React functional component called `PopupContent` that takes in a `props` object.
The component destructures the `props` object to extract the properties `itemTags`, `itemFilters`,
`name`, `description`, `address`, `city`, `postalCode`, `country`, `state`, and `website` from the
`MarkerProps` type. It then returns a JSX element that displays the extracted properties in a
specific format. The `PopupContent` component is used to render the content of a popup that appears
when a marker is clicked on a map. */
export function PopupContent( props ) {
	const {
		itemTags,
		itemFilters,
		name,
		description,
		address,
		city,
		postalCode,
		country,
		state,
		website,
	}: MarkerProps = props;
	return (
		<div>
			<a href={ website }>
				<Icon icon={ mapMarker } />
				{ itemFilters?.length || <h4>{ itemFilters?.join( ' ' ) }</h4> }
				<h3>{ name }</h3>
				{ address || <h4>{ address }</h4> }
				<p>
					{ description }
					<br />
					{ `${ city } ${ postalCode } ${ country } (${ state })` }
				</p>
				<TagList tags={ itemTags } />
			</a>
		</div>
	);
}

/**
 * This is a TypeScript React function that renders its children as a custom popup.
 *
 * @param {MarkerPropsCustom} - The above code is a TypeScript function component that takes in a
 *                              single parameter called `MarkerPropsCustom`. The parameter is an object that is expected to have a
 *                              property called `children`, which is of type `ReactNode`. The `children` prop is then rendered
 *                              within an empty fragment. This component is
 */
export const PopupCustom = ( { children }: MarkerPropsCustom ) => (
	<>{ children }</>
);
