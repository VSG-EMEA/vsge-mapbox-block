import { useState } from '@wordpress/element';
import {
	Button,
	CheckboxControl,
	ColorPicker,
	Flex,
	Popover,
	FlexItem,
	RangeControl,
	Slot,
	SelectControl,
	TextareaControl,
	TextControl,
} from '@wordpress/components';
import { upload } from '@wordpress/icons';
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
	const [ showColorPicker, setShowColorPicker ] = useState( false );
	const toggleVisible = () => {
		setShowColorPicker( ( state ) => ! state );
	};

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
		iconSize,
		iconColor,
		itemTags,
		itemFilters,
	} = item.properties;

	function hasThatFilter( filter, filterItems ) {
		return filterItems
			? filterItems.filter( ( item ) => item.value === filter ).length
			: false;
	}

	function updateItemProps( data: any ) {
		console.log( item );
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
							__nextHasNoMarginBottom
						></TextControl>
						<TextControl
							label={ __( 'phone' ) }
							type={ 'tel' }
							value={ phone || '' }
							onChange={ ( newValue ) => {
								updateItemProps( { phone: newValue } );
							} }
							__nextHasNoMarginBottom
						></TextControl>
						<TextControl
							label={ __( 'email' ) }
							type={ 'email' }
							value={ emailAddress || '' }
							onChange={ ( newValue ) => {
								updateItemProps( { emailAddress: newValue } );
							} }
							__nextHasNoMarginBottom
						></TextControl>
						<TextControl
							label={ __( 'website' ) }
							type={ 'url' }
							value={ website || '' }
							onChange={ ( newValue ) => {
								updateItemProps( { website: newValue } );
							} }
							__nextHasNoMarginBottom
						></TextControl>
						<TextareaControl
							label={ __( 'Address' ) }
							value={ address || '' }
							onChange={ ( newValue ) => {
								updateItemProps( { address: newValue } );
							} }
							__nextHasNoMarginBottom
						></TextareaControl>

						<Flex justify={ 'bottom' }>
							<SelectControl
								label={ __( 'type' ) }
								value={ item.type }
								options={ [
									{
										value: 'point',
										label: 'Point',
									},
								] }
								onChange={ ( newValue ) => {
									updateItemProps( {
										geometry: {
											...item.geometry,
											type: newValue,
										},
									} );
								} }
							/>
							<TextControl
								label={ __( 'lat' ) }
								value={ item.geometry.coordinates[ 0 ] || 0 }
								disabled={ true }
								onChange={ ( newValue ) =>
									updateItemProps( {
										geometry: {
											...item.geometry,
											coordinates: [
												item.geometry.coordinates[ 0 ],
												newValue,
											],
										},
									} )
								}
							/>
							<TextControl
								label={ __( 'lang' ) }
								value={ item.geometry.coordinates[ 1 ] || 0 }
								disabled={ true }
								onChange={ ( newValue ) =>
									updateItemProps( {
										geometry: {
											...item.geometry,
											coordinates: [
												newValue,
												item.geometry.coordinates[ 1 ],
											],
										},
									} )
								}
							/>
							<Button
								icon={ upload }
								variant={ 'secondary' }
								onClick={ () => setPinPosition( item.id ) }
								label={ __( 'Add Pin' ) }
								showTooltip={ true }
							/>
						</Flex>

						<Flex direction={ 'row' } justify={ 'top' }>
							<FlexItem>
								<h4>Tags</h4>
								{ tags?.map( ( checkbox, index ) => (
									<CheckboxControl
										label={ checkbox.value }
										checked={ hasThatFilter(
											checkbox.value,
											itemTags
										) }
										key={ index }
										className={ 'sortable-pins-checkbox' }
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
							</FlexItem>
							<FlexItem>
								<h4>Filter</h4>
								{ filters?.map( ( checkbox, index ) => (
									<CheckboxControl
										label={ checkbox.value }
										checked={ hasThatFilter(
											checkbox.value,
											itemFilters
										) }
										key={ index }
										className={ 'sortable-pins-checkbox' }
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
							</FlexItem>
						</Flex>

						<h4>Marker</h4>
						<RangeControl
							value={ iconSize }
							onChange={ ( newValue ) => {
								updateItemProps( { iconSize: newValue } );
							} }
							min={ 0 }
							max={ 100 }
							step={ 1 }
						/>

						<Button
							onClick={ () =>
								setShowColorPicker( ! showColorPicker )
							}
							variant={ 'tertiary' }
							className="marker-button"
							iconSize={ 16 }
							icon={ 'paint-brush' }
							aria-label={ __( 'Marker' ) }
							aria-haspopup="true"
							aria-expanded={ showColorPicker }
						>
							<span
								className="color-preview"
								style={ {
									backgroundColor: iconColor?.hex || '#000',
								} }
							></span>
							Marker
							{ showColorPicker && (
								<Popover>
									<ColorPicker
										defaultValue={ '#000' }
										color={ iconColor }
										onChangeComplete={ ( newValue ) => {
											updateItemProps( {
												iconColor: newValue,
											} );
										} }
									/>
								</Popover>
							) }
						</Button>
					</div>
				</div>
			) }
		</Draggable>
	);
};
