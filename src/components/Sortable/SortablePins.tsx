import { useState } from '@wordpress/element';
import {
	Button,
	CheckboxControl,
	ColorPicker,
	Flex,
	FlexItem,
	PanelRow,
	Popover,
	RangeControl,
	SelectControl,
	TextareaControl,
	TextControl,
} from '@wordpress/components';
import { download, reset, upload } from '@wordpress/icons';
import { Draggable } from 'react-beautiful-dnd';
import { __ } from '@wordpress/i18n';
import {
	FilterCollection,
	MapBoxListing,
	MarkerIcon,
	TagArray,
} from '../../types';
import { Position } from 'geojson';
import { useMapboxContext } from '../Mapbox/MapboxContext';

export const PinCard = ( props: {
	item: MapBoxListing;
	index: number;
	updateItem: Function;
	deleteItem: Function;
	tags: FilterCollection[];
	filters: FilterCollection[];
	icons: MarkerIcon[];
} ) => {
	const { item, index, updateItem, deleteItem, tags, filters, icons } = props;
	const { lngLat } = useMapboxContext();
	const [ isOpen, setIsOpen ] = useState( false );
	const [ showColorPicker, setShowColorPicker ] = useState( false );
	const [ itemData, setItemData ] = useState( item as MapBoxListing );

	if ( ! item?.properties ) {
		console.error( 'Missing properties for item', item );
		return null;
	}

	/**
	 * Check if a filter is present in the default filters array
	 *
	 * @param filter      the filter
	 * @param filterArray the filters array to check against
	 */
	function hasThatFilter(
		filter: string,
		filterArray: string[] | undefined
	): boolean {
		return filterArray
			? filterArray.filter( ( currentFilter: string ) =>
					filterArray.includes( filter )
			  ).length > 0
			: false;
	}

	/**
	 * This function updates the map filter/tag array of the item
	 *
	 * @param mapFilter the current map filter
	 * @param value     the current value
	 * @param isChecked the new value
	 */
	function updateMapFilter(
		mapFilter: TagArray[] = [],
		value: string,
		isChecked: boolean
	) {
		// if newvalue is true add the value to the array
		if ( isChecked ) {
			return [ ...mapFilter, value ];
		}
		// otherwise remove the value
		return mapFilter.filter( ( filter ) => filter !== value );
	}

	/**
	 * This function resets the listing initial data
	 */
	function resetListing() {
		return setItemData( item );
	}

	/**
	 * This function sets the marker color
	 *
	 * @param newValue the new value of the color picker
	 */
	function setMarkerColor( newValue: ColorPicker.OnChangeCompleteValue ) {
		setItemData( {
			...itemData,
			properties: {
				...itemData.properties,
				iconColor: newValue.hex,
			},
		} );
	}

	return (
		<Draggable
			draggableId={ 'draggable-marker-' + itemData.id }
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
						{ /** Listing Headline */ }
						<div className={ 'controlgroup-feature-item' }>
							<h4>
								({ itemData.id }) -{ ' ' }
								{ itemData.properties?.name || __( 'New' ) }
							</h4>
							<Button
								onClick={ () => setIsOpen( ! isOpen ) }
								isSmall={ true }
								iconSize={ 16 }
								icon={ 'arrow-down' }
							/>
							<Button
								onClick={ () => deleteItem( itemData.id ) }
								isSmall={ true }
								icon="trash"
								iconSize={ 16 }
							/>
						</div>

						{ /** main Item Data */ }
						<TextControl
							label={ __( 'name' ) }
							type={ 'text' }
							style={ { margin: 0 } }
							value={ itemData.properties?.name || 'New' }
							onChange={ ( newValue ) => {
								setItemData( {
									...itemData,
									properties: {
										...itemData.properties,
										name: newValue,
									},
								} );
							} }
						></TextControl>
						<TextControl
							label={ __( 'phone' ) }
							type={ 'tel' }
							value={ itemData.properties?.phone || '' }
							onChange={ ( newValue ) => {
								setItemData( {
									...itemData,
									properties: {
										...itemData.properties,
										phone: newValue,
									},
								} );
							} }
						></TextControl>
						<TextControl
							label={ __( 'email' ) }
							type={ 'email' }
							value={ itemData.properties?.emailAddress || '' }
							onChange={ ( newValue ) => {
								setItemData( {
									...itemData,
									properties: {
										...itemData.properties,
										emailAddress: newValue,
									},
								} );
							} }
						></TextControl>
						<TextControl
							label={ __( 'website' ) }
							type={ 'url' }
							value={ itemData.properties?.website || '' }
							onChange={ ( newValue ) => {
								setItemData( {
									...itemData,
									properties: {
										...itemData.properties,
										website: newValue,
									},
								} );
							} }
						></TextControl>
						<TextControl
							label={ __( 'Country' ) }
							type={ 'text' }
							value={ itemData.properties?.country || '' }
							onChange={ ( newValue ) => {
								setItemData( {
									...itemData,
									properties: {
										...itemData.properties,
										country: newValue,
									},
								} );
							} }
						></TextControl>
						<TextControl
							label={ __( 'Country Code' ) }
							type={ 'text' }
							value={ itemData.properties?.countryCode || '' }
							onChange={ ( newValue ) => {
								setItemData( {
									...itemData,
									properties: {
										...itemData.properties,
										countryCode: newValue,
									},
								} );
							} }
						></TextControl>
						<TextareaControl
							label={ __( 'Address' ) }
							value={ itemData.properties?.address || '' }
							onChange={ ( newValue ) => {
								setItemData( {
									...itemData,
									properties: {
										...itemData.properties,
										address: newValue,
									},
								} );
							} }
							__nextHasNoMarginBottom={ true }
						></TextareaControl>

						<Flex justify={ 'bottom' }>
							<SelectControl
								label={ __( 'type' ) }
								value={ itemData.type }
								options={ [
									{
										value: 'point',
										label: 'Point',
									},
								] }
								onChange={ ( newValue ) => {
									setItemData( {
										...itemData,
										geometry: {
											...itemData.geometry,
											type: newValue,
										},
									} );
								} }
							/>
							<TextControl
								label={ __( 'lat' ) }
								value={
									itemData.geometry.coordinates[ 0 ] || 0
								}
								onChange={ ( newValue ) =>
									setItemData( {
										geometry: {
											...itemData.geometry,
											coordinates: [
												itemData.geometry
													?.coordinates[ 0 ] || 0,
												newValue,
											] as Position,
										},
									} )
								}
							/>
							<TextControl
								label={ __( 'lang' ) }
								value={
									itemData.geometry.coordinates[ 1 ] || 0
								}
								onChange={ ( newValue ) =>
									setItemData( {
										geometry: {
											...itemData.geometry,
											coordinates: [
												newValue,
												itemData.geometry
													?.coordinates[ 1 ] || 0,
											] as Position,
										},
									} )
								}
							/>
							<Button
								icon={ upload }
								variant={ 'secondary' }
								disabled={ ! lngLat?.lng || ! lngLat?.lat }
								onClick={ () => {
									setItemData( {
										...itemData,
										geometry: {
											type: 'Point',
											coordinates: [
												lngLat?.lng || 0,
												lngLat?.lat || 0,
											],
										},
									} );
								} }
								label={ __( 'Add Pin' ) }
								showTooltip={ true }
							/>
						</Flex>

						{ /** Tags */ }
						<Flex direction={ 'row' } justify={ 'top' }>
							<FlexItem
								style={ { width: '50%', alignSelf: 'start' } }
							>
								<h4>Tags</h4>

								{ tags?.map( ( checkbox, i ) => (
									<CheckboxControl
										label={ checkbox.value }
										checked={ itemData.properties?.itemTags?.includes(
											checkbox.value
										) }
										key={ i }
										className={ 'sortable-pins-checkbox' }
										onChange={ ( isChecked ) => {
											// given an array of tags, add the item if the checkbox value is true otherwise remove it from array
											setItemData( {
												...itemData,
												properties: {
													...itemData.properties,
													itemTags: updateMapFilter(
														itemData.properties
															?.itemTags,
														checkbox.value,
														isChecked
													),
												},
											} );
										} }
									/>
								) ) }
							</FlexItem>
							<FlexItem
								style={ { width: '50%', alignSelf: 'start' } }
							>
								<h4>Filter</h4>
								{ filters?.map( ( checkbox, i ) => (
									<CheckboxControl
										label={ checkbox.value }
										checked={ itemData.properties?.itemFilters?.includes(
											checkbox.value
										) }
										key={ i }
										className={ 'sortable-pins-checkbox' }
										onChange={ ( isChecked ) => {
											setItemData( {
												...itemData,
												properties: {
													...itemData.properties,
													itemFilters:
														updateMapFilter(
															itemData.properties
																?.itemFilters,
															checkbox.value,
															isChecked
														),
												},
											} );
										} }
									/>
								) ) }
							</FlexItem>
						</Flex>

						{ /** Marker Style */ }
						<h4>Marker</h4>
						<RangeControl
							value={ itemData.properties?.iconSize }
							onChange={ ( newValue ) => {
								setItemData( {
									...itemData,
									properties: {
										...itemData.properties,
										iconSize: newValue,
									},
								} );
							} }
							min={ 0 }
							max={ 100 }
							step={ 1 }
						/>
						<SelectControl
							label={ __( 'Select a Marker' ) }
							value={ itemData.properties?.icon }
							options={ [
								{ value: 'default', label: __( 'Default' ) },
								...icons.map( ( icon ) => {
									return {
										value: 'custom-' + String( icon.id ),
										label: icon.name,
									};
								} ),
							] }
							onChange={ ( newValue ) => {
								setItemData( {
									...itemData,
									properties: {
										...itemData.properties,
										icon: newValue,
									},
								} );
							} }
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
									backgroundColor:
										itemData.properties?.iconColor ||
										'#000',
								} }
							></span>
							Marker
							{ showColorPicker && (
								<Popover>
									<ColorPicker
										defaultValue={ '#f00' }
										color={ itemData.properties?.iconColor }
										onChangeComplete={ setMarkerColor }
									/>
								</Popover>
							) }
						</Button>
						<PanelRow>
							<Button
								onClick={ () => updateItem( itemData ) }
								label={ __( 'Save item data' ) }
								variant={ 'primary' }
								iconSize={ 16 }
								icon={ download }
							>
								{ __( 'Save changes' ) }
							</Button>
							<Button
								onClick={ () => resetListing() }
								label={ __( 'Reset' ) }
								variant={ 'secondary' }
								iconSize={ 16 }
								icon={ reset }
							>
								{ __( 'Reset' ) }
							</Button>
						</PanelRow>
					</div>
				</div>
			) }
		</Draggable>
	);
};
