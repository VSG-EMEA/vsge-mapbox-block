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
import { showNearestStore } from './Popup';
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
		address = '',
		city = '',
		postalCode = '',
        countryCode = '',
		country = '',
		emailAddress = '',
		website = '',
		distance = null,
	} = props;
	return (
		<div className={ 'mapbox-popup-inner' } style={ { display: 'flex' } }>
			<div>
				<Icon icon={ mapMarker } size={ 36 } />
			</div>
			<div>
				{ itemFilters?.length ? (
					<TagList
						tags={ itemFilters }
						className={ 'popup-filter-list' }
					/>
				) : null }
				{ website ? (
					<a href={ website }>
						<h3>{ name }</h3>
					</a>
				) : (
					<h3>{ name }</h3>
				) }
				{ address && <p>{ address } { postalCode }</p> }
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
				<TagList tags={ itemTags } className={ 'popup-tag-list' } />
				{ !! distance && (
					<p>
						{ __( 'Distance: ' ) + `${ distance.toFixed( 2 ) }Km` }
					</p>
				) }
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
	setFilteredListings: ( listings: MapBoxListing[] ) => void;
} ): JSX.Element {
	const { location, map, mapRef, listings, setFilteredListings } = props;

	if ( ! map.current ) {
		return null;
	}

	return (
		<div className={ 'mapbox-popup-inner mapbox-popup-newpin' }>
			<p>Find A location?</p>
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
						text: __( 'My location' ),
						place_name: __( 'Clicked Pin' ),
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
					setFilteredListings( [ ...sortedListings, myLocationPin ] );
				} }
			>
				{ __( 'Find the nearest store?' ) }
			</button>
			<button
				onClick={ () => {
					setFilteredListings( listings );
				} }
			>
				Reset
			</button>
		</div>
	);
}
