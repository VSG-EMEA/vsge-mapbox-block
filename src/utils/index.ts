import { MapboxBlockDefaults } from '../types';

/**
 * This function returns an object with default values based on the properties of a given object.
 *
 * @return {MapboxBlockDefaults|undefined} The function `getDefaults` is returning an object with three properties: `accessToken`,
 * `siteurl`, and `language`. The values of these properties are being taken from the `mapboxBlockData`
 * object. If `mapboxBlockData` is falsy, then nothing is returned.
 */
export const getMapDefaults = (): MapboxBlockDefaults => {
	return {
		accessToken: mapboxBlockData.accessToken,
		siteurl: mapboxBlockData.siteurl,
		language: mapboxBlockData.language,
	};
};

/**
 * The function takes a string and returns a URL-safe version of it by encoding it and removing any
 * characters that are not allowed in URLs.A slug is a URL-friendly version of a string that is commonly
 * used in web development to create clean and readable URLs. The function takes this string as an argument
 * and returns a safe slug by removing any characters that are not allowed in a
 *
 * @param {string} string - The input string that needs to be converted into a safe slug.
 *
 * @return {string} The `safeSlug` function is returning a modified version of the input string that can be
 * used as a URL slug. The returned value is the input string converted to lowercase, with any
 * characters that are not alphanumeric or a hyphen removed and any special characters encoded using
 * percent-encoding.
 */
export function safeSlug( string: string ) {
	return encodeURIComponent( string )
		.toLowerCase()
		.replace( /\.|_|%[0-9a-zA-Z]{2}/gi, '-' );
}
