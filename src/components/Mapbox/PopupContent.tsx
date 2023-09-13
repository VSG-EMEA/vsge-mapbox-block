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
		phone = '',
		address = '',
		city = '',
		postalCode = '',
		country = '',
		emailAddress = '',
		website = '',
	}: MarkerProps = props;
	return (
		<div className={ 'mapbox-popup-inner' } style={ { display: 'flex' } }>
			<div>
				<Icon icon={ mapMarker } size={ 36 } />
			</div>
			<div>
				{ itemFilters?.length ? (
					<TagList
						tags={ itemFilters }
						className={ 'popup-filter-list' }
					/>
				) : null }
				{ website && (
					<a href={ website }>
						<h3>{ name }</h3>
					</a>
				) }
				{ address && <p>{ address }</p> }
				<p>{ `${ city } - ${ country } ${ postalCode }` }</p>
				{ emailAddress || (
					<a href={ 'mailto:' + emailAddress } className={ 'email' }>
						<p>{ emailAddress }</p>
					</a>
				) }
				{ phone || (
					<a href={ 'tel:' + phone }>
						<p>{ phone }</p>
					</a>
				) }
				<TagList tags={ itemTags } className={ 'popup-tag-list' } />
			</div>
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
