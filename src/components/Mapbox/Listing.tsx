import { ListingTag } from './MapComponents';
import { Icon } from '@wordpress/components';
import { mapMarker } from '@wordpress/icons';
import { enableListing } from '../../utils/dataset';
import { MapFilter } from '../../types';

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
 * @param {Object} Props
 * @param {Object} Props.properties The `Listing` function takes in an object with two properties: `properties` and `type`.
 * @param {Object} Props.type       properties` is of type `any` and is used to store the properties of a feature. `type` is also of
 *                                  type `any` and is used to determine if the feature is of
 * @return A React component that renders a listing of properties if the type is 'Feature', and
 * returns null otherwise. The listing includes the name, phone, and address of the property.
 */
export const Listing = ( {
	properties,
	type,
}: {
	properties: any;
	type: any;
} ) => {
	// TODO: replace with a better name for this
	const tags: MapFilter[] = properties?.company || [];
	const filter: MapFilter[] = properties?.partnership || [];

	return type === 'Feature' ? (
		<div
			className={ 'mapbox-sidebar-feature listing' }
			onClick={ ( e ) => enableListing( map, e.target ) }
		>
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
