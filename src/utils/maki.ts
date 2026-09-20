let makiDataPromise: Promise< {
	layouts: string[];
	svgArray: string[];
} > | null = null;

async function loadMakiData(): Promise< {
	layouts: string[];
	svgArray: string[];
} > {
	if ( ! makiDataPromise ) {
		makiDataPromise = import(
			/* webpackChunkName: "maki-icons" */ '@mapbox/maki'
		);
	}
	return makiDataPromise;
}

/**
 * Retrieves the list of available Maki icon names.
 */
export async function getMakiNames(): Promise< string[] > {
	const { layouts } = await loadMakiData();
	return layouts;
}

/**
 * Retrieves the raw SVG string for a given Maki icon name.
 * Accepts names with or without the 'maki-' prefix.
 */
export async function getMakiSvg(
	name: string
): Promise< string | undefined > {
	if ( ! name ) {
		return undefined;
	}
	const cleanName = name.replace( /^maki-/, '' ).toLowerCase();
	const { layouts, svgArray } = await loadMakiData();
	const index = layouts.findIndex(
		( layoutName: string ) => layoutName.toLowerCase() === cleanName
	);
	return index !== -1 ? svgArray[ index ] : undefined;
}
