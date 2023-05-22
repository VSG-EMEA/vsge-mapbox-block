import { Icon } from '@wordpress/components';
import { mapMarker } from '@wordpress/icons';
import { MapBoxListing, MapFilter, MarkerProps } from '../../types';
import mapboxgl from 'mapbox-gl';

export const ListingTag = ( props: { tag: MapFilter } ) => {
	const { id, value } = props.tag;
	return (
		<span className={ 'tag-' + id } title={ value }>
			{ value }
		</span>
	);
};

export function ListingTags( props: {
	tags: MapFilter[] | undefined;
} ): JSX.Element | null {
	const { tags } = props;
	return (
		<>
			{ tags?.map( ( tag, index: number ) => (
				<ListingTag tag={ tag } key={ index } />
			) ) }
		</>
	);
}

/**
 * This is a TypeScript React component that renders a listing based on the type of property passed in.
 *
 * @param                jsonFeature.jsonFeature
 * @param {Object}       jsonFeature
 * @param {mapboxgl.Map} jsonFeature.map
 * @param {Function}     jsonFeature.onClick
 * @return A React component that renders a listing of properties if the type is 'Feature', and
 * returns null otherwise. The listing includes the name, phone, and address of the property.
 */
export const Listing = ( {
	jsonFeature,
	map = null,
	onClick = null,
}: {
	jsonFeature: MapBoxListing;
	map?: mapboxgl.Map | null;
	onClick?: Function;
} ) => {
	const {
		properties,
		type,
	}: {
		properties: MarkerProps;
		type: any;
	} = jsonFeature;
	// TODO: replace with a better name for this

	return type === 'Feature' ? (
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
						{ properties.phone }
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
				<ListingTags tags={ properties.itemTags } />
			</div>
		</div>
	) : null;
};
