import { MarkerProps, SearchMarkerProps } from '../../types';
import { Icon } from '@wordpress/components';
import { TagList } from './TagItem';
import { mapMarker } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { ICON_SIZE } from '../../constants';
import { layouts, svgArray } from '@mapbox/maki';

/* This code exports a React functional component called `PopupContent` that takes in a `props` object.
The component destructures the `props` object to extract the properties `itemTags`, `itemFilters`,
`name`, `description`, `address`, `city`, `postalCode`, `country`, `state`, and `website` from the
`MarkerProps` type. It then returns a JSX element that displays the extracted properties in a
specific format. The `PopupContent` component is used to render the content of a popup that appears
when a marker is clicked on a map. */
export function PopupContent( props: MarkerProps ) {
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
	} = props;
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

function getIcon( icon: string ) {
	const iconIndex = layouts.findIndex(
		( iconName: string ) => iconName === icon
	);
	return iconIndex !== -1 ? svgArray[ iconIndex ] : undefined;
}

export function SearchPopup( props: SearchMarkerProps ) {
	const {
		name = '',
		placeName = '',
		category = '',
		maki = '',
		distance = 0,
	} = props;

	const icon = getIcon( maki );

	return (
		<div
			className={ 'mapbox-popup-inner mapbox-popup-search' }
			style={ { display: 'flex' } }
		>
			<div
				style={ {
					minWidth: ICON_SIZE + 'px',
					height: ICON_SIZE + 'px',
				} }
			>
				{ icon ? (
					<span
						dangerouslySetInnerHTML={ {
							__html: icon,
						} }
					/>
				) : (
					<Icon icon={ mapMarker } size={ ICON_SIZE } />
				) }
			</div>
			<div>
				<span title={ category }>{ category }</span>
				<h3>{ name }</h3>
				{
					//<p>{placeName}</p>
				 }
				<p>
					{ __( 'distance' ) + ': ' + `${ distance.toFixed( 2 ) }Km` }
				</p>
			</div>
		</div>
	);
}
