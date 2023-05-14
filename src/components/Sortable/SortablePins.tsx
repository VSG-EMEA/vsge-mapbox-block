import { useState } from '@wordpress/element';
import {
	Button,
	CheckboxControl,
	TextareaControl,
	TextControl,
} from '@wordpress/components';
import { Draggable } from 'react-beautiful-dnd';
import { __ } from '@wordpress/i18n';
import { MapFilter } from '../../types';
import { getNextId } from '../../utils/dataset';

export const PinCard = ( {
	item,
	index,
	updateItem,
	deleteItem,
	setPinPosition,
	tags,
	filters,
} ) => {
	const [ isOpen, setIsOpen ] = useState( false );

	if ( ! item?.properties ) {
		console.error( item, 'Missing properties' );
		return null;
	}

	const {
		name,
		website,
		address,
		phone,
		emailAddress,
		itemTags,
		itemFilters,
	} = item.properties;

	function hasThatFilter( filter, filterItems ) {
		return filterItems
			? filterItems.filter( ( item ) => item.value === filter ).length
			: false;
	}

	function updateItemProps( data: any ) {
		updateItem( item.id, {
			properties: {
				...item.properties,
				...data,
			},
		} );
	}

	function updateMapFilter(
		mapFilter: MapFilter[] = [],
		value: string,
		newValue: boolean
	) {
		if ( newValue ) {
			return [ ...mapFilter, { id: getNextId( mapFilter ), value } ];
		}
		return mapFilter.filter( ( filter ) => filter.value !== value );
	}

	return (
		<Draggable
			draggableId={ 'draggable-marker-' + item.id }
			index={ index }
		>
			{ ( provided ) => (
				<div
					ref={ provided.innerRef }
					{ ...provided.draggableProps }
					{ ...provided.dragHandleProps }
					className={ 'draggable-index-' + index }
				>
					<div
						className={ 'dnd-wrap' + ( isOpen ? ' is-open' : '' ) }
						style={ {
							padding: ' 8px',
							border: '1px solid #ccc',
							borderRadius: '2px',
							marginBottom: '4px',
						} }
					>
						<div className={ 'controlgroup-feature-item' }>
							<h4>
								({ item.id }) - { name || 'New' }
							</h4>
							<Button
								onClick={ () => setIsOpen( ! isOpen ) }
								isSmall={ true }
								iconSize={ 16 }
								icon={ 'arrow-down' }
							/>
							<Button
								onClick={ () => deleteItem( item.id ) }
								isSmall={ true }
								icon="trash"
								iconSize={ 16 }
							/>
						</div>
						<TextControl
							label={ __( 'name' ) }
							type={ 'text' }
							style={ { margin: 0 } }
							value={ name || 'New' }
							onChange={ ( newValue ) => {
								updateItemProps( { name: newValue } );
							} }
						></TextControl>
						<TextControl
							label={ __( 'phone' ) }
							type={ 'tel' }
							value={ phone || '' }
							onChange={ ( newValue ) => {
								updateItemProps( { phone: newValue } );
							} }
						></TextControl>
						<TextControl
							label={ __( 'email' ) }
							type={ 'email' }
							value={ emailAddress || '' }
							onChange={ ( newValue ) => {
								updateItemProps( { emailAddress: newValue } );
							} }
						></TextControl>
						<TextControl
							label={ __( 'website' ) }
							type={ 'url' }
							value={ website || '' }
							onChange={ ( newValue ) => {
								updateItemProps( { website: newValue } );
							} }
						></TextControl>
						<TextareaControl
							label={ __( 'Address' ) }
							value={ address || '' }
							onChange={ ( newValue ) => {
								updateItemProps( { address: newValue } );
							} }
						></TextareaControl>
						<TextControl
							label={ __( 'lat' ) }
							value={ item.geometry.coordinates[ 0 ] || 0 }
							disabled={ true }
							onChange={ () => null }
						/>
						<TextControl
							label={ __( 'lang' ) }
							value={ item.geometry.coordinates[ 1 ] || 0 }
							disabled={ true }
							onChange={ () => null }
						/>
						<Button
							variant={ 'secondary' }
							onClick={ () => setPinPosition( item.id ) }
						>
							{ __( 'get position' ) }
						</Button>

						<div
							className={ 'flexRow' }
							style={ { display: 'flex', gap: '24px' } }
						>
							<div>
								<h4>Tags</h4>
								{ tags?.map( ( checkbox, index ) => (
									<CheckboxControl
										label={ checkbox.value }
										checked={ hasThatFilter(
											checkbox.value,
											itemTags
										) }
										key={ index }
										onChange={ ( newValue ) => {
											// given an array of tags, add the item if the checkbox value is true otherwise remove it from array
											updateItemProps( {
												itemTags: updateMapFilter(
													itemTags,
													checkbox.value,
													newValue
												),
											} );
										} }
									/>
								) ) }
							</div>
							<div>
								<h4>Filter</h4>
								{ filters?.map( ( checkbox, index ) => (
									<CheckboxControl
										label={ checkbox.value }
										checked={ hasThatFilter(
											checkbox.value,
											itemFilters
										) }
										key={ index }
										onChange={ ( newValue ) => {
											updateItemProps( {
												itemFilters: updateMapFilter(
													itemFilters,
													checkbox.value,
													newValue
												),
											} );
										} }
									/>
								) ) }
							</div>
						</div>
					</div>
				</div>
			) }
		</Draggable>
	);
};
