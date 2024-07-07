/**
 * The function prepares stores by assigning IDs to them and returning them as a geojson object.
 *
 * @param listings - The `listings` parameter is an array of `Feature` objects. It is used to create a
 *                 new object with a `type` property set to `'geojson'` and a `stores` property that is an array of the
 *                 same `Feature` objects with an added `id` property
 */
export const prepareStores = ( listings: any ) => ( {
	type: 'geojson',
	stores: listings,
} );

/**
 * Given a JsonFeature array of objects, return the next ID to use
 *
 * @param {Object} arr the array of objects with a `id` property
 * @return {number} the next ID
 */
export function getNextId( arr: any ): number {
	return (
		arr?.reduce( ( max: number, obj: any ) => {
			return obj?.id > max ? obj.id : max;
		}, 0 ) + 1 ?? 0
	);
}

/**
 * Reorder the list of stores
 *
 * @param list       the list of stores
 * @param startIndex the index of the first item
 * @param endIndex   the index of the last item
 */
export const reorder = (
	list: Iterable< any > | ArrayLike< unknown >,
	startIndex: number,
	endIndex: number
): Iterable< unknown > | ArrayLike< unknown > => {
	const result = Array.from( list );
	const [ removed ] = result.splice( startIndex, 1 );
	result.splice( endIndex, 0, removed );

	return result;
};

/**
 * Takes an array and a separator and returns a new array with the separator
 * interspersed between each element of the original array.
 *
 * @param {Array} elements - The array of elements to intersperse.
 * @return {Array} - The new array with the separator interspersed.
 */
export function intersperse( elements: JSX.Element[] ): Array< any > {
	return elements.reduce(
		( result, element, index ) => {
			if ( index === 0 ) {
				return [ element ];
			}
			return [ ...result, ', ', element ];
		},
		[] as ( JSX.Element | string )[]
	);
}
