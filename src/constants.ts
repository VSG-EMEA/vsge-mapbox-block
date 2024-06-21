import { MapboxOptions } from 'mapbox-gl';
import { MapboxBlockDefaults, selectOptions } from './types';

declare global {
	let mapboxBlockData: MapboxBlockDefaults;
}

export const mapboxDefaults: MapboxOptions = {
	container: '',
	scrollZoom: true,
};

export const SEARCH_RESULTS_SHOWN: number = 5;

export const DEFAULT_COLOR = '#004a83';
export const DEFAULT_COLOR_ALT = '#004a83';
export const ICON_SIZE: number = 36;
// https://docs.mapbox.com/api/search/geocoding/#data-types
export const DEFAULT_GEOCODER_TYPE_SEARCH: string =
	'country,region,district,postcode,place,locality,poi';

/**
 * Markers
 */
export const MARKER_TYPE_TEMP = 'Temp';

/**
 * The mapbox map layout styles
 *
 * @see https://docs.mapbox.com/api/maps/styles/#mapbox-styles
 */
export const mapStyles: selectOptions[] = [
	{ label: 'streets', value: 'streets-v12' },
	{
		label: 'outdoors',
		value: 'outdoors-v12',
	},
	{ label: 'light', value: 'light-v11' },
	{ label: 'dark', value: 'dark-v11' },
	{
		label: 'satellite',
		value: 'satellite-v9',
	},
	{
		label: 'satellite streets',
		value: 'satellite-streets-v12',
	},
	{
		label: 'navigation day',
		value: 'navigation-day-v1',
	},
	{
		label: 'navigation night',
		value: 'navigation-night-v1',
	},
];

export const mapProjections: selectOptions[] = [
	{ label: 'Albers', value: 'albers' },
	{ label: 'Equal Earth', value: 'equalEarth' },
	{ label: 'Equirectangular', value: 'equirectangular' },
	{ label: 'Lambert Conformal Conic', value: 'lambertConformalConic' },
	{ label: 'Mercator', value: 'mercator' },
	{ label: 'Natural Earth', value: 'naturalEarth' },
	{ label: 'Winkel Tripel', value: 'winkelTripel' },
	{ label: 'Globe', value: 'globe' },
];

export const pointerOffset = { offset: [ 0, -23 ] };
