import type { ProjectionSpecification } from 'mapbox-gl';

export type SupportedProjectionName =
	| 'albers'
	| 'equalEarth'
	| 'equirectangular'
	| 'lambertConformalConic'
	| 'mercator'
	| 'naturalEarth'
	| 'winkelTripel'
	| 'globe';

/**
 * Derives the effective Mapbox projection based on configuration precedence:
 * If elevation is enabled, the 3D terrain projection is 'globe'.
 * Otherwise, uses the configured mapProjection or defaults to 'mercator'.
 *
 * @param mapProjection The configured projection from block attributes.
 * @param elevation     Whether 3D elevation is enabled.
 * @return A strongly-typed ProjectionSpecification object.
 */
export function getEffectiveProjection(
	mapProjection?: string,
	elevation?: boolean
): ProjectionSpecification {
	const name = (
		elevation ? 'globe' : mapProjection || 'mercator'
	) as SupportedProjectionName;
	return { name };
}
