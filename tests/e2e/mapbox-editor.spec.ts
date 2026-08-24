import { expect, test } from '@wordpress/e2e-test-utils-playwright';

test( 'inserts the VSGE Mapbox block and shows the bounded dealer editor', async ( {
	admin,
	editor,
} ) => {
	await admin.createNewPost( { postType: 'page', showWelcomeGuide: false } );
	await editor.insertBlock( { name: 'vsge/mapbox' } );

	const block = editor.canvas.locator( '[data-type="vsge/mapbox"]' );
	await expect( block ).toBeVisible();
	await expect(
		block.locator( '.vsge-mapbox-dealer-manager' )
	).toBeVisible();
} );
