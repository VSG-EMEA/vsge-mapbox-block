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
	key,
	updateItem,
	deleteItem,
	tags,
	filters,
	index,
} ) => {
	const [ isOpen, setIsOpen ] = useState( false );

	return (
		<Draggable
			draggableId={ ( props.properties?.name || 'new' ) + '-' + index }
			index={ index }
		>
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
								({ key }) - { props.properties?.name || 'New' }
							</h4>
							<Button
								onClick={ () => setIsOpen( ! isOpen ) }
								isSmall={ true }
								icon={ 'move' }
							/>
							<Button
								onClick={ () => deleteItem( key ) }
								isSmall={ true }
								icon={ 'close' }
							/>
						</div>
						<TextControl
							label={ __( 'name' ) }
							style={ { margin: 0 } }
							value={ props.properties?.name || 'New' }
							onChange={ ( newValue ) => {
								updateItem( index, { name: newValue } );
							} }
						></TextControl>
						<TextControl
							label={ __( 'phone' ) }
							value={ props.properties?.phone || '' }
							onChange={ ( newValue ) => {
								updateItem( index, { phone: newValue } );
							} }
						></TextControl>
						<TextControl
							label={ __( 'email' ) }
							value={ props.properties?.emailAddress || '' }
							onChange={ ( newValue ) => {
								updateItem( index, { email: newValue } );
							} }
						></TextControl>
						<TextControl
							label={ __( 'website' ) }
							value={ props.properties?.website || '' }
							onChange={ ( newValue ) => {
								updateItem( index, { website: newValue } );
							} }
						></TextControl>
						<TextareaControl
							label={ __( 'Address' ) }
							value={ props.properties?.address || '' }
							onChange={ ( newValue ) => {
								updateItem( index, { Address: newValue } );
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
										value={ 0 }
										key={ index }
										onChange={ ( newValue ) =>
											updateItem(
												checkbox.value,
												newValue
											)
										}
									/>
								) ) }
							</div>
							<div>
								{ filters.map( ( checkbox, index ) => (
									<CheckboxControl
										label={ checkbox.value }
										value={ 0 }
										key={ index }
										onChange={ ( newValue ) =>
											updateItem(
												checkbox.value,
												newValue
											)
										}
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
			key={ pin.id || index }
			index={ index }
			updateItem={ updateItem }
			deleteItem={ deleteItem }
			tags={ tags }
			filters={ filters }
		/>
	) );
} );
