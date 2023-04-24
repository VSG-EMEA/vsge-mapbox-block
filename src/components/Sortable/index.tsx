import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { reorder } from './sortableUtils';
import { ItemsList } from './SortableItems';
import { PinList } from './SortablePins';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

export const Sortable = ( props: {
	items: any;
	tax: string;
	setOptions: any;
	mapboxOptions: any;
} ): JSX.Element => {
	const { items, tax, setOptions, mapboxOptions } = props;
	function onDragEnd( result: {
		destination: { index: any };
		source: { index: any };
	} ) {
		// dropped outside the list
		if ( ! result.destination ) {
			return;
		}
		setOptions(
			tax,
			reorder( items, result.source.index, result.destination.index )
		);
	}

	function updateItem( id: number, newValue: Object ) {
		const newItems = items.map( ( item: { id: number } ) =>
			item.id === id ? { ...item, ...newValue } : item
		);
		setOptions( tax, newItems );
	}

	function deleteItem( id: number ) {
		// remove the item from the array
		const newItems = items.filter(
			( item: { id: number } ) => item.id !== id
		);
		setOptions( tax, newItems );
	}

	return (
		<>
			<DragDropContext
				onDragEnd={ ( result: DropResult ) =>
					onDragEnd( {
						destination: result.destination,
						source: result.source,
					} )
				}
			>
				<Droppable droppableId="items">
					{ ( provided ) => (
						<div
							className={ 'sortable-' + tax }
							ref={ provided.innerRef }
							{ ...provided.droppableProps }
						>
							{ tax !== 'listings' ? (
								<ItemsList
									sortedItems={ items }
									tax={ tax }
									updateItem={ updateItem }
									deleteItem={ deleteItem }
								/>
							) : (
								<PinList
									sortedPins={ items }
									filters={ mapboxOptions.filters }
									tags={ mapboxOptions.tags }
									updateItem={ updateItem }
									deleteItem={ deleteItem }
								/>
							) }
							{ provided.placeholder }
						</div>
					) }
				</Droppable>
			</DragDropContext>
			<Button
				text={ __( 'add' ) }
				type={ 'secondary' }
				onClick={ () => {
					setOptions( tax, [
						...items,
						tax !== 'listings'
							? {
									id: items.length,
									value: __( 'New' ),
							  }
							: {
									id: items.length,
									name: __( 'New' ),
							  },
					] );
				} }
			/>
		</>
	);
};
