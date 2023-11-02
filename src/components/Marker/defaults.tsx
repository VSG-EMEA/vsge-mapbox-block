// Default marker style
import { CoordinatesDef, MapBoxListing, MarkerPropsStyle } from '../../types';
import {
	DEFAULT_COLOR,
	DEFAULT_COLOR_ALT,
	MARKER_TYPE_TEMP,
} from '../../constants';

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

/**
 * This is a TypeScript function that creates a temporary marker with specified properties and
 * coordinates.
 *
 * @param {number | undefined} id          - The id parameter is an optional number that represents the unique
 *                                         identifier for the temporary marker feature. If no id is provided, it defaults to undefined.
 * @param {CoordinatesDef}     coordinates - The `coordinates` parameter is an array of two numbers
 *                                         representing the longitude and latitude of a point on a map. It is used to specify the location of
 *                                         the marker.
 *
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
		id,
		type: MARKER_TYPE_TEMP,
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
		id,
		type: MARKER_TYPE_TEMP,
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

export function geocoderMarkerDefaults(
	id: number,
	defaultStyle: MarkerPropsStyle
): MapBoxListing {
	return {
		id,
		type: MARKER_TYPE_TEMP,
		properties: {
			name: 'geocoder-marker',
			icon: 'geocoder',
			iconSize: defaultStyle.size,
			iconColor: defaultStyle.color,
			draggable: true,
		},
		geometry: {
			type: 'Point',
			coordinates: [ 0, 0 ] as CoordinatesDef,
		},
	};
}
