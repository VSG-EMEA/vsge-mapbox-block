import { ListingTag } from './MapComponents';
import { Icon } from '@wordpress/components';

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
	const tags: { id: number; value: string }[] = properties?.company || [];
	const filter: { id: number; value: string }[] =
		properties?.partnership || [];

	return type === 'Feature' ? (
		<div className={ 'mapbox-sidebar-feature listing' }>
			<Icon icon={ 'marker' } />
			<p className="partnership">{ properties.partnership.join(" ") }</p>
			<a href="#" className="title">
				{ properties.name }
			</a>
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
				{ tags.length
					? tags.map( ( tag ) => <ListingTag { ...tag } /> )
					: null }
			</div>
		</div>
	) : null;
};
