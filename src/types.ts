import type { Feature, Geometry } from '@turf/turf';
import type mapboxgl from 'mapbox-gl';
import type { LngLat } from 'mapbox-gl';
import type {
	Dispatch,
	MutableRefObject,
	RefObject,
	SetStateAction,
} from 'react';
import type MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

export type CoordinatesDef = [ number, number ];

export type MapboxBlockDefaults = {
	accessToken: string;
	siteurl: string;
	language: string;
};

export type TagArray = string[] | undefined;

export type FilterCollection = { id: number; value: string };
export type TagCollection = { id: number; tag: string };

export interface SortableProps {
	items: MapBoxListing[] | FilterCollection[];
	tax: string;
	setOptions: Function;
	mapboxOptions?: MapboxOptions;
}

export interface MarkerIcon {
	id: number;
	name: string;
	content: string;
}

export type MapboxOptions = {
	icons: MarkerIcon[];
	tags: FilterCollection[];
	filters: FilterCollection[];
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
	mapProjection: string;
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

export type MountedMapsContextValue = {
	map: MutableRefObject< mapboxgl.Map | null >;
	lngLat?: LngLat;
	setLngLat: Dispatch< SetStateAction< LngLat > >;
	listings: MapBoxListing[];
	filteredListings: MapBoxListing[] | null;
	setListings: Dispatch< SetStateAction< MapBoxListing[] > >;
	setFilteredListings: Dispatch< MapBoxListing[] | null >;
	geoCoder?: MapboxGeocoder;
	setGeoCoder?: SetStateAction< any >;
	mapRef?: RefObject< HTMLDivElement >;
	markersRef: MutableRefObject< HTMLButtonElement[] >;
	geocoderRef?: RefObject< HTMLDivElement >;
	loaded: boolean;
	setLoaded: Dispatch< SetStateAction< boolean > >;
	mapDefaults?: MapboxBlockDefaults;
	mapIcons?: MarkerIcon[];
};

export type selectOptions = {
	label: string;
	value: string;
};

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

export interface MapBoxListing {
	id: number;
	type: string;
	text?: string;
	properties: MarkerProps;
	geometry: {
		type: string;
		coordinates: CoordinatesDef;
	};
	ref?: RefObject< HTMLElement >;
}

/**
 * the mapbox single listing
 *
 * @type {MapBoxListing}
 * @property {number}   id          the id
 * @property {string}   name        the name
 * @property {string}   description the description
 * @property {string=}  company     the company
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
	category?: string; // search results
	maki?: string; // search result
	name: string;
	description?: string;
	phone?: string;
	mobile?: string;
	company?: string;
	address?: string;
	city?: string;
	postalCode?: string;
	country?: string;
	countryCode?: string;
	state?: string;
	emailAddress?: string;
	website?: string;
	icon: string;
	draggable: boolean;
	iconSize?: number;
	iconColor?: string;
	itemTags?: TagArray;
	itemFilters?: TagArray;
	distance?: number;
	preferredArea?: string[];
}

export interface MarkerPropsStyle {
	color?: string;
	size?: number;
	children?: JSX.Element;
}

export interface MarkerHTMLElement extends HTMLElement {
	dataset: {
		id: string;
		dataId: string;
		markerName: string;
		markerType: string;
	};
}
