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
 * This function returns the language of the user's browser.
 *
 * @return The `getUserLanguage` function returns the language of the user's browser as a string. It
 * first checks for the `navigator.language` property, which returns the language version of the
 * browser, and if that is not available, it checks for the `navigator.userLanguage` property, which
 * returns the language version of the user's operating system.
 */
export const getUserLanguage = () => {
	// @ts-ignore
	return navigator.language || navigator.userLanguage;
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

/**
 * The function returns a specific link type based on the input string.
 *
 * @param {string} linkType - a string that represents the type of link being generated. It can be
 *                          either "phone", "email", or any other type of link.
 * @return {string} a string that corresponds to the link type provided as an argument. If the link type is
 * "phone", the function returns "tel:", if it is "email", the function returns "mailto:", and if it is
 * any other type, the function returns "//".
 */
export function getLinkType( linkType: string ): 'tel:' | 'mailto:' | '//' {
	switch ( linkType ) {
		case 'phone':
			return 'tel:';
		case 'email':
			return 'mailto:';
		default:
			return '//';
	}
}

/**
 * The function normalizes a given string by removing leading/trailing spaces and converting it to
 * lowercase.
 *
 * @param {string} string - The parameter "string" is a string type input that is passed to the
 *                        function "normalize".
 * @return If the `string` parameter is not `null` or `undefined`, the function returns the trimmed
 * and lowercased version of the string. Otherwise, it returns an empty string.
 */
export function normalize( string: string ) {
	if ( string ) {
		return string.trim().toLowerCase();
	}
	return '';
}

/**
 * Checks if two values are equal by comparing their string representations.
 *
 * @param {any} a - The first value to compare.
 * @param {any} b - The second value to compare.
 * @return {boolean} True if the values are equal, false otherwise.
 */
export const equalsCheck = ( a: any, b: any ): boolean => {
	return JSON.stringify( a ) === JSON.stringify( b );
};
