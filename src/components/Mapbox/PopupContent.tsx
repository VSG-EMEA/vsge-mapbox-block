import {
	MapBoxListing,
	MarkerProps,
	MountedMapsContextValue,
	SearchMarkerProps,
} from '../../types';
import { Button, Icon } from '@wordpress/components';
import { TagList } from './TagItem';
import { mapMarker } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { ICON_SIZE } from '../../constants';
import { layouts, svgArray } from '@mapbox/maki';
import { locateNearestStore } from '../../utils/spatialCalcs';
import { getNextId, showNearestStore } from '../../utils/dataset';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { RefObject } from 'react';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import { useContext, useEffect } from '@wordpress/element';
import { MapboxContext } from './MapboxContext';
import { addMarker } from './Markers';

/* This code exports a React functional component called `PopupContent` that takes in a `props` object.
The component destructures the `props` object to extract the properties `itemTags`, `itemFilters`,
`name`, `description`, `address`, `city`, `postalCode`, `country`, `state`, and `website` from the
`MarkerProps` type. It then returns a JSX element that displays the extracted properties in a
specific format. The `PopupContent` component is used to render the content of a popup that appears
when a marker is clicked on a map. */
export function PopupContent( props: MarkerProps ) {
	const {
		itemTags,
		itemFilters,
		name = '',
		phone = '',
		address = '',
		city = '',
		postalCode = '',
		country = '',
		emailAddress = '',
		website = '',
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
				{ website && (
					<a href={ website }>
						<h3>{ name }</h3>
					</a>
				) }
				{ address && <p>{ address }</p> }
				<p>{ `${ city } - ${ country } ${ postalCode }` }</p>
				{ emailAddress || (
					<a href={ 'mailto:' + emailAddress } className={ 'email' }>
						<p>{ emailAddress }</p>
					</a>
				) }
				{ phone || (
					<a href={ 'tel:' + phone }>
						<p>{ phone }</p>
					</a>
				) }
				<TagList tags={ itemTags } className={ 'popup-tag-list' } />
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

export function SearchPopup( props: SearchMarkerProps ) {
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
				<p>
					{ __( 'The closest store distance: ' ) +
						`${ distance.toFixed( 2 ) }Km` }
				</p>
			</div>
		</div>
	);
}

export function PinPointPopup( props: {
	location: LngLatLike;
	filteredListings: MapBoxListing[] | null;
	listings: MapBoxListing[];
	setFilteredListings: ( listings: MapBoxListing[] ) => void;
	mapRef: RefObject< HTMLDivElement > | undefined;
	map: mapboxgl.Map | null;
} ) {
	const {
		location,
		filteredListings,
		listings,
		setFilteredListings,
		mapRef,
		map,
	} = props;

	return (
		<div className={ 'mapbox-popup-inner mapbox-popup-newpin' }>
			<p>Find A location?</p>
			<Button
				onClick={ () => {
					const sortedNearestStores = locateNearestStore(
						location,
						filteredListings ?? listings
					);
					showNearestStore(
						{
							text: __( 'Me' ),
							place_name: __( 'Clicked Pin' ),
							geometry: {
								coordinates: location,
							},
							properties: {
								distance: 0,
							},
						} as unknown as MapboxGeocoder.Result,
						sortedNearestStores,
						filteredListings,
						setFilteredListings,
						mapRef as RefObject< HTMLDivElement >,
						map
					);

					// add the new marker to the map
					addMarker(
						{
							text: __( 'Me' ),
							geometry: {
								coordinates: location,
							},
							properties: {
								name: __( 'Clicked Pin' ),
								icon: 'pin',
								draggable: true,
							},
						},
						map,
						'pinpoint'
					);
				} }
			>
				Get the nearest store?
			</Button>
			<Button
				onClick={ () => {
					setFilteredListings( listings );
				} }
			>
				Reset
			</Button>
		</div>
	);
}
