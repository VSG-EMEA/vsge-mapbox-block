import './style/frontend.scss';

import { createRoot, Suspense } from '@wordpress/element';
import { MapProvider } from './components/Mapbox/MapboxContext';
import type { MapAttributes } from './types';
import Loader from './components/Loader';
import { getMapDefaults } from './utils';

const isEnabled = ( value: unknown ): boolean =>
	value === true || value === 'true';

export function parseBlockAttributes( mapElement: HTMLElement ): MapAttributes {
	const payload = mapElement.querySelector(
		':scope > script.vsge-mapbox-data'
	)?.textContent;
	let rawAttributes: Record< string, unknown > = {
		...mapElement.dataset,
	};
	if ( payload ) {
		try {
			rawAttributes = JSON.parse( payload ) as Record< string, unknown >;
		} catch ( error ) {
			// Keep rendering legacy data attributes if a malformed payload is encountered.
			// eslint-disable-next-line no-console
			console.error( 'Unable to read Mapbox block data.', error );
		}
	}
	return {
		...rawAttributes,
		mapboxOptions: ( typeof rawAttributes.mapboxOptions === 'string'
			? JSON.parse( rawAttributes.mapboxOptions )
			: rawAttributes.mapboxOptions || {
					listings: [],
					tags: [],
					filters: [],
					icons: [],
			  } ) as MapAttributes[ 'mapboxOptions' ],
		align: String( rawAttributes.align || 'center' ),
		bearing: Number( rawAttributes.bearing || 0 ),
		elevation: isEnabled( rawAttributes.elevation ),
		freeViewCamera: isEnabled( rawAttributes.freeViewCamera ),
		mapProjection: String( rawAttributes.mapProjection || 'mercator' ),
		latitude: Number( rawAttributes.latitude || 0 ),
		longitude: Number( rawAttributes.longitude || 0 ),
		pitch: Number( rawAttributes.pitch || 0 ),
		sidebarEnabled: isEnabled( rawAttributes.sidebarEnabled ),
		fitView: isEnabled( rawAttributes.fitView ),
		geocoderEnabled: isEnabled( rawAttributes.geocoderEnabled ),
		tagsEnabled: isEnabled( rawAttributes.tagsEnabled ),
		filtersEnabled: isEnabled( rawAttributes.filtersEnabled ),
		mapHeight: String( rawAttributes.mapHeight || '100vh' ),
		mapStyle:
			String( rawAttributes.mapStyle || '' ) ||
			'mapbox://styles/mapbox/streets-v11',
		mapZoom: Number( rawAttributes.mapZoom || 0 ),
		mouseWheelZoom: isEnabled( rawAttributes.mouseWheelZoom ),
	};
}

/**
 * Creates a React component that renders a MapBox map with given attributes.
 * Both the Mapbox runtime and MapBox component chunks are downloaded in parallel.
 *
 * @param {HTMLElement}   el         - The HTML element where the map will be rendered.
 * @param {MapAttributes} attributes - Configuration options for the MapBox component.
 */
export async function createMapRoot(
	el: HTMLElement,
	attributes: MapAttributes
): Promise< void > {
	// Parallel download of runtime and component chunks without waterfall
	const [ mapboxglModule, mapboxComponentModule ] = await Promise.all( [
		import( /* webpackChunkName: "mapbox" */ 'mapbox-gl' ),
		import( './components/Mapbox/index' ),
	] );

	// Guard against unmounted/detached element after async imports
	if ( ! el.isConnected ) {
		return;
	}

	const MapBoxComponent = mapboxComponentModule.MapBox;
	const mapboxgl = ( mapboxglModule.default ?? mapboxglModule ) as any;

	const componentRoot = createRoot( el );
	componentRoot.render(
		<Suspense fallback={ <Loader wrapperHeight={ '50vh' } /> }>
			<MapProvider attributes={ attributes }>
				<MapBoxComponent
					mapboxgl={ mapboxgl }
					attributes={ attributes }
					mapDefaults={ getMapDefaults() }
				/>
			</MapProvider>
		</Suspense>
	);
}

const elementStatusMap = new WeakMap<
	HTMLElement,
	'initializing' | 'initialized' | 'failed'
>();

/**
 * Idempotently initializes a single Mapbox block root.
 *
 * @param {HTMLElement} mapElement - The Mapbox block root container.
 */
export function initMapboxBlock( mapElement: HTMLElement ): void {
	const currentStatus = elementStatusMap.get( mapElement );
	if ( currentStatus ) {
		// Already initializing, initialized, or failed; prevent duplicate runs and infinite retries
		return;
	}

	if ( ! mapElement.isConnected ) {
		elementStatusMap.set( mapElement, 'failed' );
		return;
	}

	elementStatusMap.set( mapElement, 'initializing' );

	let attributes: MapAttributes;
	try {
		attributes = parseBlockAttributes( mapElement );
	} catch ( error ) {
		elementStatusMap.set( mapElement, 'failed' );
		// eslint-disable-next-line no-console
		console.error(
			'VSGE Mapbox: Failed to parse block attributes.',
			error
		);
		return;
	}

	createMapRoot( mapElement, attributes )
		.then( () => {
			if ( mapElement.isConnected ) {
				elementStatusMap.set( mapElement, 'initialized' );
			} else {
				elementStatusMap.set( mapElement, 'failed' );
			}
		} )
		.catch( ( error ) => {
			elementStatusMap.set( mapElement, 'failed' );
			// eslint-disable-next-line no-console
			console.error(
				'VSGE Mapbox: Failed to initialize map root.',
				error
			);
		} );
}

/**
 * Sets up viewport-aware lazy initialization for all frontend Mapbox blocks using
 * a shared IntersectionObserver with a 400px preload margin, with immediate fallback
 * when IntersectionObserver is unsupported.
 */
export function initFrontendMaps(): void {
	const mapboxElements = document.querySelectorAll< HTMLElement >(
		'.wp-block-vsge-mapbox'
	);

	if ( mapboxElements.length === 0 ) {
		return;
	}

	if ( ! ( 'IntersectionObserver' in window ) ) {
		// Immediate fallback for environments without IntersectionObserver
		mapboxElements.forEach( ( el ) => initMapboxBlock( el ) );
		return;
	}

	// Shared IntersectionObserver with 400px preload margin
	const observer = new IntersectionObserver(
		( entries ) => {
			entries.forEach( ( entry ) => {
				if ( entry.isIntersecting || entry.intersectionRatio > 0 ) {
					const target = entry.target as HTMLElement;
					observer.unobserve( target );
					initMapboxBlock( target );
				}
			} );
		},
		{
			rootMargin: '400px 0px',
		}
	);

	mapboxElements.forEach( ( el ) => {
		if ( ! elementStatusMap.has( el ) ) {
			observer.observe( el );
		}
	} );
}

if ( typeof document !== 'undefined' ) {
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initFrontendMaps );
	} else {
		initFrontendMaps();
	}
}
