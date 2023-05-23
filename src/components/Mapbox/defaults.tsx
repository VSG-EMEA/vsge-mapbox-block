// Default marker style
import { DefaultMarker } from './Pin';
import { __ } from '@wordpress/i18n';

export const defaultMarkerSize: number = 48;

export const defaultMarkerStyle: JSX.Element = DefaultMarker( {
	color: '#f44',
	size: defaultMarkerSize,
} );

export const tempMarkerStyle: JSX.Element = DefaultMarker( {
	color: '#4f4',
	size: defaultMarkerSize,
} );

export const geoMarkerStyle: JSX.Element = DefaultMarker( {
	color: '#44f',
	size: defaultMarkerSize,
} );

export const customMarkerStyle = (
	children: JSX.Element,
	color: 'blue',
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
	iconColor: '#FF0000',
	itemTags: [],
	itemFilters: [],
};

/**
 * This is a TypeScript function that creates a temporary marker with specified properties and
 * coordinates.
 *
 * @param {number | undefined}   id          - The id parameter is an optional number that represents the unique
 *                                           identifier for the temporary marker feature. If no id is provided, it defaults to undefined.
 * @param {number[] | undefined} coordinates - The `coordinates` parameter is an array of two numbers
 *                                           representing the longitude and latitude of a point on a map. It is used to specify the location of
 *                                           the marker.
 * @return A function that returns a GeoJSON feature object representing a temporary marker with
 * specified properties and coordinates. The function takes two optional parameters: `id` (a number
 * representing the marker's unique identifier) and `coordinates` (an array of two numbers representing
 * the marker's longitude and latitude).
 */
export function tempMarker( id: number, coordinates: number[] ) {
	return {
		type: 'Feature',
		id,
		properties: {
			name: 'temp',
			icon: tempMarkerStyle,
			iconSize: defaultMarkerSize,
			iconColor: '#1a1',
		},
		geometry: {
			type: 'Point',
			coordinates,
		},
	};
}
