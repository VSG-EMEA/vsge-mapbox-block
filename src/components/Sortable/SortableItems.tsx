import { memo } from '@wordpress/element';
import {Button, Icon, IconButton, TextControl} from '@wordpress/components';
import { Draggable } from 'react-beautiful-dnd';

const Item = ( { props, index, tax, key, updateItem, deleteItem } ) => (
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
							updateItem( key, tax, { value: newValue } )
						}
					></TextControl>
					<IconButton
            icon="move"
            size={ 16 }
            isSmall={ true }
          />
					<IconButton
						icon="trash"
						size={ 16 }
            isSmall={ true }
						onClick={ () => deleteItem( key ) }
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
