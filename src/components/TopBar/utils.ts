/**
 * Determines whether any filter, tag, or listing restriction is currently active.
 *
 * @param filter           Active partnership/company filter string.
 * @param tag              Active tag string.
 * @param filteredListings Active filtered listings array (null when no filter is active).
 * @return True if Reset Filters should be visible.
 */
export function isFilterActive(
	filter: string,
	tag: string,
	filteredListings: unknown[] | null
): boolean {
	return filter !== '' || tag !== '' || filteredListings !== null;
}
