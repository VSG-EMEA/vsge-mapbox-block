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
import { RefObject } from 'react';
import { removePopups, showNearestStore } from './';
import type mapboxgl from 'mapbox-gl';

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
					{ phone && (
						<p className={ 'popup-phone' }>
							<a href={ 'tel:' + phone }>
								{ __( 'Phone: ', 'vsge-mapbox-block' ) + phone }
							</a>
						</p>
					) }
					{ mobile && (
						<p className={ 'popup-phone' }>
							<a href={ 'tel:' + mobile }>
								{ __( 'Mobile: ', 'vsge-mapbox-block' ) +
									mobile }
							</a>
						</p>
					) }

					<p>
						{ address && address }
						<br />
						{ country && country } { city && city }{ ' ' }
						{ countryCode && '(' + countryCode + ')' }
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

					<TagList
						tags={ itemTags }
						className={ 'popup-tag-list tag-list' }
					/>
					{ !! distance && (
						<p>
							{ __( 'Distance: ', 'vsge-mapbox-block' ) +
								`${ distance.toFixed( 2 ) }Km` }
						</p>
					) }
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
	map: RefObject< mapboxgl.Map | null >;
	location: CoordinatesDef;
	mapRef: RefObject< HTMLDivElement >;
	listings: MapBoxListing[];
	setListings: ( listings: MapBoxListing[] ) => void;
	setFilteredListings: ( listings: MapBoxListing[] ) => void;
} ): JSX.Element {
	const { location, map, mapRef, listings, setFilteredListings } = props;

	if ( ! map.current ) {
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
						const myLocationPin = {
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
							myLocationPin as unknown as MapboxGeocoder.Result,
							sortedNearestStores,
							mapRef as RefObject< HTMLDivElement >,
							map
						);
						setFilteredListings( [
							...sortedListings,
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
