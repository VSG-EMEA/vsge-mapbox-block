import { Icon } from '@wordpress/components';
import { mapMarker } from '@wordpress/icons';
import { MapFilter } from '../../types';
import mapboxgl from 'mapbox-gl';

export const ListingTag = ( props ) => {
	const { tag, value } = props;
	return (
		<span className={ value } title={ value }>
			{ tag }
		</span>
	);
};

function ListingTags( props: { tags: MapFilter[] } ): JSX.Element | null {
	return props.tags.length ? (
		<>
			{ props.tags.map( ( tag, index ) => (
				<ListingTag { ...tag } key={ index } />
			) ) }
		</>
	) : null;
}

/**
 * This is a TypeScript React component that renders a listing based on the type of property passed in.
 *
 * @param          jsonFeature.jsonFeature
 * @param {Object} jsonFeature
 * @param          jsonFeature.map
 * @return A React component that renders a listing of properties if the type is 'Feature', and
 * returns null otherwise. The listing includes the name, phone, and address of the property.
 */
export const Listing = ( {
	jsonFeature,
	map = null,
}: {
	jsonFeature: mapboxgl.MapboxGeoJSONFeature;
	map?: mapboxgl.Map | null;
} ) => {
	const {
		properties,
		type,
	}: {
		properties: any;
		type: any;
	} = jsonFeature;
	// TODO: replace with a better name for this
	const tags: MapFilter[] = properties?.company || [];
	const filter: MapFilter[] = properties?.partnership || [];

	return type === 'Feature' ? (
		<div className={ 'mapbox-sidebar-feature listing' }>
			<Icon icon={ mapMarker } />
			<p className="partnership">
				{ properties.partnership?.join( ' ' ) }
			</p>
			<h4 className="title">{ properties.name }</h4>
			<div>
				<p>{ properties.address }</p>
				<p>
					Phone:{ ' ' }
					<a href={ properties.phone } className="email-link">
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
				<ListingTags tags={ tags } />
			</div>
		</div>
	) : null;
};
