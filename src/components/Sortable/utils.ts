// a little function to help us with reordering the result
import { CSSProperties } from 'react';

const grid = 8;

/**
 * This function returns an object with styles for a draggable item, including padding, margin,
 * background color, and user select, with the background color changing if the item is being dragged.
 *
 * @param {any}                       isDragging     - a boolean value indicating whether the item is currently being dragged or
 *                                                   not.
 * @param {CSSProperties | undefined} draggableStyle - a CSSProperties object that contains the styles
 *                                                   to be applied to the draggable item. These styles are merged with the default styles defined in the
 *                                                   function to create the final styles for the item.
 */
export const getItemStyle: (
	isDragging: any,
	draggableStyle: CSSProperties | undefined
) => {
	padding: string | number;
	margin: string | number;
	background: string | number;
	userSelect: string;
} = ( isDragging: any, draggableStyle: CSSProperties | undefined ) => ( {
	// some basic styles to make the items look a bit nicer
	userSelect: 'none',
	padding: grid * 2,
	margin: `0 0 ${ grid }px 0`,

	// change background colour if dragging
	background: isDragging ? 'lightgreen' : 'grey',

	// styles we need to apply on draggables
	...draggableStyle,
} );

/**
 * This function returns an object with styling properties for a list based on whether it is being
 * dragged over or not.
 *
 * @param {any} isDraggingOver - isDraggingOver is a boolean value that indicates whether a draggable
 *                             item is currently being dragged over the droppable area. It is used to determine the background
 *                             color of the droppable area. If isDraggingOver is true, the background color will be light blue,
 *                             otherwise it will be light grey
 */
export const getListStyle = ( isDraggingOver: any ): object => ( {
	background: isDraggingOver ? 'lightblue' : 'lightgrey',
	padding: grid,
	width: 250,
} );

/**
 * This function checks if the input array has exactly two elements. If it doesn't, it returns false.
 * If the array has two elements, it checks if the first number is between -180 and 180 (longitude range) and
 * if the second number is between -90 and 90 (latitude range). If both conditions are met, it returns true;
 * otherwise, it returns false.
 *
 * @param arr the array of numbers (likely to be [longitude, latitude])
 */
export function areValidCoordinates( arr: [ number, number ] ): boolean {
	const [ longitude, latitude ] = arr;
	const validLongitude = longitude >= -180 && longitude <= 180;
	const validLatitude = latitude >= -90 && latitude <= 90;

	return arr.length === 2 && validLongitude && validLatitude;
}
