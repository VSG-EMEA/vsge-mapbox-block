import { MarkerProps } from '../../types';
import { Icon } from '@wordpress/components';
import { TagList } from '../TagItem';
import { mapMarker } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { Phone } from '../UIComponents/Phone';
import { EmailAddr } from '../UIComponents/EmailAddr';
import { LinkTo } from '../UIComponents/LinkTo';
import { AddressLine } from '../UIComponents/AddressLine';

/* This code exports a React functional component called `PopupContent` that takes in a `props` object.
The component destructures the `props` object to extract the properties `itemTags`, `itemFilters`,
`name`, `description`, `address`, `city`, `postalCode`, `country`, `state`, and `website` from the
`MarkerProps` type. It then returns a JSX element that displays the extracted properties in a
specific format. The `PopupContent` component is used to render the content of a popup that appears
when a marker is clicked on a map. */
export function PopupContent( props: MarkerProps ): JSX.Element {
	const {
		itemTags,
		itemFilters,
		name = '',
		company = '',
		phone = '',
		mobile = '',
		address = '',
		city = '',
		website = '',
		emailAddress = '',
	} = props;
	return (
		<div className={ 'mapbox-popup-wrap' }>
			<TagList
				tags={ itemFilters }
				className={ 'popup-filter-list filter-list' }
			/>
			<div
				className={ 'mapbox-popup-inner' }
				style={ { display: 'flex' } }
			>
				<div>
					<Icon icon={ mapMarker } size={ 36 } />
				</div>
				<div>
					{ website ? (
						<a href={ website } className={ 'popup-website' }>
							<h3 className={ 'popup-name' }>{ name }</h3>
						</a>
					) : (
						<h3 className={ 'popup-name' }>{ name }</h3>
					) }

					<LinkTo
						websiteUri={ website }
						text={ company }
						className={ 'popup-website' }
					/>

					<AddressLine
						label={ __( 'Address', 'vsge-mapbox-block' ) }
						className={ 'popup-address' }
						address={ address }
						city={ city }
					/>

					<Phone
						phone={ phone }
						label={ __( 'Phone', 'vsge-mapbox-block' ) }
						className={ 'popup-phone' }
					/>

					<Phone
						phone={ mobile }
						label={ __( 'Mobile', 'vsge-mapbox-block' ) }
						className={ 'popup-mobile' }
					/>

					<EmailAddr
						emailAddress={ emailAddress }
						label={ __( 'Email', 'vsge-mapbox-block' ) }
						className={ 'popup-email' }
					/>

					<TagList
						tags={ itemTags }
						className={ 'popup-tag-list tag-list' }
					/>
				</div>
			</div>
		</div>
	);
}
