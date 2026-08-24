import { MarkerIcon } from '../types';

/**
 * Generates the SVG content for a marker icon based on the given icon ID and icon set.
 *
 * @param {string}       icon    - The icon ID in the format 'icon-<id>'.
 * @param {MarkerIcon[]} iconset - An array of MarkerIcon objects representing the icon set.
 * @return {string} The SVG content of the marker icon matching the given icon ID, or undefined if no matching icon is found.
 */
export function getMarkerSvg(
	icon: string,
	iconset: MarkerIcon[]
): string | undefined {
	const iconID = Number( icon.split( '-' )[ 1 ] );
	const content = iconset.find( ( obj ) => obj.id === iconID )?.content;
	return content ? sanitizeMarkerSvg( content ) : undefined;
}

/** Custom icon markup is user supplied, so it crosses a strict SVG trust boundary. */
export function sanitizeMarkerSvg( content: string ): string | undefined {
	const document = new DOMParser().parseFromString(
		content,
		'image/svg+xml'
	);
	const svg = document.documentElement;
	const allowedElements = new Set( [
		'svg',
		'g',
		'path',
		'circle',
		'ellipse',
		'rect',
		'line',
		'polyline',
		'polygon',
		'title',
		'desc',
	] );
	const allowedAttributes = new Set( [
		'xmlns',
		'viewbox',
		'width',
		'height',
		'fill',
		'fill-rule',
		'clip-rule',
		'stroke',
		'stroke-width',
		'stroke-linecap',
		'stroke-linejoin',
		'd',
		'cx',
		'cy',
		'r',
		'rx',
		'ry',
		'x',
		'y',
		'x1',
		'x2',
		'y1',
		'y2',
		'points',
		'transform',
		'opacity',
		'role',
		'aria-label',
		'aria-hidden',
	] );
	if (
		svg.nodeName.toLowerCase() !== 'svg' ||
		document.querySelector( 'parsererror' )
	) {
		return undefined;
	}
	svg.querySelectorAll( '*' ).forEach( ( element ) => {
		if ( ! allowedElements.has( element.nodeName.toLowerCase() ) ) {
			element.remove();
			return;
		}
		Array.from( element.attributes ).forEach( ( attribute ) => {
			if (
				! allowedAttributes.has( attribute.name.toLowerCase() ) ||
				attribute.name.toLowerCase().startsWith( 'on' )
			) {
				element.removeAttribute( attribute.name );
			}
		} );
	} );
	return svg.outerHTML;
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
