import { Feature, Geometry } from '@turf/turf';
import mapboxgl, { LngLat } from 'mapbox-gl';
import { Dispatch, RefObject, SetStateAction } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

export type CoordinatesDef = [ number, number ];

export type MapboxBlockDefaults = {
	accessToken: string;
	siteurl: string;
	language: string;
};

export type TagArray = string[];

export type TagCollection = { id: number; value: string };

export interface MarkerIcon {
	id: number;
	name: string;
	content: string;
}

export type MapboxOptions = {
	icons: MarkerIcon[];
	tags: TagCollection[];
	filters: TagCollection[];
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
	setMap: Dispatch< SetStateAction< mapboxgl.Map | null > >;
	listings: MapBoxListing[];
	filteredListings: MapBoxListing[] | null;
	setListings: Dispatch< SetStateAction< MapBoxListing[] | null > >;
	setFilteredListings: Dispatch< MapBoxListing[] | null >;
	setLngLat: Dispatch< SetStateAction< LngLat | null > >;
	geoCoder?: MapboxGeocoder;
	setGeoCoder?: SetStateAction< any >;
	mapRef?: RefObject< HTMLDivElement >;
	geocoderRef?: RefObject< HTMLDivElement >;
	mapDefaults?: MapboxBlockDefaults;
};

export type selectOptions = {
	label: string;
	value: string;
};

export interface MapBoxListing {
	id: number;
	type: string;
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
	phone?: string;
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
	itemTags?: TagArray[];
	itemFilters?: TagArray[];
	distance?: number;
}

export interface MarkerPropsStyle {
	color?: string;
	size?: number;
	children?: JSX.Element;
}

export interface SearchMarkerProps extends MarkerProps {
	category: string;
	maki: string;
}

export interface MarkerItem {
	geometry: Geometry;
	properties?: MarkerProps;
	element?: HTMLElement;
}

export interface MarkerHTMLElement extends HTMLElement {
	dataset: {
		id: string;
		dataId: string;
		markerName: string;
		markerType: string;
	};
}
