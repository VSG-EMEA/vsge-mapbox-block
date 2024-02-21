import { layouts, svgArray } from '@mapbox/maki';

export function getIcon( icon: string ) {
	const iconIndex = layouts.findIndex(
		( iconName: string ) => iconName === icon
	);
	return iconIndex !== -1 ? svgArray[ iconIndex ] : undefined;
}
