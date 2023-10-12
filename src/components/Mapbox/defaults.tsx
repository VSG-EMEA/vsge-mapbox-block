// Default marker style
import { DefaultMarker } from './Pin';
import { __ } from '@wordpress/i18n';
import { CoordinatesDef, MapBoxListing } from '../../types';
import { LngLatLike } from 'mapbox-gl';
import { DEFAULT_COLOR, DEFAULT_COLOR_ALT } from '../../constants';

export const defaultMarkerSize: number = 48;

export const defaultColors: string[] = [ DEFAULT_COLOR, '#ce0e2d', '#44f' ];

interface MarkerBasicStyle {
	color: string;
	size: number;
}

export const defaultMarkerStyle: MarkerBasicStyle = {
	color: defaultColors[ 0 ],
	size: defaultMarkerSize,
};

export const tempMarkerStyle: MarkerBasicStyle = {
	color: defaultColors[ 1 ],
	size: defaultMarkerSize,
};

export const geoMarkerStyle: MarkerBasicStyle = {
	color: DEFAULT_COLOR_ALT,
	size: defaultMarkerSize,
};

export const customMarkerStyle = (
	children: JSX.Element,
	color: string,
	size: number
) =>
	DefaultMarker( {
		color,
		size,
		children,
	} );

export const defaultMarkerProps = {
	name: __( 'New Marker' ),
	description: '',
	address: '',
	location: '',
	city: '',
	cap: '',
	iconSize: defaultMarkerSize,
	iconColor: defaultColors[ 0 ],
	itemTags: [],
	itemFilters: [],
};

/**
 * This is a TypeScript function that creates a temporary marker with specified properties and
 * coordinates.
 *
 * @param {number | undefined}     id          - The id parameter is an optional number that represents the unique
 *                                             identifier for the temporary marker feature. If no id is provided, it defaults to undefined.
 * @param {LngLatLike | undefined} coordinates - The `coordinates` parameter is an array of two numbers
 *                                             representing the longitude and latitude of a point on a map. It is used to specify the location of
 *                                             the marker.
 * @return A function that returns a GeoJSON feature object representing a temporary marker with
 * specified properties and coordinates. The function takes two optional parameters: `id` (a number
 * representing the marker's unique identifier) and `coordinates` (an array of two numbers representing
 * the marker's longitude and latitude).
 */
export function generateTempMarkerData(
	id: number,
	coordinates: CoordinatesDef | [ number, number ]
): MapBoxListing {
	return {
		type: 'temp',
		id,
		properties: {
			name: 'click-marker',
			icon: 'pin',
			iconSize: defaultMarkerSize,
			iconColor: defaultColors[ 0 ],
			draggable: true,
		},
		geometry: {
			type: 'Point',
			coordinates,
		},
	};
}

export function generateGeocoderMarkerData(
	id: number,
	coordinates: CoordinatesDef | [ number, number ]
): MapBoxListing {
	return {
		type: 'temp',
		id,
		properties: {
			name: 'geocoder-marker',
			icon: 'geocoder',
			iconSize: defaultMarkerSize,
			iconColor: defaultColors[ 2 ],
			draggable: true,
		},
		geometry: {
			type: 'Point',
			coordinates,
		},
	};
}
