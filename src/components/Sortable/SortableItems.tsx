import { memo } from '@wordpress/element';
import { Button, Icon, IconButton, TextControl } from '@wordpress/components';
import { Draggable } from 'react-beautiful-dnd';

const Item = ( { props, index, tax, key, id, updateItem, deleteItem } ) => (
	<Draggable draggableId={ tax + '-' + id } index={ index }>
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
							updateItem( key, tax, { value: newValue } )
						}
					></TextControl>
					<Button icon="move" iconSize={ 16 } isSmall={ true } />
					<Button
						icon="trash"
						iconSize={ 16 }
						isSmall={ true }
						onClick={ () => deleteItem( id ) }
					/>
				</div>
			</div>
		) }
	</Draggable>
);

export const ItemsList = memo( function ItemsList( {
	sortedItems,
	updateItem,
	deleteItem,
	tax,
} ) {
	return sortedItems.map( ( el, index ) => (
		<Item
			props={ el }
			index={ index }
			tax={ tax }
			key={ el.id }
			updateItem={ updateItem }
			deleteItem={ deleteItem }
		/>
	) );
} );
