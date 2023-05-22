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
	const { properties } = jsonFeature;
	return (
		<div className={ 'mapbox-sidebar-feature listing' }>
			<Icon icon={ mapMarker } />
			<p className="partnership">
				{ properties.itemFilters
					?.map( ( item ) => item.value )
					.join( ' ' ) }
			</p>
			<h4 className="title">{ properties.name }</h4>
			<div>
				<p>{ properties.address }</p>
				<p>
					Phone:{ ' ' }
					<a
						href={ 'tel:' + properties.telephone }
						className="email-link"
					>
						{ properties.telephone }
					</a>
				</p>
				<p>
					<a
						href={ '//' + properties.website }
						className="website-link"
					>
						{ properties.website }
					</a>
				</p>
				<TagList tags={ properties.itemTags } />
			</div>
		</div>
	);
};
