import { MarkerIcon } from '../types';

/**
 * Generates the SVG content for a marker icon based on the given icon ID and icon set.
 *
 * @param {string}       icon    - The icon ID in the format 'icon-<id>'.
 * @param {MarkerIcon[]} iconset - An array of MarkerIcon objects representing the icon set.
 * @return {string} The SVG content of the marker icon matching the given icon ID, or undefined if no matching icon is found.
 */
export function getMarkerSvg( icon: string, iconset: MarkerIcon[] ): string {
	const iconID = Number( icon.split( '-' )[ 1 ] );
	return iconset.find( ( obj ) => obj.id === iconID )?.content;
}

/**
 * Modifies an SVG string by adding or updating the style attribute.
 *
 * @param {string} svgString - The SVG string to modify.
 * @param {string} [color]   - The color to apply to the SVG. Default is undefined.
 * @param {number} [width]   - The width to apply to the SVG. Default is undefined.
 * @param {number} [height]  - The height to apply to the SVG. Default is undefined.
 * @return {string} The modified SVG string.
 */
export function modifySVG(
	svgString: string,
	color?: string,
	width?: number,
	height?: number
): string {
	// Initialize the style attribute
	let styleAttribute = '';

	if ( color ) {
		styleAttribute += `fill:${ color };`;
	}

	if ( width ) {
		styleAttribute += `width:${ width }px;`;
	}

	if ( height ) {
		styleAttribute += `height:${ height }px;`;
	}

	if ( styleAttribute ) {
		// Add or update the style attribute
		if ( svgString && svgString.includes( 'style="' ) ) {
			return svgString.replace( /style="([^"]*)"/, ( match, styles ) => {
				return `style="${ styleAttribute }${ styles }"`;
			} );
		}
		return svgString.replace( '<svg', `<svg style="${ styleAttribute }"` );
	}

	return svgString;
}
