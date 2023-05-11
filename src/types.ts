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
	mapboxOptions: {
		pin: {
			icon: string;
			color: string;
		};
		tags: string[];
		filters: string[];
		listings: MapboxGeoJSONFeature[];
	};
};

export interface ExtraProperties {
	id?: number | null;
	name: string;
	phone?: string;
	address?: string;
	city?: string;
	country?: string;
	postalCode?: string;
	state: string;
	emailAddress?: string;
	website?: string;
	partnership: PartnershipDef;
	company: CompaniesDef;
}

export interface MapItem extends Feature {
	geometry: Geometry;
	properties: ExtraProperties;
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
	markers?: mapboxgl.MapboxGeoJSONFeature[];
	setMap: Dispatch< SetStateAction< mapboxgl.Map | null > >;
	setMarkers: Dispatch< SetStateAction< mapboxgl.MapboxGeoJSONFeature[] > >;
	setGeoCoder?: SetStateAction< any >;
	mapRef?: RefObject< HTMLDivElement >;
	geocoderRef?: RefObject< HTMLDivElement >;
	mapDefaults?: MapboxBlockDefaults;
};

export interface MarkerProps {
	itemTags?: string[];
	itemFilters?: string[];
	name: string;
	description: string;
	address?: string;
	city?: string;
	postalCode?: string;
	country?: string;
	state?: string;
	website?: string;
}

export interface MarkerPropsCustom {
	children: JSX.Element;
}

export interface MarkerItem {
	geometry: Geometry;
	properties?: MarkerProps;
}

export interface MarkerHTMLElement extends HTMLElement {
	dataset: {
		id: string;
		markerName: string;
	};
}
