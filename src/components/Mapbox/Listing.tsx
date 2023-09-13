import { Icon } from '@wordpress/components';
import { mapMarker } from '@wordpress/icons';
import { MapBoxListing, MarkerProps } from '../../types';
import mapboxgl from 'mapbox-gl';
import { TagList } from './TagItem';

/**
 * This is a TypeScript React component that renders a listing based on the type of property passed in.
 *
 * @param {Object}       jsonFeature
 * @param {Object}       jsonFeature.jsonFeature
 * @param {mapboxgl.Map} jsonFeature.map
 * @param {Function}     jsonFeature.onClick
 * @return A React component that renders a listing of properties if the type is 'Feature', and
 * returns null otherwise. The listing includes the name, phone, and address of the property.
 */
export const Listing = ( {
	jsonFeature,
}: {
	jsonFeature: MapBoxListing;
	map?: mapboxgl.Map | null;
	onClick?: Function;
} ) => {
	const {
		properties: {
			name,
			phone,
			address,
			itemTags,
			itemFilters,
			emailAddress,
			website,
		},
	} = jsonFeature;
	return (
		<div className={ 'mapbox-sidebar-feature listing' }>
			<Icon icon={ mapMarker } />
			<div>
				<TagList tags={ itemFilters } className={ 'sidebar-filter-list' } />
				<h4 className="title">{ name }</h4>
				{ address && <p>{ address }</p> }
				{ phone && (
					<p>
						Phone:{ ' ' }
						<a href={ 'tel:' + phone } className="email-link">
							{ phone }
						</a>
					</p>
				) }
				{ emailAddress && (
					<p>
						Email:{ ' ' }
						<a
							href={ 'mailto:' + emailAddress }
							className="email-link"
						>
							{ emailAddress }
						</a>
					</p>
				) }
				{ website && (
					<p>
						Website:{ ' ' }
						<a href={ '//' + website } className="website-link">
							{ website }
						</a>
					</p>
				) }
				{ itemTags?.length ? (
					<>
						<TagList
							tags={ itemTags }
							className={ 'sidebar-tag-list' }
						/>
					</>
				) : null }
			</div>
		</div>
	);
};
