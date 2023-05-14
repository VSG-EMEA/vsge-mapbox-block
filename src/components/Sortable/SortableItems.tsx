import { memo } from '@wordpress/element';
import { Button, TextControl } from '@wordpress/components';
import { Draggable } from 'react-beautiful-dnd';

export const StringItem = ( { tax, item, index, updateItem, deleteItem }) => {

	return (
		<Draggable draggableId={ tax + '-' + item.id } index={ index }>
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
							value={ item.value }
							onChange={ ( newValue ) =>
								updateItem( item.id, { value: newValue } )
							}
						></TextControl>
						<Button
							icon="move"
							iconSize={ 16 }
							isSmall={ true }
							style={ { pointerEvents: 'none' } }
						/>
						<Button
							icon="trash"
							iconSize={ 16 }
							isSmall={ true }
							onClick={ () => deleteItem( item.id ) }
						/>
					</div>
				</div>
			) }
		</Draggable>
	);
};
