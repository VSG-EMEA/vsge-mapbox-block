/* global resellers */
import { Map } from 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import { Coord } from '@turf/turf';
import { MapItem } from '../types';
import { initMapbox } from './map';


export const markers: any[] = [];

const mapboxWrapper: HTMLElement | null = document.querySelector( 'map' );

/**
 * @function Object() { [native code] } Initial Mapbox setup
 */
if ( mapboxWrapper ) {
	document.addEventListener( 'DOMContentLoaded', () =>
		initMapbox( mapboxWrapper )
	);
}
