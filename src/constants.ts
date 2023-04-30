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
	{ label: 'streets v12', value: 'streets-v12' },
	{
		label: 'outdoors v12',
		value: 'outdoors-v12',
	},
	{ label: 'light v11', value: 'light-v11' },
	{ label: 'dark v11', value: 'dark-v11' },
	{
		label: 'satellite v9',
		value: 'satellite-v9',
	},
	{
		label: 'satellite-streets-v12',
		value: 'satellite-streets-v12',
	},
	{
		label: 'navigation day v1',
		value: 'navigation-day-v1',
	},
	{
		label: 'navigation night v1',
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
