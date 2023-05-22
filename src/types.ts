import { Feature, Geometry, GeometryCollection } from '@turf/turf';
import mapboxgl, { LngLat } from 'mapbox-gl';
import { Dispatch, RefObject, SetStateAction } from 'react';
import { GeometryObject } from '@turf/helpers/dist/js/lib/geojson';

export type CoordinatesDef = [ number, number ];

export type MapboxBlockDefaults = {
	accessToken: string;
	siteurl: string;
	language: string;
};

export type MapFilter = { id: number; value: string };

export type MapStyleDef = {
	label: string;
	value: string;
};

export interface MapBoxListing extends mapboxgl.MapboxGeoJSONFeature {
	id: number;
	properties: MarkerProps;
}

export type MapboxOptions = {
	pin: {
		icons: string[];
	};
	tags: string[];
	filters: string[];
	listings: MapBoxListing[];
};

export type MapAttributes = {
	align: string;
	latitude: number;
	longitude: number;
	pitch: number;
	bearing: number;
	mapZoom: number;
	mapStyle: string;
	mapHeight: string;
	sidebarEnabled: boolean;
	geocoderEnabled: boolean;
	filtersEnabled: boolean;
	tagsEnabled: boolean;
	fitView: boolean;
	elevation: boolean;
	freeViewCamera: boolean;
	mouseWheelZoom: boolean;
	mapboxOptions: MapboxOptions;
};

/**
 * the mapbox single listing
 *
 * @type {MapBoxListing}
 * @property {number}   id          the id
 * @property {string}   name        the name
 * @property {string}   description the description
 * @property {string=}  city        the city
 * @property {string=}  postalCode  the postal code
 * @property {string=}  country     the country
 * @property {string=}  address     the address
 * @property {string=}  state       the state
 * @property {string=}  website     the website
 * @property {string[]} tags        the tags
 * @property {string[]} filters     the filters
 */
export interface MarkerProps {
	name: string;
	description?: string;
	telephone?: string;
	address?: string;
	city?: string;
	postalCode?: string;
	country?: string;
	state?: string;
	website?: string;
	iconSize?: number;
	iconColor?: string;
	itemTags?: MapFilter[];
	itemFilters?: MapFilter[];
}
export interface MapItem extends Feature {
	geometry: Geometry;
	properties: MarkerProps;
	distance?: {
		value: number;
		writable: boolean;
		enumerable: boolean;
		configurable: boolean;
	} | null;
}

export type MountedMapsContextValue = {
	map: mapboxgl.Map | null;
	lngLat?: LngLat;
	markers?: MapBoxListing[];
	setMap: Dispatch< SetStateAction< mapboxgl.Map | null > >;
	setLngLat: Dispatch< SetStateAction< LngLat | null > >;
	setMarkers: Dispatch< SetStateAction< MapBoxListing[] > >;
	setGeoCoder?: SetStateAction< any >;
	mapRef?: RefObject< HTMLDivElement >;
	geocoderRef?: RefObject< HTMLDivElement >;
	mapDefaults?: MapboxBlockDefaults;
};

export interface MarkerPropsCustom {
	children: JSX.Element;
}

export interface MarkerItem {
	geometry: Geometry;
	properties?: MarkerProps;
	element?: HTMLElement;
}

export interface MarkerHTMLElement extends HTMLElement {
	dataset: {
		id: string;
		markerName: string;
	};
}
