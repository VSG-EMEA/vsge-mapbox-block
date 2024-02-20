import { Icon } from '@wordpress/components';
import { mapMarker } from '@wordpress/icons';
import { MapBoxListing, SearchMarkerProps } from '../../types';
import mapboxgl from 'mapbox-gl';
import { TagList } from '../TagItem';
import { removePopups } from '../Popup/';
import type { MutableRefObject, RefObject } from 'react';
import { __ } from '@wordpress/i18n';
import { flyToStore } from '../../utils/view';
import { PopupContent, SearchPopup } from '../Popup/PopupContent';
import './style.scss';
import { Website } from '../UIComponents/Website';
import { Phone } from '../UIComponents/Phone';
import { AddressLine } from '../UIComponents/AddressLine';
import { EmailAddr } from '../UIComponents/EmailAddr';
import { DistanceLabel } from '../UIComponents/DistanceLabel';

/**
 * The function highlights a specific feature in a listing by adding a CSS class to it and removing the
 * class from any previously active feature.
 *
 * @param {MapBoxListing} item - The `item` parameter is of type `Feature`, which is likely an object
 *                             representing a geographic feature on a map. It may contain properties such as the feature's ID,
 *                             coordinates, and other attributes. The function `highlightListing` is using this parameter to
 *                             identify a specific feature and highlight its corresponding
 */
export function highlightListing( item: MapBoxListing ) {
	document.getElementById( 'feature-listing' )?.classList.add( 'filtered' );

	const activeItem = document.getElementsByClassName( 'active-store' );
	if ( activeItem[ 0 ] ) {
		activeItem[ 0 ].classList.remove( 'active-store' );
	}

	if ( item.properties ) {
		const listing = document.getElementById( 'marker-' + item.id );
		listing?.classList.add( 'active-store' );
	}
}

/**
 * Enables the listing feature on the map.
 *
 * @param {mapboxgl.Map}  map    - The map object.
 * @param {MapBoxListing} marker - The listing marker object.
 */
export function enableListing( map: mapboxgl.Map, marker: MapBoxListing ) {
	// 1. Fly to the point
	flyToStore( map, marker );

	const getPopupTemplate = (
		mkr: MapBoxListing
	): JSX.Element | undefined => {
		if ( mkr.type === 'Feature' ) {
			return <PopupContent { ...mkr.properties } />;
		} else if ( mkr.properties.name === 'geocoder' ) {
			return (
				<SearchPopup { ...( mkr.properties as SearchMarkerProps ) } />
			);
		}
	};

	// 2. Close all other popups and display popup for clicked store
	// addPopup( map, marker, getPopupTemplate( marker ) );

	// 3. Highlight listing in sidebar (and remove highlight for all other listings)
	highlightListing( marker );
}

/**
 * This is a TypeScript React component that renders a listing based on the type of property passed in.
 *
 * @param                p
 * @param {Object}       p.jsonFeature
 * @param {mapboxgl.Map} p.map
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
	mapRef: HTMLDivElement;
} ) => {
	const {
		properties: {
			name,
			city,
			phone,
			mobile,
			company,
			address,
			country,
			countryCode,
			postalCode = '',
			itemTags,
			itemFilters,
			emailAddress,
			website,
			distance,
		},
	} = jsonFeature;
	return (
		<div className={ 'mapbox-sidebar-feature listing' }>
			<TagList
				tags={ itemFilters }
				className={ 'sidebar-filter-list filter-list' }
			/>
			<div className="mapbox-sidebar-feature__inner">
				<Icon icon={ mapMarker } />
				<div
					role="presentation"
					onClick={ () => {
						removePopups( mapRef );
						enableListing( map, jsonFeature );
					} }
				>
					<h4 className="title">{ name }</h4>

					<Website
						websiteUri={ website }
						text={ company || website }
						className={ 'listings-company-label' }
					/>

					<Phone
						phone={ phone }
						label="Phone"
						className={ 'listings-phone-label' }
					/>

					<AddressLine
						className={ 'listings-address-label' }
						address={ address }
						city={ city }
						country={ country }
						countryCode={ countryCode }
					/>

					<EmailAddr
						emailAddress={ emailAddress }
						label={ __( 'Email', 'vsge-mapbox-block' ) }
						className={ 'listings-email-label' }
					/>

					<DistanceLabel
						distance={ distance }
						label={ __( 'Distance: ', 'vsge-mapbox-block' ) }
						className={ 'store-distance' }
					/>

					{ itemTags?.length ? (
						<>
							<TagList
								tags={ itemTags }
								className={
									'listings-tag sidebar-tag-list tag-list'
								}
							/>
						</>
					) : null }
				</div>
			</div>
		</div>
	);
};
