import { memo } from '@wordpress/element';
import { Icon, IconButton, TextControl } from '@wordpress/components';
import { Draggable } from 'react-beautiful-dnd';

const Item = ( { props, index, tax, updateItem } ) => (
	<Draggable draggableId={ tax + '-' + props.id } index={ index }>
		{ ( provided ) => (
			<div
				ref={ provided.innerRef }
				{ ...provided.draggableProps }
				{ ...provided.dragHandleProps }
			>
				<div
					className={ 'dnd-wrap' }
					style={ {
						display: 'grid',
						gridTemplateColumns: ' 1fr auto auto',
					} }
				>
					<TextControl
						value={ props.value }
						onChange={ ( newValue ) =>
							updateItem( props.id, tax, { value: newValue } )
						}
					></TextControl>
					<Icon icon="move" />
					<IconButton icon="trash" onClick={ () => {} } />
				</div>
			</div>
		) }
	</Draggable>
);

export const ItemsList = memo( function ItemsList( {
	sortedItems,
	updateItem,
	tax,
} ) {
	return sortedItems.map( ( el, index ) => (
		<Item
			props={ el }
			index={ index }
			tax={ tax }
			key={ el.id }
			updateItem={ updateItem }
		/>
	) );
} );
