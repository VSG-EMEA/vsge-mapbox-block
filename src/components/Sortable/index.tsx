import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { StringItem } from './SortableItems';
import { PinCard } from './SortablePins';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useContext, useEffect } from '@wordpress/element';
import { MapboxContext } from '../Mapbox/MapboxContext';
import { plusCircle } from '@wordpress/icons';
import React, { MapHTMLAttributes } from 'react';
import { getNextId, reorder } from '../../utils/dataset';
import { MapBoxListing, MapboxOptions } from '../../types';
import { LngLat, MapboxGeoJSONFeature } from 'mapbox-gl';

export const Sortable = ( props: {
	items: MapBoxListing[];
	tax: string;
	setOptions: Function;
	mapboxOptions: MapboxOptions;
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
	function _onDragEnd( item: {
		destination: { index: any };
		source: { index: any };
	} ) {
		console.log( item, items, 'dropped' );
		// dropped outside the list
		if ( ! item.destination ) {
			return;
		}
		setOptions(
			tax,
			reorder( items, item.source.index, item.destination.index )
		);
	}

	function updateItem( newValue: MapBoxListing ) {
		const newItems = props.items.map( ( item ) =>
			item.id === newValue.id
				? {
						...item,
						...newValue,
				  }
				: item
		);
		setOptions( tax, newItems );
	}

	function updateMarkerPosition(
		Listings: MapBoxListing[],
		id: number,
		markerCoords: mapboxgl.LngLat | undefined
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

	function setPinPosition( id: number, coords: LngLat | undefined = lngLat ) {
		updateMarkerPosition( items, id, coords );
	}

	function deleteItem( id: number ) {
		// remove the item from the array
		const newItems = items.filter( ( item ) => item.id !== id );
		setOptions( tax, newItems );
	}

	useEffect( () => {
		items.forEach( ( item: any, index: number ) => {
			if ( ! item?.id ) item = { ...item, id: index };
		} );
	}, [] );

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
								: items?.map( ( item, index ) => (
										<PinCard
											item={ item }
											key={ item.id }
											index={ index }
											updateItem={ updateItem }
											deleteItem={ deleteItem }
											tags={ mapboxOptions.tags }
											filters={ mapboxOptions.filters }
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
				type={ 'link' }
				className={ 'add-new-sortable-item' }
				style={ { width: '100%' } }
				onClick={ () => {
					const nextID = getNextId( items );
					setOptions( tax, [
						...items,
						tax !== 'listings'
							? {
									id: nextID,
									value: [ __( 'New' ), tax, nextID ].join(
										' '
									),
							  }
							: {
									id: nextID,
									type: 'Feature',
									properties: {
										name: [
											__( 'New Marker' ),
											nextID,
										].join( ' ' ),
										description: '',
										address: '',
										location: undefined,
										itemTags: [],
										itemFilters: [],
									},
									geometry: {
										type: 'Point',
										coordinates: [
											lngLat?.lng || 0,
											lngLat?.lat || 0,
										],
									},
							  },
					] );
				} }
			/>
		</>
	);
};
