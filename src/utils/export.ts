import type { MapBoxListing, MapboxOptions } from '../types';

/**
 * Creates a sanitized deep clone of MapboxOptions for JSON export.
 * Strips transient runtime properties such as distance from listings
 * without mutating the source object.
 *
 * @param options Source block mapboxOptions.
 * @return Deep clone ready for deterministic JSON synchronization.
 */
export function sanitizeMapboxOptionsForExport(
	options: MapboxOptions
): MapboxOptions {
	const sanitizedListings: MapBoxListing[] = ( options.listings || [] ).map(
		( listing ) => {
			const cloned = { ...listing };
			delete ( cloned as any ).distance;
			const properties = { ...listing.properties };
			delete properties.distance;
			return {
				...cloned,
				geometry: {
					...listing.geometry,
					coordinates: [ ...listing.geometry.coordinates ] as [
						number,
						number,
					],
				},
				properties,
			};
		}
	);

	return {
		icons: ( options.icons || [] ).map( ( icon ) => ( { ...icon } ) ),
		tags: ( options.tags || [] ).map( ( tag ) => ( { ...tag } ) ),
		filters: ( options.filters || [] ).map( ( filter ) => ( {
			...filter,
		} ) ),
		listings: sanitizedListings,
	};
}

/**
 * Downloads the map configuration as a formatted JSON file.
 * Safely revokes the created Blob URL asynchronously after browser dispatch.
 *
 * @param options Source mapboxOptions to export.
 */
export function exportMapboxJson( options: MapboxOptions ): void {
	if ( typeof window === 'undefined' || typeof document === 'undefined' ) {
		return;
	}

	const payload = sanitizeMapboxOptionsForExport( options );
	const jsonContent = JSON.stringify( payload, null, 2 );
	const blob = new Blob( [ jsonContent ], { type: 'application/json' } );
	const url = URL.createObjectURL( blob );

	const link = document.createElement( 'a' );
	link.href = url;
	link.download = 'vsge-mapbox-config.json';
	link.style.display = 'none';
	document.body.appendChild( link );
	link.click();
	document.body.removeChild( link );

	setTimeout( () => {
		URL.revokeObjectURL( url );
	}, 1000 );
}

export type ImportValidationResult =
	| {
			valid: true;
			data: {
				listings: MapBoxListing[];
				tags: MapboxOptions['tags'];
				filters: MapboxOptions['filters'];
				icons: MapboxOptions['icons'];
			};
	  }
	| {
			valid: false;
			error: string;
	  };

/**
 * Validates and sanitizes imported Mapbox JSON payload.
 *
 * Verifies that root is an object and that listings, tags, filters, and icons are arrays.
 * Strips any runtime transient properties such as distance from listings.
 *
 * @param jsonText Raw JSON string from imported file.
 * @return Validation result with sanitized data or concise error message.
 */
export function validateAndSanitizeMapboxImport(
	jsonText: string
): ImportValidationResult {
	let raw: unknown;
	try {
		raw = JSON.parse( jsonText );
	} catch {
		return {
			valid: false,
			error: 'Invalid JSON file format.',
		};
	}

	if ( typeof raw !== 'object' || raw === null || Array.isArray( raw ) ) {
		return {
			valid: false,
			error: 'Invalid configuration format: root must be an object.',
		};
	}

	const payload = raw as Record< string, unknown >;

	if ( ! Array.isArray( payload.listings ) ) {
		return {
			valid: false,
			error: 'Invalid configuration format: listings must be an array.',
		};
	}
	if ( ! Array.isArray( payload.tags ) ) {
		return {
			valid: false,
			error: 'Invalid configuration format: tags must be an array.',
		};
	}
	if ( ! Array.isArray( payload.filters ) ) {
		return {
			valid: false,
			error: 'Invalid configuration format: filters must be an array.',
		};
	}
	if ( ! Array.isArray( payload.icons ) ) {
		return {
			valid: false,
			error: 'Invalid configuration format: icons must be an array.',
		};
	}

	const sanitizedListings: MapBoxListing[] = payload.listings.map(
		( item: unknown ) => {
			const listing = (
				typeof item === 'object' && item !== null ? item : {}
			) as Record< string, any >;
			const cloned: Record< string, any > = { ...listing };
			delete cloned.distance;

			const properties = { ...( listing.properties || {} ) };
			delete properties.distance;

			return {
				...cloned,
				properties,
			} as MapBoxListing;
		}
	);

	return {
		valid: true,
		data: {
			listings: sanitizedListings,
			tags: payload.tags as MapboxOptions['tags'],
			filters: payload.filters as MapboxOptions['filters'],
			icons: payload.icons as MapboxOptions['icons'],
		},
	};
}

