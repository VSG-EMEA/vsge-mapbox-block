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
