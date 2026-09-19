import { expect, test } from '@wordpress/e2e-test-utils-playwright';

test( 'inserts the VSGE Mapbox block and initializes in the editor canvas realm', async ( {
	admin,
	editor,
	page,
} ) => {
	const pageErrors: Error[] = [];
	page.on( 'pageerror', ( error ) => {
		pageErrors.push( error );
	} );

	const scriptRequests: { url: string; frame: string }[] = [];
	page.on( 'request', ( request ) => {
		const url = request.url();
		if ( url.endsWith( '.js' ) || url.includes( 'mapbox-runtime' ) ) {
			scriptRequests.push( {
				url,
				frame:
					request.frame() === page.mainFrame() ? 'parent' : 'iframe',
			} );
		}
	} );

	await page.route( 'https://api.mapbox.com/**', ( route ) => {
		route.fulfill( {
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify( {
				version: 8,
				sources: {
					composite: {
						type: 'vector',
						url: 'mapbox://mapbox.mapbox-streets-v8',
					},
				},
				layers: [
					{
						id: 'background',
						type: 'background',
						paint: { 'background-color': '#e0dfdf' },
					},
				],
			} ),
		} );
	} );

	await admin.createNewPost( { postType: 'page', showWelcomeGuide: false } );
	await editor.insertBlock( { name: 'vsge/mapbox' } );

	const block = editor.canvas.locator( '[data-type="vsge/mapbox"]' );
	await expect( block ).toBeVisible();
	await expect(
		block.locator( '.vsge-mapbox-dealer-manager' )
	).toBeVisible();

	// 1. Wait for Mapbox canvas to initialize inside the block
	const mapCanvas = block.locator( '.mapboxgl-canvas' );
	await expect( mapCanvas ).toBeVisible();
	await expect( mapCanvas ).toHaveCount( 1 );

	// 2. Verify no "Invalid type: 'container'" cross-realm error was thrown
	const containerErrors = pageErrors.filter( ( err ) =>
		err.message.includes( "Invalid type: 'container'" )
	);
	expect( containerErrors ).toHaveLength( 0 );
	expect( pageErrors ).toHaveLength( 0 );

	// 3. Verify the canvas iframe window has vsgeMapboxGL loaded
	const iframeRuntimeInfo = await editor.canvas
		.locator( 'body' )
		.evaluate( () => {
			const mb = ( window as any ).vsgeMapboxGL;
			return {
				exists: Boolean( mb ),
				isMapConstructor: typeof mb?.Map === 'function',
			};
		} );
	expect( iframeRuntimeInfo.exists ).toBe( true );
	expect( iframeRuntimeInfo.isMapConstructor ).toBe( true );

	// 4. Trigger an ordinary editor rerender that does not replace the block
	const clientId = await block.getAttribute( 'data-block' );
	if ( clientId ) {
		await page.evaluate( ( id ) => {
			( window as any ).wp.data
				.dispatch( 'core/block-editor' )
				.updateBlockAttributes( id, { mapZoom: 7.0 } );
		}, clientId );
	}

	// Verify that a second Mapbox canvas is not created after rerender
	await expect( mapCanvas ).toBeVisible();
	await expect( mapCanvas ).toHaveCount( 1 );
	expect( pageErrors ).toHaveLength( 0 );

	// 5. Inspect runtime loading and verify realm-local loader architecture
	const runtimeRequests = scriptRequests.filter( ( r ) =>
		r.url.includes( 'mapbox-runtime' )
	);
	const parentLoaderDiagnostics = await page.evaluate( () => ( {
		hasLoader: typeof ( window as any ).vsgeLoadMapbox === 'function',
		hasRuntime: Boolean( ( window as any ).vsgeMapboxGL ),
	} ) );
	const iframeLoaderDiagnostics = await editor.canvas
		.locator( 'body' )
		.evaluate( () => ( {
			hasLoader: typeof ( window as any ).vsgeLoadMapbox === 'function',
			hasRuntime: Boolean( ( window as any ).vsgeMapboxGL ),
		} ) );

	// Parent has loader function but does NOT eagerly evaluate Mapbox GL
	expect( parentLoaderDiagnostics.hasLoader ).toBe( true );
	expect( parentLoaderDiagnostics.hasRuntime ).toBe( false );

	// Iframe has loader function and HAS evaluated Mapbox GL runtime
	expect( iframeLoaderDiagnostics.hasLoader ).toBe( true );
	expect( iframeLoaderDiagnostics.hasRuntime ).toBe( true );

	// Log runtime diagnostics for analysis
	// eslint-disable-next-line no-console
	console.log(
		'RUNTIME_LOADING_DIAGNOSTICS:',
		JSON.stringify( {
			runtimeRequestCount: runtimeRequests.length,
			runtimeRequests,
			parentLoaderDiagnostics,
			iframeLoaderDiagnostics,
		} )
	);
} );

test( 'frontend mapbox block renders style layers, updates GeoJSON on filter/reset, zero dealer DOM markers, and handles click selection', async ( {
	page,
} ) => {
	const pageErrors: Error[] = [];
	page.on( 'pageerror', ( error ) => {
		pageErrors.push( error );
	} );

	await page.route( 'https://api.mapbox.com/**', ( route ) => {
		route.fulfill( {
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify( {
				version: 8,
				sources: {
					composite: {
						type: 'vector',
						url: 'mapbox://mapbox.mapbox-streets-v8',
					},
				},
				layers: [
					{
						id: 'background',
						type: 'background',
						paint: { 'background-color': '#e0dfdf' },
					},
				],
			} ),
		} );
	} );

	// Navigate to published test page on frontend
	await page.goto( '/mapbox-test/' );

	const frontendWrapper = page.locator( '.map-wrapper' );
	await expect( frontendWrapper ).toBeVisible();

	// 1. Initial load contains exactly one geocoder/search control
	const geocoderControl = page.locator( '.mapboxgl-ctrl-geocoder' );
	await expect( geocoderControl ).toHaveCount( 1 );

	// 2. Mapbox map canvas is rendered
	const canvas = page.locator( '.mapboxgl-canvas' );
	await expect( canvas ).toHaveCount( 1 );

	// 3. Verify zero dealer DOM markers exist (Phase 3 architecture requirement)
	const domMarkers = page.locator(
		'.map-wrapper .mapboxgl-marker:not(.marker-temp)'
	);
	await expect( domMarkers ).toHaveCount( 0 );

	// 4. Verify Mapbox GeoJSON source and symbol layers exist on the map instance
	await page.waitForFunction( () => {
		const el = document.querySelector( '.map-container .map' ) as any;
		const map = el?._mapboxMap;
		return (
			Boolean( map ) &&
			Boolean( map.getSource( 'vsge-dealer-listings' ) ) &&
			Boolean( map.getLayer( 'vsge-dealer-points' ) ) &&
			Boolean( map.getLayer( 'vsge-dealer-selected' ) )
		);
	} );

	const initialFeaturesCount = await page.evaluate( () => {
		const el = document.querySelector( '.map-container .map' ) as any;
		const src = el?._mapboxMap?.getSource( 'vsge-dealer-listings' );
		return src?._data?.features?.length;
	} );
	expect( initialFeaturesCount ).toBe( 2 );

	// 5. Select a filter and verify source updates and exactly one geocoder remains
	const filterSelect = page.locator( 'select.filter-by-partnership' );
	await expect( filterSelect ).toBeVisible();
	await filterSelect.selectOption( 'Partner' );

	await expect( geocoderControl ).toHaveCount( 1 );

	// Source feature count drops to 1 ('Partner')
	await page.waitForFunction( () => {
		const el = document.querySelector( '.map-container .map' ) as any;
		const src = el?._mapboxMap?.getSource( 'vsge-dealer-listings' );
		return src?._data?.features?.length === 1;
	} );

	// 6. Reset Filters must be visible when filter is active
	const resetButton = page.locator( 'button.reset-filters' );
	await expect( resetButton ).toBeVisible();

	// Click reset and verify source restored to 2 and exactly one geocoder remains
	await resetButton.click();
	await expect( geocoderControl ).toHaveCount( 1 );
	await expect( resetButton ).toBeHidden();

	await page.waitForFunction( () => {
		const el = document.querySelector( '.map-container .map' ) as any;
		const src = el?._mapboxMap?.getSource( 'vsge-dealer-listings' );
		return src?._data?.features?.length === 2;
	} );

	// 7. Click on Dealer 1 on the map (Bologna: [11.3, 44.5])
	const dealer1Point = await page.evaluate( () => {
		const el = document.querySelector( '.map-container .map' ) as any;
		const map = el?._mapboxMap;
		if ( ! map ) {
			return null;
		}
		const p = map.project( [ 11.3, 44.5 ] );
		const rect = el.getBoundingClientRect();
		// Anchor is bottom; click ~15px above anchor
		return { x: rect.left + p.x, y: rect.top + p.y - 15 };
	} );
	expect( dealer1Point ).not.toBeNull();
	if ( dealer1Point ) {
		await page.mouse.click( dealer1Point.x, dealer1Point.y );
	}

	// Sidebar listing for Dealer 1 becomes active
	const dealer1Listing = page.locator(
		'.mapbox-sidebar-feature[data-dealer-id="1"]'
	);
	await expect( dealer1Listing ).toHaveClass( /active-store/ );

	// Selected layer filter is updated to ['==', ['id'], 1]
	const selectedFilter = await page.evaluate( () => {
		const el = document.querySelector( '.map-container .map' ) as any;
		return el?._mapboxMap?.getFilter( 'vsge-dealer-selected' );
	} );
	expect( selectedFilter ).toEqual( [ '==', [ 'id' ], 1 ] );

	// Dealer popup opens
	const popup = page.locator( '.mapboxgl-popup' );
	await expect( popup ).toBeVisible();
	await expect( popup.locator( '.popup-name' ) ).toHaveText( 'Dealer 1' );

	// No temporary marker was created
	await expect( page.locator( '.marker-temp' ) ).toHaveCount( 0 );

	// 8. Empty map click: clears selection and creates temporary marker with PinPointPopup
	const emptyPoint = await page.evaluate( () => {
		const el = document.querySelector( '.map-container .map' ) as any;
		const rect = el.getBoundingClientRect();
		return { x: rect.left + 50, y: rect.top + 50 };
	} );
	await page.mouse.click( emptyPoint.x, emptyPoint.y );

	// Sidebar active-store is cleared
	await expect( dealer1Listing ).not.toHaveClass( /active-store/ );

	// Temporary marker IS created
	const tempMarker = page.locator( '.marker-temp' );
	await expect( tempMarker ).toHaveCount( 1 );

	// PinPointPopup is shown
	await expect(
		popup
			.locator( 'button' )
			.filter( { hasText: /Find nearest Sales Agent/i } )
	).toBeVisible();

	// 9. Clicking Dealer 2 in sidebar clears temporary marker and selects Dealer 2
	const dealer2Listing = page.locator(
		'.mapbox-sidebar-feature[data-dealer-id="2"]'
	);
	await dealer2Listing
		.locator( '.mapbox-sidebar-feature__title-btn' )
		.click();

	// Temporary marker cleanly destroyed
	await expect( page.locator( '.marker-temp' ) ).toHaveCount( 0 );

	// Dealer 2 active in sidebar and Dealer 2 popup opened from sidebar action
	await expect( dealer2Listing ).toHaveClass( /active-store/ );
	await expect( popup ).toHaveCount( 1 );
	await expect( popup.locator( '.popup-name' ) ).toHaveText( 'Dealer 2' );

	// Close popup before verifying canvas-initiated open
	await popup.locator( '.mapboxgl-popup-close-button' ).click();
	await expect( popup ).toHaveCount( 0 );

	// Click Dealer 2 on the map (Venice: [12.0, 45.0])
	const dealer2Point = await page.evaluate( () => {
		const el = document.querySelector( '.map-container .map' ) as any;
		const map = el?._mapboxMap;
		if ( ! map ) {
			return null;
		}
		const p = map.project( [ 12.0, 45.0 ] );
		const rect = el.getBoundingClientRect();
		return { x: rect.left + p.x, y: rect.top + p.y - 15 };
	} );
	expect( dealer2Point ).not.toBeNull();
	if ( dealer2Point ) {
		await page.mouse.click( dealer2Point.x, dealer2Point.y );
	}

	// Dealer 2 popup opens
	await expect( popup ).toBeVisible();
	await expect( popup.locator( '.popup-name' ) ).toHaveText( 'Dealer 2' );

	expect( pageErrors ).toHaveLength( 0 );
} );

test( 'multiple frontend mapbox blocks on the same page with overlapping dealer id=1 maintain isolated state and active markers', async ( {
	page,
} ) => {
	const pageErrors: Error[] = [];
	page.on( 'pageerror', ( error ) => {
		pageErrors.push( error );
	} );

	await page.route( 'https://api.mapbox.com/**', ( route ) => {
		route.fulfill( {
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify( {
				version: 8,
				sources: {
					composite: {
						type: 'vector',
						url: 'mapbox://mapbox.mapbox-streets-v8',
					},
				},
				layers: [
					{
						id: 'background',
						type: 'background',
						paint: { 'background-color': '#e0dfdf' },
					},
				],
			} ),
		} );
	} );

	// Navigate to published multi-map test page on frontend
	await page.goto( '/multi-map-test/' );

	const mapWrappers = page.locator( '.wp-block-vsge-mapbox .map-wrapper' );
	await expect( mapWrappers ).toHaveCount( 2 );

	// Both blocks render a canvas
	const canvases = page.locator( '.mapboxgl-canvas' );
	await expect( canvases ).toHaveCount( 2 );

	const map1 = mapWrappers.nth( 0 );
	const map2 = mapWrappers.nth( 1 );

	// Both blocks have ZERO dealer DOM markers (Phase 3 architecture requirement)
	await expect(
		map1.locator( '.mapboxgl-marker:not(.marker-temp)' )
	).toHaveCount( 0 );
	await expect(
		map2.locator( '.mapboxgl-marker:not(.marker-temp)' )
	).toHaveCount( 0 );

	// Wait for both maps to initialize GeoJSON resources
	await page.waitForFunction( () => {
		const maps = Array.from(
			document.querySelectorAll(
				'.wp-block-vsge-mapbox .map-container .map'
			)
		).map( ( el: any ) => el._mapboxMap );
		return (
			maps.length === 2 &&
			Boolean( maps[ 0 ]?.getSource( 'vsge-dealer-listings' ) ) &&
			Boolean( maps[ 1 ]?.getSource( 'vsge-dealer-listings' ) )
		);
	} );

	// Find dealer 1 listing in Map 1 and Map 2 sidebars
	const map1Dealer = map1
		.locator( '.mapbox-sidebar-feature.listing' )
		.filter( { hasText: 'Block 1 Dealer 1' } );
	const map2Dealer = map2
		.locator( '.mapbox-sidebar-feature.listing' )
		.filter( { hasText: 'Block 2 Dealer 1' } );
	await expect( map1Dealer ).toBeVisible();
	await expect( map2Dealer ).toBeVisible();

	// Initially neither has active-store
	await expect( map1Dealer ).not.toHaveClass( /active-store/ );
	await expect( map2Dealer ).not.toHaveClass( /active-store/ );

	// Both selected layer filters are initially ['==', ['id'], -1]
	const map1InitialFilter = await map1
		.locator( '.map-container .map' )
		.evaluate(
			( el: any ) => el._mapboxMap?.getFilter( 'vsge-dealer-selected' )
		);
	const map2InitialFilter = await map2
		.locator( '.map-container .map' )
		.evaluate(
			( el: any ) => el._mapboxMap?.getFilter( 'vsge-dealer-selected' )
		);
	expect( map1InitialFilter ).toEqual( [ '==', [ 'id' ], -1 ] );
	expect( map2InitialFilter ).toEqual( [ '==', [ 'id' ], -1 ] );

	// Click dealer 1 in Map 1 sidebar
	await map1Dealer.locator( '.mapbox-sidebar-feature__title-btn' ).click();

	// Map 1's listing must be active
	await expect( map1Dealer ).toHaveClass( /active-store/ );

	// Map 2's listing MUST NOT be active
	await expect( map2Dealer ).not.toHaveClass( /active-store/ );

	// Map 1 selected layer filter is updated
	const map1FilterAfter = await map1
		.locator( '.map-container .map' )
		.evaluate(
			( el: any ) => el._mapboxMap?.getFilter( 'vsge-dealer-selected' )
		);
	expect( map1FilterAfter ).toEqual( [ '==', [ 'id' ], 1 ] );

	// Map 2 selected layer filter remains unaffected
	const map2FilterAfter = await map2
		.locator( '.map-container .map' )
		.evaluate(
			( el: any ) => el._mapboxMap?.getFilter( 'vsge-dealer-selected' )
		);
	expect( map2FilterAfter ).toEqual( [ '==', [ 'id' ], -1 ] );

	// Click dealer 1 in Map 2 sidebar
	await map2Dealer.locator( '.mapbox-sidebar-feature__title-btn' ).click();

	// Map 2's listing now becomes active
	await expect( map2Dealer ).toHaveClass( /active-store/ );

	// Map 2 selected layer filter is updated
	const map2FilterFinal = await map2
		.locator( '.map-container .map' )
		.evaluate(
			( el: any ) => el._mapboxMap?.getFilter( 'vsge-dealer-selected' )
		);
	expect( map2FilterFinal ).toEqual( [ '==', [ 'id' ], 1 ] );

	// Map 1 remains active
	await expect( map1Dealer ).toHaveClass( /active-store/ );

	expect( pageErrors ).toHaveLength( 0 );
} );

test( 'lazy-loads below-the-fold frontend mapbox block only when approaching viewport, preserving layout and phase 3 resources', async ( {
	page,
} ) => {
	const pageErrors: Error[] = [];
	page.on( 'pageerror', ( error ) => {
		pageErrors.push( error );
	} );

	const scriptRequests: string[] = [];
	page.on( 'request', ( request ) => {
		const url = request.url();
		if ( url.includes( 'mapbox.js' ) || url.includes( '681.js' ) ) {
			scriptRequests.push( url );
		}
	} );

	await page.route( 'https://api.mapbox.com/**', ( route ) => {
		route.fulfill( {
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify( {
				version: 8,
				sources: {
					composite: {
						type: 'vector',
						url: 'mapbox://mapbox.mapbox-streets-v8',
					},
				},
				layers: [
					{
						id: 'background',
						type: 'background',
						paint: { 'background-color': '#e0dfdf' },
					},
				],
			} ),
		} );
	} );

	// Navigate to below-the-fold lazy map test page
	await page.goto( '/lazy-map-test/' );

	const block = page.locator( '.wp-block-vsge-mapbox' );
	await expect( block ).toBeVisible();

	// 1. Verify layout preservation before hydration: container height is >= 200px
	const box = await block.boundingBox();
	expect( box ).not.toBeNull();
	expect( box!.height ).toBeGreaterThanOrEqual( 200 );
	expect( box!.y ).toBeGreaterThan( 1500 );

	// 2. Verify no canvas is created before scrolling
	await expect( page.locator( '.mapboxgl-canvas' ) ).toHaveCount( 0 );

	// 3. Verify heavy Mapbox chunks were NOT requested before scrolling
	const heavyBeforeScroll = scriptRequests.filter(
		( url ) =>
			url.includes( 'mapbox.js' ) || url.includes( 'maki-icons.js' )
	);
	expect( heavyBeforeScroll ).toHaveLength( 0 );

	// 4. Scroll within the 400px preload margin of the block
	await page.evaluate( () => {
		window.scrollTo( 0, 2400 );
	} );

	// 5. Canvas should initialize now
	const canvas = page.locator( '.mapboxgl-canvas' );
	await expect( canvas ).toHaveCount( 1 );
	await expect( canvas ).toBeVisible();

	// 6. Verify heavy Mapbox chunks were loaded after scroll
	const heavyAfterScroll = scriptRequests.filter( ( url ) =>
		url.includes( 'mapbox.js' )
	);
	expect( heavyAfterScroll.length ).toBeGreaterThanOrEqual( 1 );

	// 7. Verify Phase 3 resources intact on lazily loaded map
	await expect(
		page.locator( '.map-wrapper .mapboxgl-marker:not(.marker-temp)' )
	).toHaveCount( 0 );
	await expect( page.locator( '.mapboxgl-ctrl-geocoder' ) ).toHaveCount( 1 );

	await page.waitForFunction( () => {
		const el = document.querySelector( '.map-container .map' ) as any;
		const map = el?._mapboxMap;
		return (
			Boolean( map ) &&
			Boolean( map.getSource( 'vsge-dealer-listings' ) ) &&
			Boolean( map.getLayer( 'vsge-dealer-points' ) ) &&
			Boolean( map.getLayer( 'vsge-dealer-selected' ) )
		);
	} );

	expect( pageErrors ).toHaveLength( 0 );
} );

test( 'staggered multi-map page initializes top map immediately and lazy-loads below-the-fold map on scroll without duplicate script downloads', async ( {
	page,
} ) => {
	const pageErrors: Error[] = [];
	page.on( 'pageerror', ( error ) => {
		pageErrors.push( error );
	} );

	const scriptRequests: string[] = [];
	page.on( 'request', ( request ) => {
		const url = request.url();
		if ( url.includes( 'mapbox.js' ) || url.includes( '681.js' ) ) {
			scriptRequests.push( url );
		}
	} );

	await page.route( 'https://api.mapbox.com/**', ( route ) => {
		route.fulfill( {
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify( {
				version: 8,
				sources: {
					composite: {
						type: 'vector',
						url: 'mapbox://mapbox.mapbox-streets-v8',
					},
				},
				layers: [
					{
						id: 'background',
						type: 'background',
						paint: { 'background-color': '#e0dfdf' },
					},
				],
			} ),
		} );
	} );

	// Navigate to staggered maps test page
	await page.goto( '/staggered-maps-test/' );

	const canvases = page.locator( '.mapboxgl-canvas' );

	// 1. Map 1 (near top) initializes immediately: exactly 1 canvas exists
	await expect( canvases ).toHaveCount( 1 );

	// Wait for Map 1 map instance to be attached
	await page.waitForFunction( () => {
		const mapEls = document.querySelectorAll( '.map-container .map' );
		return ( mapEls[ 0 ] as any )?._mapboxMap !== undefined;
	} );

	// Record mapbox.js request count (should be 1)
	const initialMapboxRequests = scriptRequests.filter( ( url ) =>
		url.includes( 'mapbox.js' )
	).length;
	expect( initialMapboxRequests ).toBe( 1 );

	// Map 2 is below the fold and has not initialized yet (still 1 canvas total)
	await expect( canvases ).toHaveCount( 1 );

	// 2. Scroll to Map 2
	await page.evaluate( () => {
		window.scrollTo( 0, 2600 );
	} );

	// 3. Map 2 initializes: exactly 2 canvases exist now
	await expect( canvases ).toHaveCount( 2 );

	// Wait for Map 2 map instance to be attached
	await page.waitForFunction( () => {
		const mapEls = document.querySelectorAll( '.map-container .map' );
		return (
			mapEls.length === 2 &&
			( mapEls[ 0 ] as any )?._mapboxMap !== undefined &&
			( mapEls[ 1 ] as any )?._mapboxMap !== undefined
		);
	} );

	// 4. Verify NO duplicate download of mapbox.js
	const finalMapboxRequests = scriptRequests.filter( ( url ) =>
		url.includes( 'mapbox.js' )
	).length;
	expect( finalMapboxRequests ).toBe( 1 );

	// 5. Verify both maps have distinct runtime instances
	const distinctInstances = await page.evaluate( () => {
		const mapEls = Array.from(
			document.querySelectorAll( '.map-container .map' )
		) as any[];
		return (
			mapEls.length === 2 &&
			mapEls[ 0 ]._mapboxMap !== mapEls[ 1 ]._mapboxMap
		);
	} );
	expect( distinctInstances ).toBe( true );

	expect( pageErrors ).toHaveLength( 0 );
} );

test( 'frontend keyboard dealer activation, aria-current, non-color visual distinction, popup open, and focus restoration on user close', async ( {
	page,
} ) => {
	const pageErrors: Error[] = [];
	page.on( 'pageerror', ( error ) => {
		pageErrors.push( error );
	} );

	await page.route( 'https://api.mapbox.com/**', ( route ) => {
		route.fulfill( {
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify( {
				version: 8,
				sources: {
					composite: {
						type: 'vector',
						url: 'mapbox://mapbox.mapbox-streets-v8',
					},
				},
				layers: [
					{
						id: 'background',
						type: 'background',
						paint: { 'background-color': '#e0dfdf' },
					},
				],
			} ),
		} );
	} );

	await page.goto( '/mapbox-test/', { waitUntil: 'networkidle' } );

	// Wait for map canvas and sidebar listings to be ready
	await page.waitForSelector( '.mapboxgl-canvas', { timeout: 15000 } );
	await page.waitForSelector( '.mapbox-sidebar-feature__title-btn', {
		timeout: 15000,
	} );

	// 1. Verify dealer buttons exist and are keyboard focusable
	const dealerButtons = page.locator( '.mapbox-sidebar-feature__title-btn' );
	const count = await dealerButtons.count();
	expect( count ).toBeGreaterThan( 0 );

	const firstDealerBtn = dealerButtons.first();
	await firstDealerBtn.focus();
	const isFirstFocused = await firstDealerBtn.evaluate(
		( el ) => el === el.ownerDocument.activeElement
	);
	expect( isFirstFocused ).toBe( true );

	// 2. Initial state: aria-current is not true
	const initialAriaCurrent =
		await firstDealerBtn.getAttribute( 'aria-current' );
	expect( initialAriaCurrent ).toBeNull();

	// 3. Activate dealer button via keyboard Enter
	await firstDealerBtn.press( 'Enter' );

	// 4. Verify popup opens
	const popup = page.locator( '.mapboxgl-popup' );
	await expect( popup ).toBeVisible( { timeout: 5000 } );

	// 5. Verify semantic aria-current and non-color visual indication
	const activeAriaCurrent =
		await firstDealerBtn.getAttribute( 'aria-current' );
	expect( activeAriaCurrent ).toBe( 'true' );

	const activeCardStyles = await page
		.locator( '.mapbox-sidebar-feature' )
		.first()
		.evaluate( ( el ) => {
			const style = window.getComputedStyle( el );
			return {
				borderLeftWidth: style.borderLeftWidth,
				borderLeftStyle: style.borderLeftStyle,
				hasActiveStoreClass: el.classList.contains( 'active-store' ),
			};
		} );
	expect( activeCardStyles.hasActiveStoreClass ).toBe( true );
	expect( activeCardStyles.borderLeftStyle ).toBe( 'solid' );
	expect(
		parseInt( activeCardStyles.borderLeftWidth, 10 )
	).toBeGreaterThanOrEqual( 3 );

	// 6. Close popup via keyboard Enter on the close button
	const closeBtn = page.locator( '.mapboxgl-popup-close-button' );
	await expect( closeBtn ).toBeVisible( { timeout: 5000 } );
	await closeBtn.press( 'Enter' );

	await expect( popup ).toBeHidden( { timeout: 5000 } );

	// 7. Verify focus is restored to the triggering dealer button
	const isRefocused = await firstDealerBtn.evaluate(
		( el ) => el === el.ownerDocument.activeElement
	);
	expect( isRefocused ).toBe( true );

	expect( pageErrors ).toHaveLength( 0 );
} );
