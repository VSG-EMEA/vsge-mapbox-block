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

export const PinCard = ( {
	props,
	updateItem,
	deleteItem,
	tags,
	filters,
	index,
} ) => {
	const [ isOpen, setIsOpen ] = useState( false );

	if ( ! props.properties ) {
		console.error( props, 'Missing properties' );
		return null;
	}

	const { name, id, website, address, phone, emailAddress } =
		props.properties;

	function toggleArrayValues( tags, value, newValue: boolean ) {
		let newTags;
		if ( newValue ) {
			tags.push( value );
		} else {
			newTags = tags.filter( ( tag ) => tag.value === value );
		}
		return newTags;
	}

	return (
		<Draggable draggableId={ ( name || 'new' ) + '-' + id } index={ index }>
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
								onClick={ () => deleteItem( id ) }
								isSmall={ true }
								icon="trash"
								iconSize={ 16 }
							/>
						</div>
						<TextControl
							label={ __( 'name' ) }
							style={ { margin: 0 } }
							value={ name || 'New' }
							onChange={ ( newValue ) => {
								updateItem( id, { name: newValue } );
							} }
						></TextControl>
						<TextControl
							label={ __( 'phone' ) }
							value={ phone || '' }
							onChange={ ( newValue ) => {
								updateItem( id, { phone: newValue } );
							} }
						></TextControl>
						<TextControl
							label={ __( 'email' ) }
							value={ emailAddress || '' }
							onChange={ ( newValue ) => {
								updateItem( id, { email: newValue } );
							} }
						></TextControl>
						<TextControl
							label={ __( 'website' ) }
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
										checked={
											tags.filter(
												( tag ) =>
													tag.value === checkbox.value
											).length
										}
										key={ index }
										onChange={ ( newValue ) => {
											// given an array of tags, add the item if the checkbox value is true otherwise remove it from array
											const newTags = toggleArrayValues(
												tags,
												checkbox.value,
												newValue
											);
											updateItem( id, {
												tags: [ newTags ],
											} );
										} }
									/>
								) ) }
							</div>
							<div>
								{ filters.map( ( checkbox, index ) => (
									<CheckboxControl
										label={ checkbox.value }
										checked={ filters.includes(
											checkbox.value
										) }
										key={ index }
										onChange={ ( newValue ) => {
											const newFilters =
												toggleArrayValues(
													filters,
													checkbox.value,
													newValue
												);
											updateItem( id, {
												filters: newFilters,
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
	deleteItem,
	tags,
	filters,
} ) {
	return sortedPins.map( ( pin, index ) => (
		<PinCard
			props={ pin }
			index={ index }
			updateItem={ updateItem }
			deleteItem={ deleteItem }
			tags={ tags }
			filters={ filters }
		/>
	) );
} );
