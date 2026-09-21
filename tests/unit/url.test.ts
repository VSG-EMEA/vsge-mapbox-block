import { describe, expect, test } from '@jest/globals';
import { normalizeExternalUrl } from '../../src/utils/url';

describe( 'normalizeExternalUrl', () => {
	test( 'normalizes bare domain to https URL', () => {
		expect( normalizeExternalUrl( 'example.com' ) ).toBe(
			'https://example.com/'
		);
	} );

	test( 'normalizes bare domain with subdomains, path, query and hash', () => {
		expect(
			normalizeExternalUrl( 'example.com/path?foo=bar#section' )
		).toBe( 'https://example.com/path?foo=bar#section' );
		expect( normalizeExternalUrl( 'www.example.com' ) ).toBe(
			'https://www.example.com/'
		);
	} );

	test( 'preserves valid https URL', () => {
		expect( normalizeExternalUrl( 'https://example.com/path' ) ).toBe(
			'https://example.com/path'
		);
	} );

	test( 'preserves valid http URL', () => {
		expect( normalizeExternalUrl( 'http://example.com' ) ).toBe(
			'http://example.com/'
		);
	} );

	test( 'converts protocol-relative URL to https', () => {
		expect( normalizeExternalUrl( '//example.com' ) ).toBe(
			'https://example.com/'
		);
		expect( normalizeExternalUrl( '//example.com/store?id=42' ) ).toBe(
			'https://example.com/store?id=42'
		);
	} );

	test( 'rejects unsafe and non-web schemes', () => {
		expect( normalizeExternalUrl( 'javascript:alert(1)' ) ).toBeNull();
		expect( normalizeExternalUrl( 'javascript:void(0)' ) ).toBeNull();
		expect(
			normalizeExternalUrl(
				'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='
			)
		).toBeNull();
		expect( normalizeExternalUrl( 'file:///etc/passwd' ) ).toBeNull();
		expect( normalizeExternalUrl( 'vbscript:msgbox(1)' ) ).toBeNull();
		expect( normalizeExternalUrl( 'ftp://example.com' ) ).toBeNull();
	} );

	test( 'rejects empty, whitespace, and null/undefined values', () => {
		expect( normalizeExternalUrl( '' ) ).toBeNull();
		expect( normalizeExternalUrl( '   ' ) ).toBeNull();
		expect( normalizeExternalUrl( null ) ).toBeNull();
		expect( normalizeExternalUrl( undefined ) ).toBeNull();
	} );

	test( 'rejects malformed strings and invalid hostnames', () => {
		expect( normalizeExternalUrl( 'htp://bad scheme' ) ).toBeNull();
		expect( normalizeExternalUrl( 'not a url' ) ).toBeNull();
		expect( normalizeExternalUrl( 'https://' ) ).toBeNull();
		expect( normalizeExternalUrl( 'http://' ) ).toBeNull();
		expect( normalizeExternalUrl( '://missing' ) ).toBeNull();
	} );

	test( 'trims surrounding whitespace from otherwise valid URLs', () => {
		expect(
			normalizeExternalUrl( '   https://example.com/dealer   ' )
		).toBe( 'https://example.com/dealer' );
		expect( normalizeExternalUrl( '   example.com   ' ) ).toBe(
			'https://example.com/'
		);
	} );
} );
