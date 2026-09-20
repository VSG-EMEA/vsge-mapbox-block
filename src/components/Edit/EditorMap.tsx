import { useEffect, useMemo, useRef } from '@wordpress/element';
import { useRefEffect } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import type { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl';
import type {
	CoordinatesDef,
	MapAttributes,
	MapBoxListing,
	MapboxBlockDefaults,
} from '../../types';
import { getMapStyleUrl, toFeatureCollection } from '../../utils/dataset';
import { getEffectiveProjection } from '../../utils/projection';

const SOURCE_ID = 'vsge-editor-listings';
const POINT_LAYER_ID = 'vsge-editor-listing-points';
const SELECTED_LAYER_ID = 'vsge-editor-selected-listing';
const CLICK_INDICATOR_SOURCE_ID = 'vsge-editor-click-indicator';
const CLICK_INDICATOR_LAYER_ID = 'vsge-editor-click-indicator';

function toClickIndicatorGeoJson( coords: CoordinatesDef | null ) {
	if ( ! coords ) {
		return {
			type: 'FeatureCollection' as const,
			features: [],
		};
	}
	return {
		type: 'FeatureCollection' as const,
		features: [
			{
				type: 'Feature' as const,
				geometry: {
					type: 'Point' as const,
					coordinates: coords,
				},
				properties: {},
			},
		],
	};
}

const EDITOR_POINT_RADIUS = [
	'interpolate',
	[ 'linear' ],
	[ 'zoom' ],
	3,
	[
		'interpolate',
		[ 'linear' ],
		[ 'coalesce', [ 'get', 'iconSize' ], 48 ],
		24,
		4,
		48,
		6,
		72,
		8,
	],
	6,
	[
		'interpolate',
		[ 'linear' ],
		[ 'coalesce', [ 'get', 'iconSize' ], 48 ],
		24,
		5,
		48,
		8,
		72,
		10,
	],
	10,
	[
		'interpolate',
		[ 'linear' ],
		[ 'coalesce', [ 'get', 'iconSize' ], 48 ],
		24,
		6,
		48,
		10,
		72,
		12,
	],
];

const EDITOR_SELECTED_RADIUS = [
	'interpolate',
	[ 'linear' ],
	[ 'zoom' ],
	3,
	[
		'interpolate',
		[ 'linear' ],
		[ 'coalesce', [ 'get', 'iconSize' ], 48 ],
		24,
		7,
		48,
		9,
		72,
		11,
	],
	6,
	[
		'interpolate',
		[ 'linear' ],
		[ 'coalesce', [ 'get', 'iconSize' ], 48 ],
		24,
		8,
		48,
		11,
		72,
		13,
	],
	10,
	[
		'interpolate',
		[ 'linear' ],
		[ 'coalesce', [ 'get', 'iconSize' ], 48 ],
		24,
		9,
		48,
		13,
		72,
		15,
	],
];

type EditorMapProps = {
	attributes: MapAttributes;
	defaults: MapboxBlockDefaults;
	selectedId: number | null;
	pendingCoordinates: CoordinatesDef | null;
	onSelect: ( id: number ) => void;
	onMapClick: ( coordinates: CoordinatesDef ) => void;
};

function toTargetRealm< T >(
	targetWindow: ( Window & typeof globalThis ) | null,
	obj: T
): T {
	if ( ! targetWindow?.JSON || typeof obj !== 'object' || obj === null ) {
		return obj;
	}
	return targetWindow.JSON.parse( JSON.stringify( obj ) );
}

/**
 * The editor intentionally uses one GeoJSON source and two style layers. It never
 * creates DOM markers or React roots for listings.
 */
export function EditorMap( {
	attributes,
	defaults,
	selectedId,
	pendingCoordinates,
	onSelect,
	onMapClick,
}: EditorMapProps ): JSX.Element {
	const mapRef = useRef< MapboxMap | null >( null );
	const spatialSnapshot = useMemo(
		() =>
			JSON.stringify(
				attributes.mapboxOptions.listings.map( ( listing ) => ( {
					id: listing.id,
					type: listing.type,
					geometry: listing.geometry,
					properties: {
						iconColor: listing.properties.iconColor,
						iconSize: listing.properties.iconSize,
					},
				} ) )
			),
		[ attributes.mapboxOptions.listings ]
	);
	const featureCollection = useMemo(
		() =>
			toFeatureCollection(
				JSON.parse( spatialSnapshot ) as MapBoxListing[]
			),
		[ spatialSnapshot ]
	);

	const attributesRef = useRef( attributes );
	attributesRef.current = attributes;
	const featureCollectionRef = useRef( featureCollection );
	featureCollectionRef.current = featureCollection;
	const selectedIdRef = useRef( selectedId );
	selectedIdRef.current = selectedId;
	const pendingCoordinatesRef = useRef( pendingCoordinates );
	pendingCoordinatesRef.current = pendingCoordinates;

	const containerRef = useRefEffect< HTMLDivElement >(
		( node ) => {
			if ( ! defaults.accessToken ) {
				return;
			}

			const targetDocument = node.ownerDocument;
			const targetWindow = targetDocument?.defaultView ?? null;

			// Strictly use the Mapbox loader from the container's realm.
			if ( ! targetWindow?.vsgeLoadMapbox ) {
				// eslint-disable-next-line no-console
				console.error(
					'VSGE Mapbox: The realm-local Mapbox loader (window.vsgeLoadMapbox) is unavailable in the editor realm.'
				);
				return;
			}

			let isDisposed = false;
			let map: MapboxMap | null = null;
			let handleResize: ( () => void ) | null = null;
			let resizeObserver: ResizeObserver | null = null;

			targetWindow
				.vsgeLoadMapbox()
				.then( ( mapboxRuntime ) => {
					if ( isDisposed || ! node.isConnected ) {
						return;
					}

					const currentAttrs = attributesRef.current;
					const effectiveProjection = toTargetRealm(
						targetWindow,
						getEffectiveProjection(
							currentAttrs.mapProjection,
							currentAttrs.elevation
						)
					);

					map = new mapboxRuntime.Map( {
						container: node,
						accessToken: defaults.accessToken,
						style: getMapStyleUrl( currentAttrs.mapStyle ),
						center: [
							currentAttrs.longitude,
							currentAttrs.latitude,
						],
						zoom: currentAttrs.mapZoom,
						bearing: currentAttrs.bearing,
						pitch: currentAttrs.pitch,
						projection: effectiveProjection,
					} );
					mapRef.current = map;

					handleResize = () => {
						map?.resize();
					};
					if ( typeof targetWindow?.ResizeObserver === 'function' ) {
						resizeObserver = new targetWindow.ResizeObserver(
							() => {
								map?.resize();
							}
						);
						resizeObserver.observe( node );
					}

					map.on( 'load', () => {
						if ( isDisposed || ! map ) {
							return;
						}
						map.addSource( SOURCE_ID, {
							type: 'geojson',
							data: toTargetRealm(
								targetWindow,
								featureCollectionRef.current
							),
						} );
						map.addLayer( {
							id: POINT_LAYER_ID,
							type: 'circle',
							source: SOURCE_ID,
							paint: {
								'circle-radius': EDITOR_POINT_RADIUS as any,
								'circle-color': [
									'coalesce',
									[ 'get', 'iconColor' ],
									'#1365b8',
								],
								'circle-stroke-color': '#ffffff',
								'circle-stroke-width': 1.5,
							},
						} );
						map.addLayer( {
							id: SELECTED_LAYER_ID,
							type: 'circle',
							source: SOURCE_ID,
							filter: [
								'==',
								[ 'id' ],
								selectedIdRef.current ?? -1,
							],
							paint: {
								'circle-radius': EDITOR_SELECTED_RADIUS as any,
								'circle-color': 'transparent',
								'circle-stroke-color': '#111111',
								'circle-stroke-width': 3,
							},
						} );
						map.addSource( CLICK_INDICATOR_SOURCE_ID, {
							type: 'geojson',
							data: toTargetRealm(
								targetWindow,
								toClickIndicatorGeoJson(
									pendingCoordinatesRef.current
								)
							),
						} );
						map.addLayer( {
							id: CLICK_INDICATOR_LAYER_ID,
							type: 'circle',
							source: CLICK_INDICATOR_SOURCE_ID,
							paint: {
								'circle-radius': 8,
								'circle-color': '#f59e0b',
								'circle-opacity': 0.35,
								'circle-stroke-color': '#d97706',
								'circle-stroke-width': 2,
							},
						} );
					} );

					map.on( 'mouseenter', POINT_LAYER_ID, () => {
						if ( map ) {
							map.getCanvas().style.cursor = 'pointer';
						}
					} );
					map.on( 'mouseleave', POINT_LAYER_ID, () => {
						if ( map ) {
							map.getCanvas().style.cursor = '';
						}
					} );

					map.on( 'click', ( event ) => {
						if ( ! map ) {
							return;
						}
						const bbox: [ [ number, number ], [ number, number ] ] =
							[
								[ event.point.x - 6, event.point.y - 6 ],
								[ event.point.x + 6, event.point.y + 6 ],
							];
						const features = map.queryRenderedFeatures( bbox, {
							layers: [ POINT_LAYER_ID ],
						} );
						const feature = features[ 0 ];
						if ( typeof feature?.id === 'number' ) {
							onSelect( feature.id );
							return;
						}
						onMapClick( [ event.lngLat.lng, event.lngLat.lat ] );
					} );
				} )
				.catch( ( error ) => {
					// eslint-disable-next-line no-console
					console.error(
						'VSGE Mapbox: Failed to load Mapbox runtime in editor realm.',
						error
					);
				} );

			return () => {
				isDisposed = true;
				if ( resizeObserver ) {
					resizeObserver.disconnect();
					resizeObserver = null;
				}
				if ( handleResize && targetWindow ) {
					targetWindow.removeEventListener( 'resize', handleResize );
				}
				if ( map ) {
					map.remove();
					map = null;
				}
				mapRef.current = null;
			};
		},
		[ defaults.accessToken, attributes.mapStyle ]
	);

	useEffect( () => {
		const source = mapRef.current?.getSource( SOURCE_ID ) as
			| GeoJSONSource
			| undefined;
		if ( source ) {
			const targetWin =
				mapRef.current?.getContainer()?.ownerDocument?.defaultView ??
				null;
			source.setData( toTargetRealm( targetWin, featureCollection ) );
		}
	}, [ featureCollection ] );

	useEffect( () => {
		if ( ! mapRef.current ) {
			return;
		}
		mapRef.current.jumpTo( {
			center: [ attributes.longitude, attributes.latitude ],
			zoom: attributes.mapZoom,
			bearing: attributes.bearing,
			pitch: attributes.pitch,
		} );
		const targetWin =
			mapRef.current?.getContainer()?.ownerDocument?.defaultView ?? null;
		mapRef.current.setProjection(
			toTargetRealm(
				targetWin,
				getEffectiveProjection(
					attributes.mapProjection,
					attributes.elevation
				)
			)
		);
	}, [
		attributes.longitude,
		attributes.latitude,
		attributes.mapZoom,
		attributes.bearing,
		attributes.pitch,
		attributes.mapProjection,
		attributes.elevation,
	] );

	useEffect( () => {
		if ( mapRef.current?.getLayer( SELECTED_LAYER_ID ) ) {
			mapRef.current.setFilter( SELECTED_LAYER_ID, [
				'==',
				[ 'id' ],
				selectedId ?? -1,
			] );
		}
	}, [ selectedId ] );

	useEffect( () => {
		const source = mapRef.current?.getSource(
			CLICK_INDICATOR_SOURCE_ID
		) as GeoJSONSource | undefined;
		if ( source ) {
			const targetWin =
				mapRef.current?.getContainer()?.ownerDocument?.defaultView ??
				null;
			source.setData(
				toTargetRealm(
					targetWin,
					toClickIndicatorGeoJson( pendingCoordinates )
				)
			);
		}
	}, [ pendingCoordinates ] );

	if ( ! defaults.accessToken ) {
		return (
			<p>{ __( 'Mapbox is not configured.', 'vsge-mapbox-block' ) }</p>
		);
	}
	return <div className="map vsge-mapbox-editor-map" ref={ containerRef } />;
}
