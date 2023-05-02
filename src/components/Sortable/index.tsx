import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { reorder } from './utils';
import { StringList } from './SortableItems';
import { PinList } from './SortablePins';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useContext, useEffect } from '@wordpress/element';
import { MapboxContext } from '../Mapbox/MapboxContext';
import { addTemplate } from '@wordpress/icons';

export const Sortable = ( props: {
	items: any;
	tax: string;
	setOptions: any;
	mapboxOptions: any;
} ): JSX.Element => {
	const { items, tax, setOptions, mapboxOptions } = props;

	const { lngLat } = useContext( MapboxContext );

	/**
	 * Fired when the drag ends on a droppable item
	 *
	 * @param item
	 * @param item.destination
	 * @param item.destination.index
	 * @param item.source
	 * @param item.source.index
	 */
	function onDragEnd( item: {
		destination: { index: any };
		source: { index: any };
	} ) {
		// dropped outside the list
		if ( ! item.destination ) {
			return;
		}
		setOptions(
			tax,
			reorder( items, item.source.index, item.destination.index )
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

	function updatePin( id: number, newValue: Object ) {
		const newItems = items.map( ( item ) =>
			item.properties.id === id
				? {
						...item,
						...newValue,
				  }
				: item
		);
		setOptions( tax, newItems );
	}

	function setPinPosition( id: number ) {
		const newItems = items.map( ( item ) =>
			item.properties.id === id
				? {
						...item,
						geometry: {
							type: 'point',
							coordinates: [ lngLat?.lng || 0, lngLat?.lat || 0 ],
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
									updatePin={ updatePin }
									deletePin={ deletePin }
									setPinPosition={ setPinPosition }
								/>
							) }
							{ provided.placeholder }
						</div>
					) }
				</Droppable>
			</DragDropContext>
			<Button
				icon={ addTemplate }
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
									value: __( 'New' ) + ' ' + tax,
							  }
							: {
									type: 'Feature',
									properties: {
										id: items.length,
										name: __( 'New Marker' ),
										description: '',
										address: '',
										location: undefined,
										itemTags: [],
										itemFilters: [],
									},
									geometry: {
										type: 'Point',
										coordinates: [ 0, 0 ],
									},
							  },
					] );
				} }
			/>
		</>
	);
};
