import { memo, useState } from '@wordpress/element';
import {
	Button,
	CheckboxControl,
	TextareaControl,
	TextControl,
} from '@wordpress/components';
import { Draggable } from 'react-beautiful-dnd';
import { __ } from '@wordpress/i18n';
import React from 'react';
import { MapFilter } from '../../types';

export const PinCard = ( { props, updateItem, deletePin, tags, filters } ) => {
	const [ isOpen, setIsOpen ] = useState( false );

	if ( ! props.properties ) {
		console.error( props, 'Missing properties' );
		return null;
	}

	const {
		name,
		id,
		website,
		address,
		phone,
		emailAddress,
		itemTags,
		itemFilters,
	} = props.properties;

	function hasThatFilter( filter, filterItems ) {
		return filterItems ? filterItems.filter( item => item.value === filter ).length : false;
	}

	function toggleArrayValues(
		mapFilter: MapFilter[] = [],
		value: string,
		newValue: boolean
	): MapFilter[] {
		if ( newValue ) {
			mapFilter.push( { id: tags.length, value } );
		} else {
			mapFilter = mapFilter.filter(
				( filter ) => filter.value === value
			);
		}
		return mapFilter;
	}

	return (
		<Draggable draggableId={ 'pin-' + id } index={ id } key={ id }>
			{ ( provided ) => (
				<div
					ref={ provided.innerRef }
					{ ...provided.draggableProps }
					{ ...provided.dragHandleProps }
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
								({ id }) - { name || 'New' }
							</h4>
							<Button
								onClick={ () => setIsOpen( ! isOpen ) }
								isSmall={ true }
								iconSize={ 16 }
								icon={ 'arrow-down' }
							/>
							<Button
								onClick={ () => deletePin( id ) }
								isSmall={ true }
								icon="trash"
								iconSize={ 16 }
							/>
						</div>
						<TextControl
							label={ __( 'name' ) }
              type={'text'}
							style={ { margin: 0 } }
							value={ name || 'New' }
							onChange={ ( newValue ) => {
								updateItem( id, { name: newValue } );
							} }
						></TextControl>
						<TextControl
							label={ __( 'phone' ) }
              type={'phone'}
							value={ phone || '' }
							onChange={ ( newValue ) => {
								updateItem( id, { phone: newValue } );
							} }
						></TextControl>
						<TextControl
							label={ __( 'email' ) }
              type={'email'}
							value={ emailAddress || '' }
							onChange={ ( newValue ) => {
								updateItem( id, { email: newValue } );
							} }
						></TextControl>
						<TextControl
							label={ __( 'website' ) }
              type={'url'}
							value={ website || '' }
							onChange={ ( newValue ) => {
								updateItem( id, { website: newValue } );
							} }
						></TextControl>
						<TextareaControl
							label={ __( 'Address' ) }
							value={ address || '' }
							onChange={ ( newValue ) => {
								updateItem( id, { Address: newValue } );
							} }
						></TextareaControl>

						<div
							className={ 'flexRow' }
							style={ { display: 'flex', gap: '24px' } }
						>
							<div>
								{ tags.map( ( checkbox, index ) => (
									<CheckboxControl
										label={ checkbox.value }
										checked={ hasThatFilter(
											checkbox.value,
											itemTags
										) }
										key={ index }
										onChange={ ( newValue ) => {
											// given an array of tags, add the item if the checkbox value is true otherwise remove it from array
											updateItem( id, {
												itemTags: toggleArrayValues(
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
								{ filters.map( ( checkbox, index ) => (
									<CheckboxControl
										label={ checkbox.value }
										checked={ hasThatFilter(
											checkbox.value,
											itemFilters
										) }
										key={ index }
										onChange={ ( newValue ) => {
											updateItem( id, {
												itemFilters: toggleArrayValues(
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

export const PinList = memo( function PinList( {
	sortedPins,
	updateItem,
	deletePin,
	tags,
	filters,
} ) {
	return sortedPins.map( ( pin, index ) => (
		<PinCard
			props={ pin }
			key={ index }
			updateItem={ updateItem }
			deletePin={ deletePin }
			tags={ tags }
			filters={ filters }
		/>
	) );
} );
