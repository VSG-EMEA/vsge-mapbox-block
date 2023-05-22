import { Feature, Geometry } from '@turf/turf';
import mapboxgl, { LngLat, MapboxGeoJSONFeature } from 'mapbox-gl';
import { Dispatch, RefObject, SetStateAction } from 'react';

export type CoordinatesDef = [ number, number ];
export type PartnershipDef = number[];
export type CompaniesDef = number[];

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
}

export type MapboxOptions = {
	pin: {
		icon: string;
		color: string;
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

export interface MarkerProps {
	itemTags?: string[];
	itemFilters?: string[];
	name: string;
	description?: string;
	address?: string;
	city?: string;
	postalCode?: string;
	country?: string;
	state?: string;
	website?: string;
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
