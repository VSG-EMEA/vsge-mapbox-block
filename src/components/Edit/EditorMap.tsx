import {
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
} from '@wordpress/element';
import mapboxgl from 'mapbox-gl';
import type { GeoJSONSource, ProjectionSpecification } from 'mapbox-gl';
import type {
	CoordinatesDef,
	MapAttributes,
	MapBoxListing,
	MapboxBlockDefaults,
} from '../../types';
import { getMapStyleUrl, toFeatureCollection } from '../../utils/dataset';

const SOURCE_ID = 'vsge-editor-listings';
const POINT_LAYER_ID = 'vsge-editor-listing-points';
const SELECTED_LAYER_ID = 'vsge-editor-selected-listing';
type EditorMapProps = {
	attributes: MapAttributes;
	defaults: MapboxBlockDefaults;
	selectedId: number | null;
	onSelect: ( id: number ) => void;
	onMapClick: ( coordinates: CoordinatesDef ) => void;
};

/**
 * The editor intentionally uses one GeoJSON source and two style layers. It never
 * creates DOM markers or React roots for listings.
 */
export function EditorMap( {
	attributes,
	defaults,
	selectedId,
	onSelect,
	onMapClick,
}: EditorMapProps ): JSX.Element {
	const containerRef = useRef< HTMLDivElement >( null );
	const mapRef = useRef< mapboxgl.Map | null >( null );
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

	useLayoutEffect( () => {
		if (
			! containerRef.current ||
			mapRef.current ||
			! defaults.accessToken
		) {
			return;
		}
		const map = new mapboxgl.Map( {
			container: containerRef.current,
			accessToken: defaults.accessToken,
			style: getMapStyleUrl( attributes.mapStyle ),
			center: [ attributes.longitude, attributes.latitude ],
			zoom: attributes.mapZoom,
			bearing: attributes.bearing,
			pitch: attributes.pitch,
			projection:
				attributes.mapProjection as unknown as ProjectionSpecification,
		} );
		mapRef.current = map;
		map.on( 'load', () => {
			map.addSource( SOURCE_ID, {
				type: 'geojson',
				data: featureCollection,
			} );
			map.addLayer( {
				id: POINT_LAYER_ID,
				type: 'circle',
				source: SOURCE_ID,
				paint: {
					'circle-radius': [ 'coalesce', [ 'get', 'iconSize' ], 8 ],
					'circle-color': [
						'coalesce',
						[ 'get', 'iconColor' ],
						'#1365b8',
					],
					'circle-stroke-color': '#ffffff',
					'circle-stroke-width': 1,
				},
			} );
			map.addLayer( {
				id: SELECTED_LAYER_ID,
				type: 'circle',
				source: SOURCE_ID,
				filter: [ '==', [ 'id' ], -1 ],
				paint: {
					'circle-radius': 12,
					'circle-color': 'transparent',
					'circle-stroke-color': '#111111',
					'circle-stroke-width': 3,
				},
			} );
		} );
		map.on( 'click', ( event ) => {
			const feature = map.queryRenderedFeatures( event.point, {
				layers: [ POINT_LAYER_ID ],
			} )[ 0 ];
			if ( typeof feature?.id === 'number' ) {
				onSelect( feature.id );
				return;
			}
			onMapClick( [ event.lngLat.lng, event.lngLat.lat ] );
		} );
		return () => {
			map.remove();
			mapRef.current = null;
		};
	}, [ defaults.accessToken, attributes.mapStyle ] );

	useEffect( () => {
		const source = mapRef.current?.getSource( SOURCE_ID ) as
			| GeoJSONSource
			| undefined;
		if ( source ) {
			source.setData( featureCollection );
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
		mapRef.current.setProjection(
			attributes.mapProjection as unknown as ProjectionSpecification
		);
	}, [
		attributes.longitude,
		attributes.latitude,
		attributes.mapZoom,
		attributes.bearing,
		attributes.pitch,
		attributes.mapProjection,
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

	if ( ! defaults.accessToken ) {
		return <p>Mapbox is not configured.</p>;
	}
	return <div className="map vsge-mapbox-editor-map" ref={ containerRef } />;
}
