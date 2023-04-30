import { memo } from '@wordpress/element';
import { Button, TextControl } from '@wordpress/components';
import { Draggable } from 'react-beautiful-dnd';

const StringItem = ( props ) => {
	const { value, tax, id, updateItem, deleteItem } = props;
	return (
		<Draggable draggableId={ tax + '-' + id } index={ id }>
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
							value={ value }
							onChange={ ( newValue ) =>
								updateItem( id, { value: newValue } )
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
							onClick={ () => deleteItem( id ) }
						/>
					</div>
				</div>
			) }
		</Draggable>
	);
};

export const StringList = memo( function ItemsList( {
	sortedItems,
	updateItem,
	deleteItem,
	tax,
} ) {
	return (
		sortedItems &&
		sortedItems.map( ( el, index ) => (
			<StringItem
				value={ el.value }
				tax={ tax }
				key={ index }
				id={ el.id ?? index }
				updateItem={ updateItem }
				deleteItem={ deleteItem }
			/>
		) )
	);
} );
