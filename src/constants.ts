/* global mapboxBlock */
import { MapboxOptions } from 'mapbox-gl';
import { __ } from '@wordpress/i18n';

export const getDefaults: () => {
	siteurl: string;
	translations: Object;
	accessToken: string;
	language?: string;
} | null = () =>
	mapboxBlock
		? {
				accessToken: mapboxBlock?.accessToken,
				siteurl: mapboxBlock?.siteurl,
				translations: mapboxBlock?.translations,
		  }
		: null;

export const mapboxDefaults: MapboxOptions = {
	container: '',
	scrollZoom: true,
};


interface MapStyleDef {
	label: string;
	value: string;
}

export const mapStyles: MapStyleDef[] = [
	{ label: 'streets v11', value: 'streets-v11' },
	{
		label: 'outdoors v11',
		value: 'outdoors-v11',
	},
	{ label: 'light v10', value: 'light-v10' },
	{ label: 'dark v10', value: 'dark-v10' },
	{
		label: 'satellite v9',
		value: 'satellite-v9',
	},
	{
		label: 'satellite streets v11',
		value: 'satellite-streets-v11',
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
