import { Feature, Geometry } from '@turf/turf';
import mapboxgl from 'mapbox-gl';
import {Ref, RefObject, SetStateAction} from 'react';

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
	latitude: number;
	longitude: number;
	pitch: number;
	bearing: number;
	mapZoom: number;
	mapStyle: string;
	sidebarEnabled: boolean;
	geocoderEnabled: boolean;
	filtersEnabled: boolean;
	tagsEnabled: boolean;
	fitView: boolean;
	threeDimensionality: boolean;
	mapboxOptions: {
		tags: string[];
		filters: string[];
		listings: string[];
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
	popupContent?: any;
	setPopupContent?: any;
	setMap: SetStateAction< mapboxgl.Map >;
	setGeoCoder: SetStateAction< any >;
	mapRef: RefObject< HTMLDivElement >;
	geocoderRef: RefObject< HTMLDivElement >;
	defaults: MapboxBlockDefaults;
};
