import type mapboxgl from 'mapbox-gl';
import type { MapBoxListing, MarkerIcon } from '../../types';
import { toDealerFeatureCollection } from '../../utils/dataset';
import { getMakiSvg } from '../../utils/maki';

export const DEALER_SOURCE_ID = 'vsge-dealer-listings';
export const DEALER_POINTS_LAYER_ID = 'vsge-dealer-points';
export const DEALER_CUSTOM_LAYER_ID = 'vsge-dealer-custom';
export const DEFAULT_MARKER_IMAGE_ID = 'vsge-marker-default';

const DEFAULT_MARKER_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 560" width="48" height="74">' +
	'<path fill="#000000" d="M182.9 551.7c0 .1.2.3.2.3s175.2-269 175.2-357.4c0-130.1-88.8-186.7-175.4-186.9C96.3 7.9 7.5 64.5 7.5 194.6 7.5 283 182.8 552 182.8 552l.1-.3zm-60.7-364.5c0-33.6 27.2-60.8 60.8-60.8 33.6 0 60.8 27.2 60.8 60.8S216.5 248 182.9 248c-33.5 0-60.7-27.2-60.7-60.8z"/>' +
	'</svg>';

function prepareSvg(
	svg: string,
	defaultWidth = 48,
	defaultHeight = 48
): string {
	let prepared = svg;
	if ( ! prepared.includes( 'width=' ) ) {
		prepared = prepared.replace( '<svg', `<svg width="${ defaultWidth }"` );
	}
	if ( ! prepared.includes( 'height=' ) ) {
		prepared = prepared.replace(
			'<svg',
			`<svg height="${ defaultHeight }"`
		);
	}
	if ( ! prepared.includes( 'xmlns=' ) ) {
		prepared = prepared.replace(
			'<svg',
			'<svg xmlns="http://www.w3.org/2000/svg"'
		);
	}
	return prepared;
}

function svgToImage( svgString: string ): Promise< HTMLImageElement > {
	if ( typeof window === 'undefined' || typeof Image === 'undefined' ) {
		return Promise.resolve( {} as HTMLImageElement );
	}
	return new Promise( ( resolve ) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		let resolved = false;

		const onDone = () => {
			if ( ! resolved ) {
				resolved = true;
				resolve( img );
			}
		};

		img.onload = onDone;
		img.onerror = onDone;
		img.src =
			'data:image/svg+xml;charset=utf-8,' +
			encodeURIComponent( svgString );

		if ( typeof img.complete === 'boolean' && img.complete ) {
			onDone();
		}
	} );
}

/**
 * Ensures dealer marker images are idempotently registered on the specific Map instance.
 * Registers default pin (SDF/recolourable), configured custom icons (non-SDF, authored colours),
 * and only uniquely used Maki icons (SDF/recolourable).
 *
 * @param map      The Mapbox Map instance.
 * @param icons    Custom marker icons configured for the block.
 * @param listings Active dealer listings.
 */
export async function ensureDealerImages(
	map: mapboxgl.Map,
	icons?: MarkerIcon[],
	listings?: MapBoxListing[]
): Promise< void > {
	if ( ! map ) {
		return;
	}

	// 1. Register default marker pin as SDF (recolourable template)
	if ( ! map.hasImage( DEFAULT_MARKER_IMAGE_ID ) ) {
		const defaultImg = await svgToImage( DEFAULT_MARKER_SVG );
		if ( ! map.hasImage( DEFAULT_MARKER_IMAGE_ID ) ) {
			try {
				map.addImage( DEFAULT_MARKER_IMAGE_ID, defaultImg, {
					sdf: true,
				} );
			} catch {
				// Ignore if added concurrently
			}
		}
	}

	// 2. Register configured custom icons as non-SDF (authored colours are preserved exactly)
	if ( icons && Array.isArray( icons ) ) {
		for ( const icon of icons ) {
			const imageId = `vsge-marker-custom-${ icon.id }`;
			const aliasId = `vsge-marker-${ icon.id }`;
			if ( icon.content ) {
				const prepared = prepareSvg( icon.content );
				const customImg = await svgToImage( prepared );
				if ( ! map.hasImage( imageId ) ) {
					try {
						// sdf: false — preserve the SVG's own fills, do not apply icon-color
						map.addImage( imageId, customImg, { sdf: false } );
					} catch {
						// Ignore if added concurrently
					}
				}
				if ( ! map.hasImage( aliasId ) ) {
					try {
						map.addImage( aliasId, customImg, { sdf: false } );
					} catch {
						// Ignore if added concurrently
					}
				}
			}
		}
	}

	// 3. Register only uniquely used Maki icons as SDF (recolourable template icons)
	if ( listings && Array.isArray( listings ) ) {
		const usedIcons = new Set< string >();
		for ( const listing of listings ) {
			const icon = listing.properties?.icon;
			if (
				icon &&
				icon !== 'default' &&
				! icon.startsWith( 'custom-' ) &&
				! icons?.some(
					( i ) =>
						String( i.id ) === icon || `custom-${ i.id }` === icon
				)
			) {
				usedIcons.add( icon );
			}
		}

		for ( const iconName of usedIcons ) {
			const cleanName = iconName.replace( /^maki-/, '' ).toLowerCase();
			const makiKey = `vsge-marker-maki-${ cleanName }`;
			const plainKey = `vsge-marker-${ cleanName }`;

			if ( ! map.hasImage( makiKey ) || ! map.hasImage( plainKey ) ) {
				const svg = await getMakiSvg( cleanName );
				if ( svg ) {
					const prepared = prepareSvg( svg, 48, 48 );
					const makiImg = await svgToImage( prepared );
					if ( ! map.hasImage( makiKey ) ) {
						try {
							map.addImage( makiKey, makiImg, { sdf: true } );
						} catch {
							// Ignore if added concurrently
						}
					}
					if ( ! map.hasImage( plainKey ) ) {
						try {
							map.addImage( plainKey, makiImg, { sdf: true } );
						} catch {
							// Ignore if added concurrently
						}
					}
				}
			}
		}
	}
}

/**
 * Ensures the canonical dealer GeoJSON source exists and is up to date on the map.
 *
 * @param map      The Mapbox Map instance.
 * @param listings Active listings (unfiltered, subset, or empty for zero-results).
 */
export function ensureDealerSource(
	map: mapboxgl.Map,
	listings: MapBoxListing[]
): void {
	if ( ! map ) {
		return;
	}
	const featureCollection = toDealerFeatureCollection( listings );
	const existingSource = map.getSource( DEALER_SOURCE_ID ) as
		| mapboxgl.GeoJSONSource
		| undefined;

	if ( existingSource && typeof existingSource.setData === 'function' ) {
		existingSource.setData( featureCollection );
	} else if ( ! existingSource ) {
		map.addSource( DEALER_SOURCE_ID, {
			type: 'geojson',
			data: featureCollection,
		} );
	}
}

/**
 * Returns a data-driven icon-size expression that enlarges the selected dealer's icon.
 * Works identically across custom SVG, default marker, and Maki symbol layers.
 *
 * @param selectedDealerId The currently selected dealer ID, or null.
 * @param baseIconSize     The base icon-size divisor (default 48 pixels).
 */
function iconSizeExpression(
	selectedDealerId: number | null,
	baseIconSize = 48
): mapboxgl.Expression {
	const normalSize: mapboxgl.Expression = [
		'/',
		[ 'coalesce', [ 'get', 'iconSize' ], baseIconSize ],
		baseIconSize,
	];
	if ( selectedDealerId === null ) {
		return normalSize;
	}
	const selectedSize: mapboxgl.Expression = [
		'*',
		normalSize,
		1.15,
	];
	return [
		'case',
		[ '==', [ 'id' ], selectedDealerId ],
		selectedSize,
		normalSize,
	];
}

/**
 * Ensures the two mutually exclusive dealer symbol layers exist and reflect the selected
 * dealer ID via a data-driven icon-size expression.
 *
 * - DEALER_CUSTOM_LAYER_ID  renders only dealers whose icon is a configured custom SVG;
 *   it never applies icon-color so the authored fills are preserved exactly.
 * - DEALER_POINTS_LAYER_ID  renders all remaining dealers (default pin, Maki);
 *   it applies icon-color for SDF recolouring.
 *
 * A dealer appears in exactly one layer, never both.
 *
 * @param map              The Mapbox Map instance.
 * @param selectedDealerId Currently selected dealer ID, or null.
 * @param icons            Configured custom marker icons, used to build the filter expression.
 */
export function ensureDealerLayers(
	map: mapboxgl.Map,
	selectedDealerId: number | null,
	icons?: MarkerIcon[]
): void {
	if ( ! map || ! map.getSource( DEALER_SOURCE_ID ) ) {
		return;
	}

	// Build the set of custom image IDs so the filter expression can match them
	const customImageIds: string[] = ( icons ?? [] )
		.filter( ( i ) => Boolean( i.content ) )
		.flatMap( ( i ) => [
			`vsge-marker-custom-${ i.id }`,
			`vsge-marker-${ i.id }`,
		] );

	// A feature is "custom" when its resolved icon-image key matches a configured custom image.
	// We use the stored `icon` property: icon === String(id) or icon === `custom-${id}`.
	const customIconValues: string[] = ( icons ?? [] )
		.filter( ( i ) => Boolean( i.content ) )
		.flatMap( ( i ) => [ String( i.id ), `custom-${ i.id }` ] );

	// Filter: matches dealers whose `icon` property resolves to a custom SVG image
	const isCustomFilter: mapboxgl.Expression =
		customIconValues.length > 0
			? [
					'in',
					[ 'get', 'icon' ],
					[ 'literal', customIconValues ],
			  ]
			: ( [ 'literal', false ] as unknown as mapboxgl.Expression );

	// Filter: matches all other dealers (default pin, Maki)
	const isTemplateFilter: mapboxgl.Expression =
		customIconValues.length > 0
			? [
					'!',
					[
						'in',
						[ 'get', 'icon' ],
						[ 'literal', customIconValues ],
					],
			  ]
			: ( [ 'literal', true ] as unknown as mapboxgl.Expression );

	const sizeExpr = iconSizeExpression( selectedDealerId );

	// 1. Custom SVG layer — non-SDF, no icon-color, authored colours preserved
	if ( ! map.getLayer( DEALER_CUSTOM_LAYER_ID ) ) {
		map.addLayer( {
			id: DEALER_CUSTOM_LAYER_ID,
			type: 'symbol',
			source: DEALER_SOURCE_ID,
			filter: isCustomFilter,
			layout: {
				'icon-image': [
					'concat',
					'vsge-marker-',
					[ 'get', 'icon' ],
				],
				'icon-size': sizeExpr,
				'icon-anchor': 'bottom',
				'icon-allow-overlap': true,
				'icon-ignore-placement': true,
			},
			paint: {},
		} );
	} else {
		map.setLayoutProperty(
			DEALER_CUSTOM_LAYER_ID,
			'icon-size',
			sizeExpr
		);
		map.setFilter( DEALER_CUSTOM_LAYER_ID, isCustomFilter );
	}

	// 2. Template/Maki/default layer — SDF, icon-color applied for recolouring
	if ( ! map.getLayer( DEALER_POINTS_LAYER_ID ) ) {
		map.addLayer( {
			id: DEALER_POINTS_LAYER_ID,
			type: 'symbol',
			source: DEALER_SOURCE_ID,
			filter: isTemplateFilter,
			layout: {
				'icon-image': [
					'case',
					[
						'all',
						[ 'has', 'icon' ],
						[ '!=', [ 'get', 'icon' ], 'default' ],
					],
					[ 'concat', 'vsge-marker-', [ 'get', 'icon' ] ],
					DEFAULT_MARKER_IMAGE_ID,
				],
				'icon-size': sizeExpr,
				'icon-anchor': 'bottom',
				'icon-allow-overlap': true,
				'icon-ignore-placement': true,
			},
			paint: {
				'icon-color': [ 'coalesce', [ 'get', 'iconColor' ], '#004a83' ],
			},
		} );
	} else {
		map.setLayoutProperty(
			DEALER_POINTS_LAYER_ID,
			'icon-size',
			sizeExpr
		);
		map.setFilter( DEALER_POINTS_LAYER_ID, isTemplateFilter );
	}

	// Ensure custom layer is always beneath template layer (renders first)
	if (
		map.getLayer( DEALER_CUSTOM_LAYER_ID ) &&
		map.getLayer( DEALER_POINTS_LAYER_ID )
	) {
		try {
			map.moveLayer( DEALER_CUSTOM_LAYER_ID, DEALER_POINTS_LAYER_ID );
		} catch {
			// Layer ordering is best-effort; ignore if not possible
		}
	}

	// Suppress unused-variable warning for customImageIds — it documents the image keys
	void customImageIds;
}

/**
 * Idempotently ensures images, source, and style layers exist for the given Map instance.
 * Safe to call on map 'load', 'style.load', or style updates.
 *
 * @param map              The Mapbox Map instance.
 * @param listings         Active listings.
 * @param icons            Configured custom marker icons.
 * @param selectedDealerId Currently selected dealer ID.
 */
export async function ensureDealerResources(
	map: mapboxgl.Map,
	listings: MapBoxListing[],
	icons?: MarkerIcon[],
	selectedDealerId: number | null = null
): Promise< void > {
	if ( ! map ) {
		return;
	}
	await ensureDealerImages( map, icons, listings );
	ensureDealerSource( map, listings );
	ensureDealerLayers( map, selectedDealerId, icons );
}
