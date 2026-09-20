import { Icon } from '@wordpress/components';
import { mapMarker } from '@wordpress/icons';
import { MapBoxListing } from '../../types';
import type mapboxgl from 'mapbox-gl';
import { TagList } from '../TagItem';
import { removePopups } from '../Popup/';
import { __ } from '@wordpress/i18n';
import { flyToStore } from '../../utils/view';
import './style.scss';
import { LinkTo } from '../UIComponents/LinkTo';
import { Phone } from '../UIComponents/Phone';
import { AddressLine } from '../UIComponents/AddressLine';
import { EmailAddr } from '../UIComponents/EmailAddr';
import { DistanceLabel } from '../UIComponents/DistanceLabel';

import { useMapboxContext } from '../Mapbox/MapboxContext';

/**
 * The function highlights a specific feature in a listing by adding a CSS class to it and removing the
 * class from any previously active feature within the scoped map wrapper.
 *
 * @param {MapBoxListing}       item    - The listing feature.
 * @param {HTMLElement | null}  scopeEl - The container element to scope queries within.
 */
export function highlightListing(
	item: MapBoxListing,
	scopeEl?: HTMLElement | null
) {
	const wrapper =
		scopeEl?.closest( '.map-wrapper' ) ||
		( scopeEl?.classList?.contains( 'map-wrapper' ) ? scopeEl : null ) ||
		scopeEl ||
		document;

	wrapper.querySelector( '.feature-listing' )?.classList.add( 'filtered' );

	const activeItems = wrapper.querySelectorAll( '.active-store' );
	activeItems.forEach( ( el ) => el.classList.remove( 'active-store' ) );

	if ( item.properties ) {
		const listing =
			wrapper.querySelector(
				`.mapbox-sidebar-feature[data-dealer-id="${ item.id }"], .mapbox-sidebar-feature[data-id="${ item.id }"]`
			) || wrapper.querySelector( `[data-id="${ item.id }"]` );
		listing?.classList.add( 'active-store' );
	}
}

/**
 * Enables the listing feature on the map.
 * @param {mapboxgl.Map}        map     - The map object.
 * @param {MapBoxListing}       marker  - The listing marker object.
 * @param {HTMLElement | null}  scopeEl - Optional container element to scope queries within.
 */
export function enableListing(
	map: mapboxgl.Map,
	marker: MapBoxListing,
	scopeEl?: HTMLElement | null
) {
	// 1. Fly to the point
	flyToStore( map, marker );

	// 2. Highlight listing in the sidebar (and remove highlight for all other listings)
	const container =
		scopeEl || ( map?.getContainer ? map.getContainer() : null );
	highlightListing( marker, container );
}

/**
 * This is a TypeScript React component that renders a listing based on the type of property passed in.
 *
 * @param                p
 * @param {Object}       p.jsonFeature
 * @param {mapboxgl.Map} p.map
 * @param {HTMLDivElement} p.mapRef
 * @param {() => void}   [p.clearPopups]
 * @return A React component that renders a listing of properties if the type is 'Feature', and
 * returns null otherwise. The listing includes the name, phone, and address of the property.
 */
import type { PopupOptions, PopupResource } from '../Popup';

export const Listing = ( {
	jsonFeature,
	map,
	mapRef,
	clearPopups,
	openPopup,
}: {
	jsonFeature: MapBoxListing;
	map: mapboxgl.Map;
	mapRef: HTMLDivElement;
	clearPopups?: () => void;
	openPopup?: (
		marker: MapBoxListing,
		children?: JSX.Element,
		options?: PopupOptions
	) => PopupResource | null;
} ) => {
	const { selectedDealerId, setSelectedDealerId, distanceReference } =
		useMapboxContext();
	const isSelected = selectedDealerId === jsonFeature.id;

	const handleSelectDealer = (
		e?: React.SyntheticEvent,
		customTarget?: HTMLElement | null
	) => {
		if ( clearPopups ) {
			clearPopups();
		} else {
			removePopups( mapRef );
		}
		setSelectedDealerId( jsonFeature.id );
		flyToStore( map, jsonFeature );

		if ( openPopup ) {
			const returnFocusTarget =
				customTarget ||
				( ( e?.currentTarget || e?.target ) as HTMLElement | null );
			openPopup( jsonFeature, undefined, {
				origin: 'sidebar',
				returnFocusTarget,
			} );
		}
	};

	const handleCardClick = ( e: React.MouseEvent< HTMLDivElement > ) => {
		const target = e.target as HTMLElement | null;
		// If click originated from or inside an interactive descendant, do not trigger card selection
		if (
			target?.closest(
				'a, button, input, select, textarea, [role="button"]'
			)
		) {
			return;
		}
		const titleBtn = e.currentTarget.querySelector< HTMLButtonElement >(
			'.mapbox-sidebar-feature__title-btn'
		);
		handleSelectDealer( e, titleBtn );
	};

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
		<div
			className={ `mapbox-sidebar-feature listing${
				isSelected ? ' active-store' : ''
			}` }
			data-id={ jsonFeature.id }
			data-dealer-id={ jsonFeature.id }
			id={ 'listing-' + jsonFeature.id }
			onClick={ handleCardClick }
		>
			<TagList
				tags={ itemFilters }
				className={ 'sidebar-filter-list filter-list' }
			/>
			<div className="mapbox-sidebar-feature__inner">
				<div aria-hidden="true">
					<Icon icon={ mapMarker } />
				</div>
				<div className="mapbox-sidebar-feature__details">
					<h4 className="title">
						<button
							type="button"
							className="mapbox-sidebar-feature__title-btn"
							aria-current={ isSelected ? 'true' : undefined }
							onClick={ ( e ) => {
								e.stopPropagation();
								handleSelectDealer( e );
							} }
						>
							{ name }
						</button>
					</h4>

					<LinkTo
						websiteUri={ website }
						text={ company || website }
						className={ 'listings-company-link' }
					/>

					<AddressLine
						label={ __( 'Address', 'vsge-mapbox-block' ) }
						className={ 'listings-address-label' }
						address={ address }
						city={ city }
						country={ country }
						countryCode={ countryCode }
						postalCode={ postalCode }
					/>

					<Phone
						phone={ phone }
						label={ __( 'Phone', 'vsge-mapbox-block' ) }
						className={ 'listings-phone-label' }
					/>

					<Phone
						phone={ mobile }
						label={ __( 'Mobile', 'vsge-mapbox-block' ) }
						className={ 'listings-mobile-label' }
					/>

					<EmailAddr
						emailAddress={ emailAddress }
						label={ __( 'Email', 'vsge-mapbox-block' ) }
						className={ 'listings-email-label' }
					/>

					{ distanceReference !== null &&
						typeof distance === 'number' &&
						Number.isFinite( distance ) && (
							<DistanceLabel
								distance={ distance }
								label={ __( 'Distance', 'vsge-mapbox-block' ) }
								className={ 'store-distance' }
							/>
						) }

					<TagList
						tags={ itemTags }
						className={ 'listings-tag sidebar-tag-list tag-list' }
					/>
				</div>
			</div>
		</div>
	);
};
