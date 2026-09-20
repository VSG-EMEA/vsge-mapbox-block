import type { TempMarkerResource } from './tempMarker';

export * from './tempMarker';

export type DealerMarkerResource = TempMarkerResource;
export type DealerMarkerRegistry = Map< number, TempMarkerResource >;

/**
 * Destroys a managed temporary marker resource symmetrically.
 *
 * @param resource The temporary marker resource to destroy.
 */
export function destroyDealerMarker( resource: TempMarkerResource ): void {
	if ( resource && typeof resource.destroy === 'function' ) {
		resource.destroy();
	}
}

/**
 * Removes and destroys all temporary markers matching the given predicate.
 *
 * @param registry  Map containing temporary marker resources.
 * @param predicate Predicate function.
 */
export function removeDealerMarkersWhere(
	registry: DealerMarkerRegistry,
	predicate: ( resource: TempMarkerResource ) => boolean
): number[] {
	const removedIds: number[] = [];
	for ( const [ id, resource ] of registry.entries() ) {
		if ( predicate( resource ) ) {
			destroyDealerMarker( resource );
			registry.delete( id );
			removedIds.push( id );
		}
	}
	return removedIds;
}

/**
 * Removes a single marker by ID from the registry.
 *
 * @param registry Map containing marker resources.
 * @param id       Marker ID.
 */
export function removeDealerMarker(
	registry: DealerMarkerRegistry,
	id: number
): boolean {
	const resource = registry.get( id );
	if ( resource ) {
		destroyDealerMarker( resource );
		registry.delete( id );
		return true;
	}
	return false;
}

/**
 * Clears and destroys all markers in the registry.
 *
 * @param registry Map containing marker resources.
 */
export function clearDealerMarkerRegistry(
	registry: DealerMarkerRegistry
): void {
	for ( const resource of registry.values() ) {
		destroyDealerMarker( resource );
	}
	registry.clear();
}
