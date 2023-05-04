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

export const PinCard = ( {
	props,
	updateItem,
	deleteItem,
	setPinPosition,
	tags,
	filters,
} ) => {
	const [ isOpen, setIsOpen ] = useState( false );

	if ( ! props?.properties ) {
		console.error( props, 'Missing properties' );
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
	} = props.properties;

	function hasThatFilter( filter, filterItems ) {
		return filterItems
			? filterItems.filter( ( item ) => item.value === filter ).length
			: false;
	}

	function updateItemProps( data: any ) {
		updateItem( props.id, {
			properties: {
				...props.properties,
				...data,
			},
		} );
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
		<Draggable
			draggableId={ 'pin-' + props.id }
			index={ props.id }
			key={ props.id }
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
								({ props.id }) - { name || 'New' }
							</h4>
							<Button
								onClick={ () => setIsOpen( ! isOpen ) }
								isSmall={ true }
								iconSize={ 16 }
								icon={ 'arrow-down' }
							/>
							<Button
								onClick={ () => deleteItem( props.id ) }
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
							value={ props.geometry.coordinates[ 0 ] }
							disabled={ true }
							onChange={ () => null }
						/>
						<TextControl
							label={ __( 'lang' ) }
							value={ props.geometry.coordinates[ 1 ] }
							disabled={ true }
							onChange={ () => null }
						/>
						<Button
							variant={ 'secondary' }
							onClick={ () => setPinPosition( props.id ) }
						>
							{ __( 'get position' ) }
						</Button>

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
											updateItemProps( {
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
											updateItemProps( {
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
	deleteItem,
	setPinPosition,
	tags,
	filters,
} ) {
	return sortedPins.map( ( pin, index ) => (
		<PinCard
			props={ pin }
			key={ index }
			updateItem={ updateItem }
			deleteItem={ deleteItem }
			setPinPosition={ setPinPosition }
			tags={ tags }
			filters={ filters }
		/>
	) );
} );
