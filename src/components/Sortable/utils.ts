// a little function to help us with reordering the result
import { CSSProperties } from 'react';

const grid = 8;

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

export const getListStyle = ( isDraggingOver: any ): object => ( {
	background: isDraggingOver ? 'lightblue' : 'lightgrey',
	padding: grid,
	width: 250,
} );
