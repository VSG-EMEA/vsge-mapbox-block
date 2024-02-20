import {
	CoordinatesDef,
	MapBoxListing,
	MarkerProps,
	SearchMarkerProps,
} from '../../types';
import { Icon } from '@wordpress/components';
import { TagList } from '../TagItem';
import { mapMarker } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { ICON_SIZE, MARKER_TYPE_TEMP } from '../../constants';
import { layouts, svgArray } from '@mapbox/maki';
import { locateNearestStore } from '../../utils/spatialCalcs';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { Dispatch } from 'react';
import { removePopups, showNearestStore } from './';
import type mapboxgl from 'mapbox-gl';
import { Phone } from '../UIComponents/Phone';
import { EmailAddr } from '../UIComponents/EmailAddr';
import { DistanceLabel } from '../UIComponents/DistanceLabel';
import { Website } from '../UIComponents/Website';
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
		postalCode = '',
		countryCode = '',
		country = '',
		website = '',
		emailAddress = '',
		distance = null,
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
					<Phone
						phone={ phone }
						label={ __( 'Phone: ', 'vsge-mapbox-block' ) }
						className={ 'popup-phone' }
					/>
					<Phone
						phone={ mobile }
						label={ __( 'Mobile: ', 'vsge-mapbox-block' ) }
						className={ 'popup-mobile' }
					/>

					<AddressLine
						className={ 'popup-address' }
						address={ address }
						city={ city }
						country={ country }
						countryCode={ countryCode }
					/>

					<Website
						websiteUri={ website }
						text={ company }
						className={ 'popup-website' }
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
					<DistanceLabel
						distance={ distance }
						label={ __( 'Distance: ', 'vsge-mapbox-block' ) }
						className={ 'popup-distance-labek' }
					/>
				</div>
			</div>
		</div>
	);
}

function getIcon( icon: string ) {
	const iconIndex = layouts.findIndex(
		( iconName: string ) => iconName === icon
	);
	return iconIndex !== -1 ? svgArray[ iconIndex ] : undefined;
}

export function SearchPopup( props: SearchMarkerProps ): JSX.Element {
	const { name = '', category = '', maki = '', distance = 0 } = props;

	const icon = getIcon( maki );

	return (
		<div
			className={ 'mapbox-popup-inner mapbox-popup-search' }
			style={ { display: 'flex' } }
		>
			<div
				style={ {
					minWidth: ICON_SIZE + 'px',
					height: ICON_SIZE + 'px',
				} }
			>
				{ icon ? (
					<span
						dangerouslySetInnerHTML={ {
							__html: icon,
						} }
					/>
				) : (
					<Icon icon={ mapMarker } size={ ICON_SIZE } />
				) }
			</div>
			<div>
				<span title={ category }>{ category }</span>
				<h3>{ name }</h3>
			</div>
		</div>
	);
}

export function PinPointPopup( props: {
	map: mapboxgl.Map;
	location: CoordinatesDef;
	mapRef: HTMLDivElement;
	listings: MapBoxListing[];
	setListings: Dispatch< MapBoxListing[] >;
	setFilteredListings: Dispatch< MapBoxListing[] >;
} ): JSX.Element | null {
	const { location, map, mapRef, listings, setFilteredListings } = props;

	if ( ! mapRef ) {
		return null;
	}

	return (
		<div className={ 'mapbox-popup-inner mapbox-popup-newpin' }>
			<h3>{ __( 'My location', 'vsge-mapbox-block' ) }</h3>
			<div className={ 'mapbox-popup-newpin-buttons' }>
				<button
					onClick={ () => {
						// get the current temp pin data
						const currentPinData = listings.find( ( listing ) => {
							return listing.type === MARKER_TYPE_TEMP;
						} );
						// sort the array and get the nearest store
						const sortedNearestStores = locateNearestStore(
							location,
							listings
						);
						// create a new temp pin
						const myLocationPin: MapboxGeocoder.Result = {
							...currentPinData,
							text: __( 'My location', 'vsge-mapbox-block' ),
							place_name: __(
								'Clicked Pin',
								'vsge-mapbox-block'
							),
							geometry: {
								coordinates: location,
							},
							properties: {
								icon: 'myLocation',
							},
						};
						const sortedListings = showNearestStore(
							myLocationPin,
							sortedNearestStores,
							mapRef,
							map
						);
						setFilteredListings( [
							...( sortedListings as MapBoxListing ),
							myLocationPin,
						] );
					} }
				>
					{ __( 'Find the nearest store?', 'vsge-mapbox-block' ) }
				</button>
				<button
					onClick={ () => {
						removePopups( mapRef );
						setFilteredListings( [] );
					} }
				>
					Reset
				</button>
			</div>
		</div>
	);
}
