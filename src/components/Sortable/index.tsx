import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { reorder } from './utils';
import { StringList } from './SortableItems';
import { PinList } from './SortablePins';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useEffect } from '@wordpress/element';

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
		let newItems;
		newItems = items.map( ( item ) =>
			item.id === id
				? {
						...item,
						...newValue,
				  }
				: item
		);
		setOptions( tax, newItems );
	}

	function updatePinData( id: number, newValue: Object ) {
		let newItems;
		newItems = items.map( ( item ) =>
			item.properties.id === id
				? {
						...item,
						properties: {
							...item.properties,
							...newValue,
						},
				  }
				: item
		);
		setOptions( tax, newItems );
	}

	function deleteItem( id: number ) {
		// remove the item from the array
		const newItems = items.filter( ( item ) => item.id !== id );
		setOptions( tax, newItems );
	}

	function deletePin( id: number ) {
		// remove the item from the array
		const newItems = items.filter( ( item ) => item.properties.id !== id );
		setOptions( tax, newItems );
	}

	useEffect( () => {
		items.forEach( ( item: any, index: number ) => {
			if ( ! item?.properties?.id )
				item.properties = { ...item.properties, id: index };
		} );
	}, [] );

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
								<StringList
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
									updateItem={ updatePinData }
                  deletePin={ deletePin }
								/>
							) }
							{ provided.placeholder }
						</div>
					) }
				</Droppable>
			</DragDropContext>
			<Button
				icon={ 'plus' }
				text={ __( 'Add new' ) }
				type={ 'link' }
				className={ 'add-new-sortable-item' }
				style={ { width: '100%' } }
				onClick={ () => {
					setOptions( tax, [
						...items,
						tax !== 'listings'
							? {
									id: items.length,
									value: __( 'New' ),
							  }
							: {
									properties: {
										id: items.length,
										name: __( 'New' ),
										description: '',
										address: '',
										location: undefined,
										itemTags: [],
										itemFilters: [],
									},
							  },
					] );
				} }
			/>
		</>
	);
};
