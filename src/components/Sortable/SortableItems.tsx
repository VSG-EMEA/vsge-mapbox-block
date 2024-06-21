import { Button, TextControl } from '@wordpress/components';
import { Draggable } from 'react-beautiful-dnd';
import { FilterCollection } from '../../types';

/**
 * A sortable item that allow to add a string to the given array and sort it
 *
 * @param props            The item data
 * @param props.tax        the item Taxonomy
 * @param props.item       the item data
 * @param props.index      the item index
 * @param props.updateItem a function to update the item data
 * @param props.deleteItem a function to delete the item
 * @class
 */
export const StringItem = ( props: {
	tax: string;
	item: FilterCollection;
	index: number;
	updateItem: Function;
	deleteItem: Function;
} ) => {
	const {
		tax,
		item,
		index,
		updateItem,
		deleteItem,
	}: {
		tax: string;
		item: FilterCollection;
		index: number;
		updateItem: Function;
		deleteItem: Function;
	} = props;
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
							value={ item?.value || '' }
							onChange={ ( newValue ) =>
								updateItem( {
									...item,
									value: newValue,
								} )
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
