import { MapboxOptions } from 'mapbox-gl';
import { __ } from '@wordpress/i18n';
import { MapboxBlockDefaults, MapStyleDef } from './types';

declare global {
	let mapboxBlockData: MapboxBlockDefaults;
}

export const mapboxDefaults: MapboxOptions = {
	container: '',
	scrollZoom: true,
};

/**
 * The mapbox map layout styles
 *
 * @see https://docs.mapbox.com/api/maps/styles/#mapbox-styles
 */
export const mapStyles: MapStyleDef[] = [
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

export const MapFiltersDefaults: string[] = [
	__( 'all' ),
	__( 'partner' ),
	__( 'sales' ),
];

export const MapTagsDefaults: string[] = [ __( 'red' ), __( 'blue' ) ];

export const pointerOffset = { offset: [ 0, -23 ] };
