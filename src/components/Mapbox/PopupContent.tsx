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
		name = '',
		description = '',
		telephone = '',
		address = '',
		city = '',
		postalCode = '',
		country = '',
		state = '',
		emailAddress = '',
		website = '',
	}: MarkerProps = props;
	return (
		<div>
			<Icon icon={ mapMarker } />
			{ itemFilters?.length || (
				<TagList
					tags={ itemFilters }
					className={ 'popup-filter-list' }
				/>
			) }
			<a href={ website }>
				<h3>{ name }</h3>
				<p>{ address }</p>
			</a>
			<p>{ description }</p>
			<p>{ `${ city } ${ postalCode } ${ country } ${ state }` }</p>
			{ emailAddress || (
				<a href={ 'mailto:' + emailAddress } className={ 'email' }>
					<p>{ emailAddress }</p>
				</a>
			) }
			{ telephone || (
				<a href={ 'tel:' + telephone }>
					<p>{ telephone }</p>
				</a>
			) }
			<TagList tags={ itemTags } className={ 'popup-tag-list' } />
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
