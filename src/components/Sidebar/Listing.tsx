import { Icon } from '@wordpress/components';
import { mapMarker } from '@wordpress/icons';
import { MapBoxListing } from '../../types';
import mapboxgl from 'mapbox-gl';
import { TagList } from '../TagItem';
import { enableListing } from '../../utils/dataset';
import { removePopups } from '../Popup/Popup';
import { RefObject } from 'react';

/**
 * This is a TypeScript React component that renders a listing based on the type of property passed in.
 *
 * @param                p
 * @param {Object}       p.jsonFeature
 * @param {mapboxgl.Map} p.map
 * @param                p.listings
 * @return A React component that renders a listing of properties if the type is 'Feature', and
 * returns null otherwise. The listing includes the name, phone, and address of the property.
 */
export const Listing = ( {
	jsonFeature,
	map,
	mapRef,
}: {
	jsonFeature: MapBoxListing;
	map: mapboxgl.Map;
	mapRef: RefObject< HTMLDivElement >;
} ) => {
	const {
		properties: {
			name,
			phone,
			city,
			country,
			countryCode,
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
			<div
				role="presentation"
				onClick={ () => {
					removePopups( mapRef );
					enableListing( map, jsonFeature );
				} }
			>
				<TagList
					tags={ itemFilters }
					className={ 'sidebar-filter-list' }
				/>
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

				<p>
					{ address && address }
					<br />
					{ country && country } - { city && city } ({ countryCode })
				</p>

				{ website && (
					<p>
						Website:{ ' ' }
						<a href={ '//' + website } className="website-link">
							{ website }
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
