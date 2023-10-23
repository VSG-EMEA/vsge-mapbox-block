import {
	CoordinatesDef,
	MapBoxListing,
	MarkerProps,
	MountedMapsContextValue,
	SearchMarkerProps,
} from '../../types';
import { Button, Icon } from '@wordpress/components';
import { TagList } from '../TagItem';
import { mapMarker } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { ICON_SIZE } from '../../constants';
import { layouts, svgArray } from '@mapbox/maki';
import { locateNearestStore } from '../../utils/spatialCalcs';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { RefObject } from 'react';
import { useMapboxContext } from '../Mapbox/MapboxContext';
import { showNearestStore } from './Popup';

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
	map: mapboxgl.Map;
	location: CoordinatesDef;
	mapRef: RefObject< HTMLDivElement >;
	listings: MapBoxListing[];
	setFilteredListings: ( listings: MapBoxListing[] ) => void;
} ): JSX.Element {
	const { location, map, mapRef, listings, setFilteredListings } = props;

	if ( ! map ) {
		return null;
	}

	return (
		<div className={ 'mapbox-popup-inner mapbox-popup-newpin' }>
			<p>Find A location?</p>
			<button
				onClick={ () => {
					const sortedNearestStores = locateNearestStore(
						location,
						listings
					);
					const sortedListings = showNearestStore(
						{
							text: __( 'My location' ),
							place_name: __( 'Clicked Pin' ),
							geometry: {
								coordinates: location,
							},
							properties: {
								distance: 0,
								icon: 'myLocation',
							},
						} as unknown as MapboxGeocoder.Result,
						sortedNearestStores,
						mapRef as RefObject< HTMLDivElement >,
						map
					);

					setFilteredListings( sortedListings );
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
