import { Feature, Geometry, GeometryCollection } from '@turf/turf';

export type CoordinatesDef = [ number, number ];
export type PartnershipDef = number[];
export type CompaniesDef = number[];

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

export interface CustomFeatureCollection {
	type: 'FeatureCollection';
	features: MapItem;
}
