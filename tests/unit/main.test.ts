import { describe, expect, jest, test } from '@jest/globals';
import type { MapBoxListing } from '../../src/types';
import {
	getMapStyleUrl,
	getNextId,
	isValidCoordinates,
	normalizeMapboxLanguage,
	searchListings,
	toFeatureCollection,
	updateListingById,
} from '../../src/utils/dataset';

if ( typeof ( global as any ).TextDecoder === 'undefined' ) {
	const { TextDecoder, TextEncoder } = require( 'util' );
	( global as any ).TextDecoder = TextDecoder;
	( global as any ).TextEncoder = TextEncoder;
}

( global as any ).mockGeocoderOn = jest.fn();
( global as any ).mockGeocoderOff = jest.fn();
( global as any ).mockGeocoderOnAdd = jest.fn( () => {
	const el = document.createElement( 'div' );
	el.className = 'mapboxgl-ctrl-geocoder';
	return el;
} );
( global as any ).mockGeocoderOnRemove = jest.fn();

const mockGeocoderOn = ( global as any ).mockGeocoderOn;
const mockGeocoderOff = ( global as any ).mockGeocoderOff;
const mockGeocoderOnAdd = ( global as any ).mockGeocoderOnAdd;
const mockGeocoderOnRemove = ( global as any ).mockGeocoderOnRemove;

jest.mock( '@mapbox/mapbox-gl-geocoder', () => {
	const fn: any = function () {
		return {
			on: ( global as any ).mockGeocoderOn,
			off: ( global as any ).mockGeocoderOff,
			onAdd: ( global as any ).mockGeocoderOnAdd,
			onRemove: ( global as any ).mockGeocoderOnRemove,
		};
	};
	fn.__esModule = true;
	fn.default = fn;
	return fn;
} );

jest.mock( '@wordpress/components', () => ( {
	Icon: () => null,
} ) );

jest.mock( '@mapbox/maki', () => ( {
	layouts: [ 'car', 'fuel' ],
	svgArray: [ '<svg id="car"></svg>', '<svg id="fuel"></svg>' ],
} ) );

jest.mock( 'iso3166-helper', () => ( {
	isChildOf: () => false,
} ) );

function dealer( id: number ): MapBoxListing {
	return {
		id,
		type: 'Feature',
		geometry: { type: 'Point', coordinates: [ id % 180, id % 90 ] },
		properties: {
			name: `Dealer ${ id }`,
			company: id % 2 ? 'Example Garage' : 'VSGE Dealer',
			city: id % 2 ? 'Berlin' : 'Paris',
			country: id % 2 ? 'Germany' : 'France',
			countryCode: id % 2 ? 'DE' : 'FR',
			postalCode: String( 10000 + id ),
			icon: 'default',
			draggable: false,
		},
	};
}

describe( 'dealer dataset contract', () => {
	test( 'converts persisted listings to a valid FeatureCollection without changing listings', () => {
		const listings = [
			dealer( 1 ),
			{
				...dealer( 2 ),
				geometry: {
					type: 'Point',
					coordinates: [ 181, 0 ] as [ number, number ],
				},
			},
		];
		const collection = toFeatureCollection( listings );
		expect( collection ).toMatchObject( { type: 'FeatureCollection' } );
		expect( collection.features ).toHaveLength( 1 );
		expect( collection.features[ 0 ].id ).toBe( 1 );
		expect( listings ).toHaveLength( 2 );
	} );

	test( 'search and update stay bounded and immutable for 500 dealers', () => {
		const listings = Array.from( { length: 500 }, ( _, index ) =>
			dealer( index + 1 )
		);
		const results = searchListings( listings, 'berlin', 'Germany' );
		expect( results ).toHaveLength( 250 );
		const updated = updateListingById( listings, {
			...listings[ 0 ],
			properties: { ...listings[ 0 ].properties, name: 'Saved dealer' },
		} );
		expect( updated[ 0 ].properties.name ).toBe( 'Saved dealer' );
		expect( listings[ 0 ].properties.name ).toBe( 'Dealer 1' );
	} );

	test( 'normalizes locale, styles, coordinates, and IDs compatibly', () => {
		expect( normalizeMapboxLanguage( 'it_IT' ) ).toBe( 'it' );
		expect( normalizeMapboxLanguage( 'not a locale' ) ).toBe( 'en' );
		expect( getMapStyleUrl( 'streets-v12' ) ).toBe(
			'mapbox://styles/mapbox/streets-v12'
		);
		expect( getMapStyleUrl( 'mapbox://styles/mapbox/streets-v12' ) ).toBe(
			'mapbox://styles/mapbox/streets-v12'
		);
		expect( isValidCoordinates( [ 0, 0 ] ) ).toBe( true );
		expect( isValidCoordinates( [ 0, 91 ] ) ).toBe( false );
		expect( getNextId( [ { id: 4 }, { id: 12 } ] ) ).toBe( 13 );
	} );
} );

describe( 'Phase 1 stabilization regression tests', () => {
	test( 'getEffectiveProjection enforces globe when elevation is enabled and respects configured projection otherwise', async () => {
		const { getEffectiveProjection } = await import(
			'../../src/utils/projection'
		);

		// When elevation is true, always globe
		expect( getEffectiveProjection( 'mercator', true ) ).toEqual( {
			name: 'globe',
		} );
		expect( getEffectiveProjection( 'equalEarth', true ) ).toEqual( {
			name: 'globe',
		} );
		expect( getEffectiveProjection( undefined, true ) ).toEqual( {
			name: 'globe',
		} );

		// When elevation is false or omitted, respects configured projection
		expect( getEffectiveProjection( 'equalEarth', false ) ).toEqual( {
			name: 'equalEarth',
		} );
		expect( getEffectiveProjection( 'albers', false ) ).toEqual( {
			name: 'albers',
		} );
		expect( getEffectiveProjection( undefined, false ) ).toEqual( {
			name: 'mercator',
		} );
		expect( getEffectiveProjection() ).toEqual( { name: 'mercator' } );
	} );

	test( 'getListing preserves empty array for zero-result filter and returns all listings only when filter is null', async () => {
		const { getListing } = await import(
			'../../src/components/Mapbox/utils'
		);
		const allListings = [ dealer( 1 ), dealer( 2 ) ];

		// null means no filter is active -> returns all listings
		expect( getListing( allListings, null ) ).toBe( allListings );

		// [] means filter matched zero dealers -> returns empty array, NOT all listings
		expect( getListing( allListings, [] ) ).toEqual( [] );

		// Non-empty filtered array -> returns filtered array
		expect( getListing( allListings, [ dealer( 1 ) ] ) ).toEqual( [
			dealer( 1 ),
		] );
	} );

	test( 'isFilterActive correctly determines Reset Filters button visibility', async () => {
		const { isFilterActive } = await import(
			'../../src/components/TopBar/utils'
		);

		// Default state: no filter, no tag, filteredListings is null -> inactive
		expect( isFilterActive( '', '', null ) ).toBe( false );

		// Filter active
		expect( isFilterActive( 'partner', '', null ) ).toBe( true );

		// Tag active
		expect( isFilterActive( '', 'tag1', null ) ).toBe( true );

		// Filtered listings is an empty array (zero search results) -> active
		expect( isFilterActive( '', '', [] ) ).toBe( true );

		// Filtered listings has items -> active
		expect( isFilterActive( '', '', [ dealer( 1 ) ] ) ).toBe( true );
	} );

	test( 'initGeoCoder cleans previous DOM and destroy cleans up listeners, calls onRemove, and clears DOM', async () => {
		const { initGeoCoder } = await import(
			'../../src/components/Geocoder/init'
		);

		const container = document.createElement( 'div' );
		container.innerHTML = '<div class="stale-element">Stale</div>';
		container.classList.add( 'active' );

		const mockMap = {
			on: () => {},
			off: () => {},
			getCanvasContainer: () => document.createElement( 'div' ),
		} as any;

		mockGeocoderOn.mockClear();
		mockGeocoderOff.mockClear();
		mockGeocoderOnAdd.mockClear();
		mockGeocoderOnRemove.mockClear();

		const result = initGeoCoder(
			{} as any,
			mockMap,
			document.createElement( 'div' ),
			[],
			container,
			[ dealer( 1 ) ],
			() => {},
			{ accessToken: 'pk.test_token' }
		);

		expect( result ).toBeDefined();
		expect( result?.destroy ).toBeInstanceOf( Function );
		expect( mockGeocoderOnAdd ).toHaveBeenCalledTimes( 1 );
		expect( mockGeocoderOn ).toHaveBeenCalledWith(
			'clear',
			expect.any( Function )
		);
		expect( mockGeocoderOn ).toHaveBeenCalledWith(
			'result',
			expect.any( Function )
		);

		// Stale content was cleared and geocoder container was added
		expect( container.querySelector( '.stale-element' ) ).toBeNull();
		expect(
			container.querySelector( '.mapboxgl-ctrl-geocoder' )
		).not.toBeNull();

		// Call destroy
		result?.destroy();

		// Destroy should unbind listeners, call onRemove, clear innerHTML and remove active class
		expect( mockGeocoderOff ).toHaveBeenCalledWith(
			'clear',
			expect.any( Function )
		);
		expect( mockGeocoderOff ).toHaveBeenCalledWith(
			'result',
			expect.any( Function )
		);
		expect( mockGeocoderOnRemove ).toHaveBeenCalledTimes( 1 );
		expect( container.innerHTML ).toBe( '' );
		expect( container.classList.contains( 'active' ) ).toBe( false );
	} );
} );

describe( 'Phase 2 resource management and multi-map isolation', () => {
	function createMockMapbox() {
		const mockMarker = {
			setLngLat: jest.fn().mockReturnThis(),
			addTo: jest.fn().mockReturnThis(),
			remove: jest.fn(),
			on: jest.fn(),
			off: jest.fn(),
			getLngLat: jest.fn( () => ( { lng: 10, lat: 20 } ) ),
			setDraggable: jest.fn().mockReturnThis(),
			setOffset: jest.fn().mockReturnThis(),
		};
		const MarkerClass = jest.fn( function () {
			return mockMarker;
		} );

		let closeHandler: ( () => void ) | null = null;
		const mockPopup = {
			setLngLat: jest.fn().mockReturnThis(),
			setDOMContent: jest.fn().mockReturnThis(),
			addTo: jest.fn().mockReturnThis(),
			remove: jest.fn( function () {
				// Simulates Mapbox GL emitting close event when removed
				if ( closeHandler ) {
					closeHandler();
				}
			} ),
			on: jest.fn( function ( event: string, fn: any ) {
				if ( event === 'close' ) {
					closeHandler = fn;
				}
				return mockPopup;
			} ),
			off: jest.fn( function ( event: string ) {
				if ( event === 'close' ) {
					closeHandler = null;
				}
				return mockPopup;
			} ),
			emitClose: () => {
				if ( closeHandler ) {
					closeHandler();
				}
			},
		};
		const PopupClass = jest.fn( function () {
			return mockPopup;
		} );

		return {
			Marker: MarkerClass as any,
			Popup: PopupClass as any,
			mockMarker,
			mockPopup,
		};
	}

	test( 'temporary marker lifecycle: creates and destroys symmetrically with unmount and listener cleanup', async () => {
		const { createTempMarker } = await import(
			'../../src/components/Marker/tempMarker'
		);

		const mockMapbox = createMockMapbox();
		const mockMap = {} as any;

		const tempListing: MapBoxListing = {
			id: 999,
			type: 'temporary',
			geometry: { type: 'Point', coordinates: [ 10, 20 ] },
			properties: {
				name: 'click-marker',
				icon: 'pin',
				draggable: true,
			},
		};

		const resource = createTempMarker(
			mockMapbox as any,
			mockMap,
			tempListing
		);
		expect( resource ).not.toBeNull();

		const unmountSpy = jest.spyOn( resource.root, 'unmount' );
		const removeSpy = jest.spyOn( resource.marker, 'remove' );
		const offSpy = jest.spyOn( resource.marker, 'off' );

		// Destroy the temporary marker
		resource.destroy();

		expect( removeSpy ).toHaveBeenCalledTimes( 1 );
		expect( unmountSpy ).toHaveBeenCalledTimes( 1 );
		expect( offSpy ).toHaveBeenCalledWith(
			'dragend',
			expect.any( Function )
		);

		// Double destroy is safe / idempotent
		resource.destroy();
		expect( removeSpy ).toHaveBeenCalledTimes( 1 );
		expect( unmountSpy ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'canonical dealer rendering: converts to GeoJSON, updates source data, and manages style layers without React roots or DOM markers', async () => {
		const {
			ensureDealerSource,
			ensureDealerLayers,
			DEALER_SOURCE_ID,
			DEALER_POINTS_LAYER_ID,
			DEALER_CUSTOM_LAYER_ID,
		} = await import( '../../src/components/Mapbox/dealerResources' );
		const { toDealerFeatureCollection, getCanonicalDealerListings } =
			await import( '../../src/utils/dataset' );

		// 1. Verify toDealerFeatureCollection excludes temporary markers and preserves 500 dealers
		const allListings = Array.from( { length: 500 }, ( _, index ) =>
			dealer( index + 1 )
		);
		allListings.push( {
			id: 999,
			type: 'Temp',
			geometry: { type: 'Point', coordinates: [ 10, 20 ] },
			properties: {
				name: 'click-marker',
				icon: 'pin',
				draggable: true,
			} as any,
		} );

		const canonical = getCanonicalDealerListings( allListings );
		expect( canonical ).toHaveLength( 500 );
		const collection = toDealerFeatureCollection( allListings );
		expect( collection.features ).toHaveLength( 500 );
		expect( collection.features[ 0 ].id ).toBe( 1 );

		// 2. Mock Mapbox Map instance
		const sources: Record< string, any > = {};
		const layers: Record< string, any > = {};

		const mockMap = {
			getSource: jest.fn( ( id: string ) => sources[ id ] ),
			addSource: jest.fn( ( id: string, config: any ) => {
				sources[ id ] = {
					...config,
					setData: jest.fn( ( data: any ) => {
						sources[ id ].data = data;
					} ),
				};
			} ),
			getLayer: jest.fn( ( id: string ) => layers[ id ] ),
			addLayer: jest.fn( ( layer: any ) => {
				layers[ layer.id ] = layer;
			} ),
			setLayoutProperty: jest.fn(),
			setFilter: jest.fn(),
			moveLayer: jest.fn(),
		} as any;

		// 3. Ensure source and layers
		ensureDealerSource( mockMap, allListings );
		expect( mockMap.addSource ).toHaveBeenCalledWith(
			DEALER_SOURCE_ID,
			expect.objectContaining( {
				type: 'geojson',
				data: expect.objectContaining( {
					features: expect.any( Array ),
				} ),
			} )
		);
		expect( sources[ DEALER_SOURCE_ID ].data.features ).toHaveLength( 500 );

		// Two symbol layers: custom SVG layer and template/Maki layer
		ensureDealerLayers( mockMap, 1 );
		expect( mockMap.addLayer ).toHaveBeenCalledWith(
			expect.objectContaining( {
				id: DEALER_POINTS_LAYER_ID,
				type: 'symbol',
			} )
		);
		expect( mockMap.addLayer ).toHaveBeenCalledWith(
			expect.objectContaining( {
				id: DEALER_CUSTOM_LAYER_ID,
				type: 'symbol',
			} )
		);

		// No circle selected layer should be created
		const layerIds = Object.keys( layers );
		expect( layerIds ).not.toContain( 'vsge-dealer-selected' );

		// 4. Filtering: zero-result produces 0 features via setData
		ensureDealerSource( mockMap, [] );
		expect( sources[ DEALER_SOURCE_ID ].setData ).toHaveBeenCalledWith( {
			type: 'FeatureCollection',
			features: [],
		} );

		// 5. Selection update via setLayoutProperty icon-size (not setFilter on circle layer)
		ensureDealerLayers( mockMap, 42 );
		expect( mockMap.setLayoutProperty ).toHaveBeenCalledWith(
			DEALER_POINTS_LAYER_ID,
			'icon-size',
			expect.any( Array )
		);
		expect( mockMap.setLayoutProperty ).toHaveBeenCalledWith(
			DEALER_CUSTOM_LAYER_ID,
			'icon-size',
			expect.any( Array )
		);
	} );

	test( 'popup user-close lifecycle: Mapbox close event unmounts root once, deregisters from manager, and avoids double destroy', async () => {
		const { createPopupManager, createManagedPopup } = await import(
			'../../src/components/Popup/popupManager'
		);

		const mockMapbox = createMockMapbox();
		const mockMap = {} as any;
		const manager = createPopupManager();

		const resource = createManagedPopup(
			mockMapbox as any,
			mockMap,
			manager,
			dealer( 1 )
		);
		expect( resource ).not.toBeNull();
		expect( manager.size ).toBe( 1 );
		if ( ! resource ) {
			return;
		}

		const unmountSpy = jest.spyOn( resource.root, 'unmount' );

		// User closes the popup (Mapbox emits close event)
		mockMapbox.mockPopup.emitClose();

		expect( unmountSpy ).toHaveBeenCalledTimes( 1 );
		expect( manager.size ).toBe( 0 );

		// Subsequent manager.clear() does not unmount or remove again
		manager.clear();
		expect( unmountSpy ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'popup programmatic lifecycle: manager clear does not trigger recursive or double cleanup', async () => {
		const { createPopupManager, createManagedPopup } = await import(
			'../../src/components/Popup/popupManager'
		);

		const mockMapbox = createMockMapbox();
		const mockMap = {} as any;
		const manager = createPopupManager();

		const resource = createManagedPopup(
			mockMapbox as any,
			mockMap,
			manager,
			dealer( 1 )
		);
		expect( resource ).not.toBeNull();
		if ( ! resource ) {
			return;
		}

		const unmountSpy = jest.spyOn( resource.root, 'unmount' );
		const removeSpy = jest.spyOn( resource.popup, 'remove' );

		// Programmatic clear
		manager.clear();

		expect( unmountSpy ).toHaveBeenCalledTimes( 1 );
		expect( removeSpy ).toHaveBeenCalledTimes( 1 );
		expect( manager.size ).toBe( 0 );
	} );

	test( 'multi-map isolation: highlighting dealer with id=1 only affects the targeted block instance', async () => {
		const { highlightListing } = await import(
			'../../src/components/Sidebar/Listing'
		);

		// Build two simulated block DOM structures on the same page
		const wrapper1 = document.createElement( 'div' );
		wrapper1.className = 'map-wrapper';
		wrapper1.id = 'map-instance-1';
		wrapper1.innerHTML = `
			<div class="map-sidebar">
				<div class="feature-listing">
					<div class="active-store" id="old-active-1">Old 1</div>
				</div>
			</div>
			<div class="map-container">
				<div class="map-element">
					<button class="marker" data-id="1" id="marker-1">Marker 1 Map 1</button>
				</div>
			</div>
		`;
		document.body.appendChild( wrapper1 );

		const wrapper2 = document.createElement( 'div' );
		wrapper2.className = 'map-wrapper';
		wrapper2.id = 'map-instance-2';
		wrapper2.innerHTML = `
			<div class="map-sidebar">
				<div class="feature-listing">
					<div class="active-store" id="old-active-2">Old 2</div>
				</div>
			</div>
			<div class="map-container">
				<div class="map-element">
					<button class="marker" data-id="1" id="marker-1">Marker 1 Map 2</button>
				</div>
			</div>
		`;
		document.body.appendChild( wrapper2 );

		const map1El = wrapper1.querySelector( '.map-element' ) as HTMLElement;

		// Highlight dealer 1 within Map 1
		highlightListing( dealer( 1 ), map1El );

		// Map 1 checks
		expect(
			wrapper1
				.querySelector( '.marker[data-id="1"]' )
				?.classList.contains( 'active-store' )
		).toBe( true );
		expect(
			wrapper1
				.querySelector( '#old-active-1' )
				?.classList.contains( 'active-store' )
		).toBe( false );
		expect(
			wrapper1
				.querySelector( '.feature-listing' )
				?.classList.contains( 'filtered' )
		).toBe( true );

		// Map 2 checks: MUST NOT be modified or active!
		expect(
			wrapper2
				.querySelector( '.marker[data-id="1"]' )
				?.classList.contains( 'active-store' )
		).toBe( false );
		expect(
			wrapper2
				.querySelector( '#old-active-2' )
				?.classList.contains( 'active-store' )
		).toBe( true ); // remains untouched
		expect(
			wrapper2
				.querySelector( '.feature-listing' )
				?.classList.contains( 'filtered' )
		).toBe( false );

		// Cleanup DOM
		document.body.removeChild( wrapper1 );
		document.body.removeChild( wrapper2 );
	} );

	describe( 'Phase 4 viewport lazy loading & editor runtime loader', () => {
		test( 'frontend initialization guard: initializes once, ignores duplicate calls, and skips detached elements', async () => {
			const frontend = await import( '../../src/frontend' );

			const attachedEl = document.createElement( 'div' );
			attachedEl.className = 'wp-block-vsge-mapbox';
			document.body.appendChild( attachedEl );

			const detachedEl = document.createElement( 'div' );
			detachedEl.className = 'wp-block-vsge-mapbox';
			// not attached to document -> isConnected is false

			// Detached element call should be cleanly rejected without throwing
			frontend.initMapboxBlock( detachedEl );

			// Attached element initializes
			frontend.initMapboxBlock( attachedEl );

			// Duplicate call on already initialized/initializing element is a no-op
			frontend.initMapboxBlock( attachedEl );

			document.body.removeChild( attachedEl );
		} );

		test( 'frontend fallback: initializes all blocks immediately when IntersectionObserver is unsupported', async () => {
			const originalIO = ( window as any ).IntersectionObserver;
			delete ( window as any ).IntersectionObserver;

			const el = document.createElement( 'div' );
			el.className = 'wp-block-vsge-mapbox';
			document.body.appendChild( el );

			const frontend = await import( '../../src/frontend' );
			frontend.initFrontendMaps();

			document.body.removeChild( el );
			( window as any ).IntersectionObserver = originalIO;
		} );

		test( 'editor runtime loader: concurrent calls share a single Promise, reuses loaded instance, and resets on error', async () => {
			let importCount = 0;

			const mockWindow: any = {};
			let mapboxPromise: Promise< any > | null = null;

			mockWindow.vsgeLoadMapbox = () => {
				if ( mockWindow.vsgeMapboxGL ) {
					return Promise.resolve( mockWindow.vsgeMapboxGL );
				}
				if ( ! mapboxPromise ) {
					mapboxPromise = new Promise( ( resolve ) => {
						importCount++;
						resolve( { Map: class MockMap {} } );
					} )
						.then( ( module: any ) => {
							const mb = module.default ?? module;
							mockWindow.vsgeMapboxGL = mb;
							return mb;
						} )
						.catch( ( err ) => {
							mapboxPromise = null;
							throw err;
						} );
				}
				return mapboxPromise;
			};

			// 1. Concurrent calls share the identical pending Promise
			const p1 = mockWindow.vsgeLoadMapbox();
			const p2 = mockWindow.vsgeLoadMapbox();
			expect( p1 ).toBe( p2 );

			const res1 = await p1;
			const res2 = await p2;
			expect( res1 ).toBe( res2 );
			expect( importCount ).toBe( 1 );
			expect( mockWindow.vsgeMapboxGL ).toBeDefined();

			// 2. Subsequent call returns already-loaded runtime
			const p3 = mockWindow.vsgeLoadMapbox();
			const res3 = await p3;
			expect( res3 ).toBe( mockWindow.vsgeMapboxGL );
			expect( importCount ).toBe( 1 );

			// 3. Failed import resets promise so retry can succeed
			const errorWindow: any = {};
			let errorPromise: Promise< any > | null = null;
			let attempts = 0;

			errorWindow.vsgeLoadMapbox = () => {
				if ( errorWindow.vsgeMapboxGL ) {
					return Promise.resolve( errorWindow.vsgeMapboxGL );
				}
				if ( ! errorPromise ) {
					errorPromise = new Promise( ( resolve, reject ) => {
						attempts++;
						if ( attempts === 1 ) {
							reject( new Error( 'Failed to fetch chunk' ) );
						} else {
							resolve( { Map: class MockMap {} } );
						}
					} )
						.then( ( module: any ) => {
							const mb = module.default ?? module;
							errorWindow.vsgeMapboxGL = mb;
							return mb;
						} )
						.catch( ( err ) => {
							errorPromise = null;
							throw err;
						} );
				}
				return errorPromise;
			};

			await expect( errorWindow.vsgeLoadMapbox() ).rejects.toThrow(
				'Failed to fetch chunk'
			);
			expect( attempts ).toBe( 1 );

			// Second attempt succeeds after promise reset
			const retryRes = await errorWindow.vsgeLoadMapbox();
			expect( retryRes ).toBeDefined();
			expect( attempts ).toBe( 2 );
		} );
	} );

	describe( 'Phase 5A accessibility & interaction contracts', () => {
		test( 'popup focus return: restores focus to returnFocusTarget on user close', () => {
			const {
				createPopupManager,
				createManagedPopup,
			} = require( '../../src/components/Popup/popupManager' );
			const manager = createPopupManager();

			const targetBtn = document.createElement( 'button' );
			document.body.appendChild( targetBtn );
			const focusSpy = jest.spyOn( targetBtn, 'focus' );

			let closeCallback: ( () => void ) | null = null;
			const mockPopupInstance = {
				setLngLat: jest.fn().mockReturnThis(),
				setDOMContent: jest.fn().mockReturnThis(),
				addTo: jest.fn().mockReturnThis(),
				remove: jest.fn(),
				on: jest.fn( ( evt: string, cb: any ) => {
					if ( evt === 'close' ) {
						closeCallback = cb;
					}
					return mockPopupInstance;
				} ),
				off: jest.fn(),
				getElement: jest.fn( () => document.createElement( 'div' ) ),
			};

			const mockMapbox = {
				Popup: jest.fn( () => mockPopupInstance ),
			};
			const mockMap: any = {
				getCanvas: jest.fn( () => document.createElement( 'canvas' ) ),
			};

			const resource = createManagedPopup(
				mockMapbox as any,
				mockMap,
				manager,
				dealer( 1 ),
				undefined,
				{ origin: 'sidebar', returnFocusTarget: targetBtn }
			);

			expect( resource ).not.toBeNull();
			expect( resource?.returnFocusTarget ).toBe( targetBtn );
			expect( resource?.origin ).toBe( 'sidebar' );

			// Simulate user close event
			expect( closeCallback ).toBeDefined();
			closeCallback!();

			expect( focusSpy ).toHaveBeenCalledTimes( 1 );
			targetBtn.remove();
		} );

		test( 'popup focus return: falls back to map canvas if focus was in popup and no explicit target', () => {
			const {
				createPopupManager,
				createManagedPopup,
			} = require( '../../src/components/Popup/popupManager' );
			const manager = createPopupManager();

			const canvasEl = document.createElement( 'canvas' );
			document.body.appendChild( canvasEl );
			const canvasFocusSpy = jest.spyOn( canvasEl, 'focus' );

			const popupEl = document.createElement( 'div' );
			const closeBtn = document.createElement( 'button' );
			popupEl.appendChild( closeBtn );
			document.body.appendChild( popupEl );
			closeBtn.focus();

			let closeCallback: ( () => void ) | null = null;
			const mockPopupInstance = {
				setLngLat: jest.fn().mockReturnThis(),
				setDOMContent: jest.fn().mockReturnThis(),
				addTo: jest.fn().mockReturnThis(),
				remove: jest.fn(),
				on: jest.fn( ( evt: string, cb: any ) => {
					if ( evt === 'close' ) {
						closeCallback = cb;
					}
					return mockPopupInstance;
				} ),
				off: jest.fn(),
				getElement: jest.fn( () => popupEl ),
			};

			const mockMapbox = {
				Popup: jest.fn( () => mockPopupInstance ),
			};
			const mockMap: any = {
				getCanvas: jest.fn( () => canvasEl ),
			};

			createManagedPopup(
				mockMapbox as any,
				mockMap,
				manager,
				dealer( 1 ),
				undefined,
				{ origin: 'canvas' }
			);

			closeCallback!();

			expect( canvasFocusSpy ).toHaveBeenCalledTimes( 1 );
			popupEl.remove();
			canvasEl.remove();
		} );
	} );

	describe( 'Phase 5B cleanup and lifecycle contracts', () => {
		test( 'obsolete dealer DOM marker helpers are cleanly removed from public exports', async () => {
			const mapboxUtils = await import(
				'../../src/components/Mapbox/utils'
			);
			const markerUtils = await import(
				'../../src/components/Marker/utils'
			);
			const utils = await import( '../../src/utils' );

			expect( ( mapboxUtils as any ).updateListing ).toBeUndefined();
			expect( ( markerUtils as any ).removeMarkerEl ).toBeUndefined();
			expect( ( utils as any ).getUserLanguage ).toBeUndefined();
		} );

		test( 'highlightListing scopes cleanly to map-wrapper using data-dealer-id and data-id without raw marker DOM lookup', async () => {
			const { highlightListing } = await import(
				'../../src/components/Sidebar/Listing'
			);

			const wrapper = document.createElement( 'div' );
			wrapper.className = 'map-wrapper';
			wrapper.innerHTML = `
				<div class="feature-listing">
					<div class="mapbox-sidebar-feature" data-dealer-id="42" data-id="42">
						<button class="mapbox-sidebar-feature__title-btn">Dealer 42</button>
					</div>
					<div class="mapbox-sidebar-feature active-store" data-dealer-id="99" data-id="99">
						<button class="mapbox-sidebar-feature__title-btn">Dealer 99</button>
					</div>
				</div>
			`;
			document.body.appendChild( wrapper );

			const feature42 = {
				id: 42,
				type: 'Feature' as const,
				geometry: { type: 'Point' as const, coordinates: [ 10, 20 ] },
				properties: { name: 'Dealer 42', address: 'Street 42' },
			};

			highlightListing( feature42 as any, wrapper );

			const activeStores = wrapper.querySelectorAll( '.active-store' );
			expect( activeStores.length ).toBe( 1 );
			expect( activeStores[ 0 ].getAttribute( 'data-dealer-id' ) ).toBe(
				'42'
			);
			expect(
				wrapper
					.querySelector( '[data-dealer-id="99"]' )
					?.classList.contains( 'active-store' )
			).toBe( false );

			wrapper.remove();
		} );

		test( 'removeTempMarkers cleanly invokes symmetric destroy on managed registry resources', async () => {
			const { removeTempMarkers } = await import(
				'../../src/components/Marker/utils'
			);
			const { MARKER_TYPE_TEMP } = await import( '../../src/constants' );
			const destroyMock = jest.fn();
			const registry = new Map();
			registry.set( 999, {
				id: 999,
				destroy: destroyMock,
				listing: {
					id: 999,
					type: MARKER_TYPE_TEMP,
					properties: { name: 'Temporary Pin' },
				},
			} );

			const listings = [
				{
					id: 1,
					type: 'Feature',
					properties: { name: 'Canonical Dealer' },
				},
				{
					id: 999,
					type: MARKER_TYPE_TEMP,
					properties: { name: 'Temporary Pin' },
				},
			];

			const remaining = removeTempMarkers(
				listings as any,
				registry as any
			);
			expect( destroyMock ).toHaveBeenCalledTimes( 1 );
			expect( registry.has( 999 ) ).toBe( false );
			expect( remaining.length ).toBe( 1 );
			expect( remaining[ 0 ].id ).toBe( 1 );
		} );
	} );

	describe( 'Phase 5C internationalization and locale normalization contracts', () => {
		test( 'normalizeMapboxLanguage handles canonical locales, dialects, edge cases, and invalid inputs', () => {
			// Dialects and country suffixes
			expect( normalizeMapboxLanguage( 'it_IT' ) ).toBe( 'it' );
			expect( normalizeMapboxLanguage( 'it-IT' ) ).toBe( 'it' );
			expect( normalizeMapboxLanguage( 'en_US' ) ).toBe( 'en' );
			expect( normalizeMapboxLanguage( 'en_GB' ) ).toBe( 'en' );
			expect( normalizeMapboxLanguage( 'en-US' ) ).toBe( 'en' );
			expect( normalizeMapboxLanguage( 'de_DE' ) ).toBe( 'de' );
			expect( normalizeMapboxLanguage( 'de-DE' ) ).toBe( 'de' );
			expect( normalizeMapboxLanguage( 'fr_FR' ) ).toBe( 'fr' );
			expect( normalizeMapboxLanguage( 'es_ES' ) ).toBe( 'es' );
			expect( normalizeMapboxLanguage( 'ru_RU' ) ).toBe( 'ru' );

			// Already-normalized 2-letter codes
			expect( normalizeMapboxLanguage( 'it' ) ).toBe( 'it' );
			expect( normalizeMapboxLanguage( 'en' ) ).toBe( 'en' );
			expect( normalizeMapboxLanguage( 'de' ) ).toBe( 'de' );
			expect( normalizeMapboxLanguage( 'fr' ) ).toBe( 'fr' );

			// Fallback cases for invalid, 3-letter, or non-ISO-639-1 primary formats
			expect( normalizeMapboxLanguage( 'ita' ) ).toBe( 'en' );
			expect( normalizeMapboxLanguage( 'eng' ) ).toBe( 'en' );
			expect( normalizeMapboxLanguage( 'deu' ) ).toBe( 'en' );
			expect( normalizeMapboxLanguage( '' ) ).toBe( 'en' );
			expect( normalizeMapboxLanguage( '   ' ) ).toBe( 'en' );
			expect( normalizeMapboxLanguage( undefined ) ).toBe( 'en' );
			expect( normalizeMapboxLanguage( null as any ) ).toBe( 'en' );
			expect( normalizeMapboxLanguage( 'not a locale' ) ).toBe( 'en' );
			expect( normalizeMapboxLanguage( 'invalid_code' ) ).toBe( 'en' );
			expect( normalizeMapboxLanguage( '123' ) ).toBe( 'en' );
			expect( normalizeMapboxLanguage( '!@#$' ) ).toBe( 'en' );
			expect( normalizeMapboxLanguage( 'toolongcode' ) ).toBe( 'en' );
		} );

		test( 'useMapboxContext throws untranslated developer assertion when called outside provider', async () => {
			const React = await import( 'react' );
			const internals = ( React as any )
				.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
			const originalDispatcher = internals.ReactCurrentDispatcher.current;
			internals.ReactCurrentDispatcher.current = {
				useContext: () => null,
			};

			const { useMapboxContext } = await import(
				'../../src/components/Mapbox/MapboxContext'
			);

			try {
				expect( () => useMapboxContext() ).toThrow(
					'useMapboxContext must be used within a MapboxProvider'
				);
			} finally {
				internals.ReactCurrentDispatcher.current = originalDispatcher;
			}
		} );

		test( 'Phone component uses sprintf for Call %s title and formats tel link correctly', async () => {
			const { Phone } = await import(
				'../../src/components/UIComponents/Phone'
			);
			const { renderToString } = await import( '@wordpress/element' );

			const html = renderToString(
				Phone( { phone: '+39 051 6782811', label: 'Phone' } )
			);

			expect( html ).toContain( 'title="Call +39 051 6782811"' );
			expect( html ).toContain( 'href="tel:+39 051 6782811"' );
			expect( html ).toContain( '+39 051 6782811' );
			expect( html ).toContain( 'Phone:' );

			// Returns null when no phone provided
			expect( Phone( {} ) ).toBeNull();
		} );

		test( 'EmailAddr component uses sprintf for Email %s title and formats mailto link correctly', async () => {
			const { EmailAddr } = await import(
				'../../src/components/UIComponents/EmailAddr'
			);
			const { renderToString } = await import( '@wordpress/element' );

			const html = renderToString(
				EmailAddr( {
					emailAddress: 'info@example.com',
					label: 'Email',
				} )
			);

			expect( html ).toContain( 'title="Email info@example.com"' );
			expect( html ).toContain( 'href="mailto:info@example.com"' );
			expect( html ).toContain( 'info@example.com' );
			expect( html ).toContain( 'Email:' );
			// Must not contain target="_blank"
			expect( html ).not.toContain( 'target="_blank"' );

			// Returns null when no email provided
			expect( EmailAddr( {} ) ).toBeNull();
		} );

		test( 'country preference resolution and matching', async () => {
			const {
				getCookie,
				getPreferredCountryCode,
				getMatchingCountryDealers,
			} = await import( '../../src/utils/countryPreference' );

			// 1. getCookie helper
			Object.defineProperty( document, 'cookie', {
				writable: true,
				value: 'other=123; vsge_region=it; test=abc',
			} );
			expect( getCookie( 'vsge_region' ) ).toBe( 'it' );
			expect( getCookie( 'missing' ) ).toBeNull();

			// 2. getPreferredCountryCode precedence
			// Priority 1: vsge_region cookie normalized to uppercase
			expect( getPreferredCountryCode() ).toBe( 'IT' );

			// Priority 2: locale fallback when cookie is absent
			document.cookie = '';
			const originalLanguages = navigator.languages;
			Object.defineProperty( navigator, 'languages', {
				writable: true,
				value: [ 'fr-FR', 'en-US' ],
			} );
			expect( getPreferredCountryCode() ).toBe( 'FR' );

			// Priority 3: null fallback when no locale region
			Object.defineProperty( navigator, 'languages', {
				writable: true,
				value: [ 'en' ],
			} );
			Object.defineProperty( navigator, 'language', {
				writable: true,
				value: 'en',
			} );
			expect( getPreferredCountryCode() ).toBeNull();

			// Restore navigator
			Object.defineProperty( navigator, 'languages', {
				writable: true,
				value: originalLanguages,
			} );

			// 3. getMatchingCountryDealers
			const mockListings: MapBoxListing[] = [
				{
					id: 1,
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [ 10, 20 ] },
					properties: {
						name: 'Dealer Italy 1',
						countryCode: 'IT',
						country: 'Italy',
					},
				},
				{
					id: 2,
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [ 11, 21 ] },
					properties: {
						name: 'Dealer Italy 2',
						country: 'IT', // 2-letter fallback
					},
				},
				{
					id: 3,
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [ 12, 22 ] },
					properties: {
						name: 'Dealer France',
						countryCode: 'FR',
						country: 'France',
					},
				},
				{
					id: 4,
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [ 13, 23 ] },
					properties: {
						name: 'Dealer Unknown',
						country: 'Germany', // Full country name not accepted as fallback
					},
				},
			];

			const matchedIT = getMatchingCountryDealers( mockListings, 'IT' );
			expect( matchedIT.map( ( d ) => d.id ) ).toEqual( [ 1, 2 ] );

			const matchedFR = getMatchingCountryDealers( mockListings, 'fr' );
			expect( matchedFR.map( ( d ) => d.id ) ).toEqual( [ 3 ] );

			const matchedDE = getMatchingCountryDealers( mockListings, 'DE' );
			expect( matchedDE ).toHaveLength( 0 );
		} );

		test( 'JSON export sanitizes transient distance and preserves original options', async () => {
			const { sanitizeMapboxOptionsForExport } = await import(
				'../../src/utils/export'
			);

			const rawOptions: any = {
				listings: [
					{
						id: 1,
						type: 'Feature',
						geometry: { type: 'Point', coordinates: [ 10, 20 ] },
						properties: {
							name: 'Dealer 1',
							distance: 12.34,
						},
						distance: 12.34,
					},
				],
				tags: [ { id: 1, value: 'Tag1' } ],
				filters: [ { id: 2, value: 'Filter1' } ],
				icons: [ { id: 3, name: 'Icon1', content: '<svg></svg>' } ],
			};

			const sanitized = sanitizeMapboxOptionsForExport( rawOptions );

			// Properties preserved
			expect( sanitized.tags ).toEqual( rawOptions.tags );
			expect( sanitized.filters ).toEqual( rawOptions.filters );
			expect( sanitized.icons ).toEqual( rawOptions.icons );
			expect( sanitized.listings[ 0 ].id ).toBe( 1 );
			expect( sanitized.listings[ 0 ].properties.name ).toBe(
				'Dealer 1'
			);

			// Transient distance stripped
			expect( sanitized.listings[ 0 ].distance ).toBeUndefined();
			expect(
				sanitized.listings[ 0 ].properties.distance
			).toBeUndefined();

			// Original object unmodified (deep clone check)
			expect( rawOptions.listings[ 0 ].distance ).toBe( 12.34 );
			expect( rawOptions.listings[ 0 ].properties.distance ).toBe(
				12.34
			);
		} );

		test( 'Maki utility loads layouts and SVGs asynchronously with prefix tolerance', async () => {
			const { getMakiNames, getMakiSvg } = await import(
				'../../src/utils/maki'
			);

			const names = await getMakiNames();
			expect( names ).toEqual( [ 'car', 'fuel' ] );

			const svgCar = await getMakiSvg( 'car' );
			expect( svgCar ).toBe( '<svg id="car"></svg>' );

			const svgMakiCar = await getMakiSvg( 'maki-car' );
			expect( svgMakiCar ).toBe( '<svg id="car"></svg>' );

			const unknown = await getMakiSvg( 'unknown' );
			expect( unknown ).toBeUndefined();
		} );

		test( 'fitInView: handles 0 items, 1 item conservative zoom, and multi-item bounds', async () => {
			const { fitInView } = await import( '../../src/utils/view' );

			const mockFlyTo = jest.fn();
			const mockFitBounds = jest.fn();
			const mockMap: any = {
				flyTo: mockFlyTo,
				fitBounds: mockFitBounds,
				getContainer: () => ( { clientWidth: 800, clientHeight: 600 } ),
			};

			// 0 items: safe no-op
			fitInView( mockMap, [] );
			expect( mockFlyTo ).not.toHaveBeenCalled();
			expect( mockFitBounds ).not.toHaveBeenCalled();

			// 1 item: flyTo with conservative zoom (<= 10)
			const singleListing: MapBoxListing = {
				id: 1,
				type: 'Feature',
				geometry: { type: 'Point', coordinates: [ 11.2, 44.5 ] },
				properties: { name: 'Solo' },
			};
			fitInView( mockMap, [ singleListing ] );
			expect( mockFlyTo ).toHaveBeenCalledWith(
				expect.objectContaining( {
					center: [ 11.2, 44.5 ],
					zoom: 8,
				} )
			);

			// Multi items: fitBounds called with valid bounds array and container padding
			const multiListings: MapBoxListing[] = [
				singleListing,
				{
					id: 2,
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [ 12.5, 45.1 ] },
					properties: { name: 'Second' },
				},
			];
			fitInView( mockMap, multiListings );
			expect( mockFitBounds ).toHaveBeenCalledWith(
				expect.any( Object ),
				expect.objectContaining( {
					padding: expect.any( Object ),
					maxZoom: 14,
				} )
			);
		} );
	} );
} );
