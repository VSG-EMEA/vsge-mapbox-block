import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { StringItem } from './SortableItems';
import { PinCard } from './SortablePins';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useContext, useEffect } from '@wordpress/element';
import { MapboxContext } from '../Mapbox/MapboxContext';
import { plusCircle } from '@wordpress/icons';
import { getNextId, reorder } from '../../utils/dataset';
import { MapBoxListing, MapboxOptions, TagArray, MapItem } from '../../types';
import { LngLatLike } from 'mapbox-gl';
import { defaultMarkerProps } from '../Mapbox/defaults';
import { removePopups } from '../Popup/Popup';

interface SortableProps {
	items: TagArray[];
	tax: string;
	setOptions: Function;
	mapboxOptions?: MapboxOptions;
}

export const Sortable = ( props: SortableProps ): JSX.Element => {
	const {
		items,
		tax,
		setOptions,
		mapboxOptions,
	}: {
		items: TagArray[] | MapItem[];
		tax: string;
		setOptions: Function;
		mapboxOptions?: MapboxOptions;
	} = props;

	const { lngLat, mapRef } = useContext( MapboxContext );

	/**
	 * Fired when the drag ends on a droppable item
	 *
	 * @param item
	 * @param item.destination
	 * @param item.destination.index
	 * @param item.source
	 * @param item.source.index
	 */
	function _onDragEnd( item: {
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

	/**
	 * This function updates an item in a list of items using the new value provided.
	 *
	 * @param {MapBoxListing} newValue - newValue is a parameter of type MapBoxListing, which is an object
	 *                                 containing updated information for an item. This function is used to update an item in an array of
	 *                                 items (props.items) by finding the item with a matching id and replacing its properties with the
	 *                                 updated values from newValue. The updated array
	 */
	function updateItem( newValue: TagArray[] ) {
		const newItems: TagArray[] = props.items.map( ( item ) =>
			item.id === newValue.id
				? {
						...item,
						...newValue,
				  }
				: item
		);
		setOptions( tax, newItems );
	}

	/**
	 * This function updates the position of a marker in a list of MapBox listings.
	 *
	 * @param {MapBoxListing[]} Listings     - An array of MapBoxListing objects, which likely contain
	 *                                       information about locations and their coordinates.
	 * @param {number}          id           - The id parameter is a number that represents the unique identifier of a
	 *                                       MapBoxListing item. It is used to identify the specific item in the Listings array that needs to be
	 *                                       updated.
	 * @param {LngLatLike}      markerCoords - markerCoords is a variable of type LngLatLike, which represents
	 *                                       the longitude and latitude coordinates of a marker on a map. It is used in the function to update
	 *                                       the coordinates of a specific marker in a list of MapBoxListing objects.
	 */
	function updateMarkerPosition(
		Listings: MapBoxListing[],
		id: number,
		markerCoords: LngLatLike
	) {
		const newItems = Listings.map( ( item ) =>
			item.id === id
				? {
						...item,
						geometry: {
							type: 'point',
							coordinates: markerCoords || [
								lngLat?.lng || 0,
								lngLat?.lat || 0,
							],
						},
				  }
				: item
		);
	}

	/**
	 * The function adds a new MapBoxListing to a list of items with a unique ID and default properties.
	 *
	 * @param {number} nextId - The nextId parameter is a number that represents the ID of the next
	 *                        listing to be added. It is used to assign a unique ID to the new listing being created.
	 */
	function addNewListing( nextId: number ) {
		const newListing: Pick<
			MapBoxListing,
			'id' | 'type' | 'properties' | 'geometry'
		> = {
			id: nextId,
			type: 'Feature',
			properties: {
				...defaultMarkerProps,
				name: [ __( 'New Marker' ), String( nextId ) ].join( ' ' ),
			},
			geometry: {
				type: 'Point',
				coordinates: [ lngLat?.lng || 0, lngLat?.lat || 0 ],
			},
		};
		removePopups( mapRef );
		setOptions( 'listings', [ ...items, newListing ] );
	}

	/**
	 * This function adds a new sortable item to a list of options with a unique ID and a value.
	 *
	 * @param {number} nextId - The nextId parameter is a number that represents the ID of the next
	 *                        sortable item to be added. It is used to generate a unique ID for the new item and is passed as a
	 *                        parameter to the addNewSortableItem function.
	 */
	function addNewSortableItem( nextId: number ) {
		setOptions( tax, [
			...items,
			{
				id: nextId,
				value: [ __( 'New' ), tax, nextId ].join( ' ' ),
			},
		] );
	}

	/**
	 * This function removes an item from an array and updates the options.
	 *
	 * @param {number} id - The id parameter is a number that represents the unique identifier of the item
	 *                    that needs to be deleted from an array.
	 */
	function deleteItem( id: number ) {
		// remove the item from the array
		console.log( id, 'removed' );
		const newItems = items.filter( ( item ) => item.id !== id );
		// TODO: remove marker from map if it exists before continuing
		// removeMarker( id );
		setOptions( tax, newItems );
	}

	return (
		<>
			<DragDropContext
				onDragEnd={ ( result: DropResult ) =>
					_onDragEnd( {
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
							{ tax !== 'listings'
								? items?.map( ( item, index ) => (
										<StringItem
											item={ item }
											tax={ tax }
											key={ item.id }
											index={ index }
											updateItem={ updateItem }
											deleteItem={ deleteItem }
										/>
								  ) )
								: items?.map( ( item, index: number ) => (
										<PinCard
											item={ item }
											key={ item.id }
											index={ index }
											updateItem={ updateItem }
											deleteItem={ deleteItem }
											tags={ mapboxOptions?.tags || [] }
											filters={
												mapboxOptions?.filters || []
											}
											icons={ mapboxOptions?.icons || [] }
										/>
								  ) ) }
							{ provided.placeholder }
						</div>
					) }
				</Droppable>
			</DragDropContext>
			<Button
				icon={ plusCircle }
				text={ __( 'Add new' ) }
				className={ 'add-new-sortable-item' }
				style={ { width: '100%' } }
				onClick={ () => {
					if ( tax !== 'listings' ) {
						return addNewSortableItem( getNextId( items ) );
					}
					return addNewListing( getNextId( items ) );
				} }
			/>
		</>
	);
};
