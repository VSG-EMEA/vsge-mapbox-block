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
import { useMapboxContext } from '../Mapbox/MapboxContext';
import { IconPreview } from './IconPreview';

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
		// eslint-disable-next-line no-console
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
		mapFilter: TagArray | undefined = [],
		value: string,
		isChecked: boolean
	): TagArray {
		// if the new value is true add the value to the array
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
	 * @param newValue     the new value of the color picker
	 * @param newValue.hex the hex value
	 */
	function setMarkerColor( newValue: { hex: string } ) {
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
								{ itemData.properties?.name ||
									__( 'New', 'vsge-mapbox-block' ) }
							</h4>
							<Button
								onClick={ () => setIsOpen( ! isOpen ) }
								isSmall={ true }
								iconSize={ 16 }
								icon={ 'arrow-down' }
							/>
						</div>

						<Flex justify={ 'space-between' } align={ 'center' }>
							<SelectControl
								label={ __( 'type', 'vsge-mapbox-block' ) }
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
								label={ __( 'lat', 'vsge-mapbox-block' ) }
								value={
									itemData.geometry.coordinates[ 0 ] || 0
								}
								onChange={ ( newValue ) =>
									setItemData( {
										...itemData,
										geometry: {
											...itemData.geometry,
											coordinates: [
												itemData.geometry
													?.coordinates[ 0 ] || 0,
												Number( newValue ) || 0,
											],
										},
									} )
								}
							/>
							<TextControl
								label={ __( 'lang', 'vsge-mapbox-block' ) }
								value={
									itemData.geometry.coordinates[ 1 ] || 0
								}
								onChange={ ( newValue ) =>
									setItemData( {
										...itemData,
										geometry: {
											...itemData.geometry,
											coordinates: [
												Number( newValue ) || 0,
												itemData.geometry
													?.coordinates[ 1 ] || 0,
											],
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
								label={ __( 'Add Pin', 'vsge-mapbox-block' ) }
								showTooltip={ true }
							/>
						</Flex>

						<hr />

						{ /** main Item Data */ }
						<TextControl
							label={ __( 'Name', 'vsge-mapbox-block' ) }
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
							label={ __( 'Phone', 'vsge-mapbox-block' ) }
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
							label={ __( 'Mobile', 'vsge-mapbox-block' ) }
							type={ 'tel' }
							value={ itemData.properties?.mobile || '' }
							onChange={ ( newValue ) => {
								setItemData( {
									...itemData,
									properties: {
										...itemData.properties,
										mobile: newValue,
									},
								} );
							} }
						></TextControl>
						<TextControl
							label={ __( 'Email', 'vsge-mapbox-block' ) }
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
							label={ __( 'website', 'vsge-mapbox-block' ) }
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
							label={ __( 'City', 'vsge-mapbox-block' ) }
							type={ 'text' }
							value={ itemData.properties?.city || '' }
							onChange={ ( newValue ) => {
								setItemData( {
									...itemData,
									properties: {
										...itemData.properties,
										city: newValue,
									},
								} );
							} }
						></TextControl>
						<TextControl
							label={ __( 'Country', 'vsge-mapbox-block' ) }
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
							label={ __( 'Postal Code', 'vsge-mapbox-block' ) }
							type={ 'text' }
							value={ itemData.properties?.postalCode || '' }
							onChange={ ( newValue ) => {
								setItemData( {
									...itemData,
									properties: {
										...itemData.properties,
										postalCode: newValue,
									},
								} );
							} }
						></TextControl>
						<TextControl
							label={ __( 'Country Code', 'vsge-mapbox-block' ) }
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
							label={ __( 'Address', 'vsge-mapbox-block' ) }
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

						{ /** Tags */ }
						<Flex direction={ 'row' } justify={ 'top' }>
							<FlexItem className={ 'sortable-pins-column' }>
								<h4 className={ 'sortable-pins-column__title' }>
									Tags
								</h4>
								<hr />

								{ tags?.map( ( checkbox, i ) => (
									<CheckboxControl
										label={ checkbox.value }
										checked={ itemData.properties?.itemTags?.includes(
											checkbox.value as string
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
														checkbox.value || '',
														isChecked
													),
												},
											} );
										} }
									/>
								) ) }
							</FlexItem>
							<FlexItem
								className={ 'sortable-pins-column' }
								style={ { width: '50%', alignSelf: 'start' } }
							>
								<h4 className={ 'sortable-pins-column__title' }>
									{ __( 'Filters', 'vsge-mapbox-block' ) }
								</h4>
								<hr />
								{ filters?.map( ( checkbox, i ) => (
									<CheckboxControl
										label={ checkbox.value }
										checked={ itemData.properties?.itemFilters?.includes(
											checkbox.value as string
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
															checkbox.value as string,
															isChecked
														),
												},
											} );
										} }
									/>
								) ) }
							</FlexItem>
						</Flex>
						<hr />

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

						<Flex
							direction={ 'row' }
							justify={ 'space-between' }
							gap={ '8px' }
						>
							<IconPreview
								iconName={ itemData.properties?.icon }
								iconSet={ icons }
							/>
							<SelectControl
								label={ __(
									'Select a Marker',
									'vsge-mapbox-block'
								) }
								value={ itemData.properties?.icon }
								options={ [
									{
										value: 'default',
										label: __(
											'Default',
											'vsge-mapbox-block'
										),
									},
									...icons.map( ( icon ) => {
										return {
											value:
												'custom-' + String( icon.id ),
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
								aria-label={ __(
									'Marker',
									'vsge-mapbox-block'
								) }
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
								{ showColorPicker && (
									<Popover>
										<ColorPicker
											defaultValue={ '#f00' }
											color={
												itemData.properties?.iconColor
											}
											onChangeComplete={ setMarkerColor }
										/>
									</Popover>
								) }
							</Button>
						</Flex>
						<PanelRow>
							<Flex gap={ '8px' }>
								<Button
									onClick={ () => deleteItem( itemData.id ) }
									variant={ 'secondary' }
									icon="trash"
									iconSize={ 16 }
								/>
								<Button
									onClick={ () => resetListing() }
									variant={ 'secondary' }
									iconSize={ 16 }
									icon={ reset }
								>
									{ __( 'Reset', 'vsge-mapbox-block' ) }
								</Button>
								<Button
									style={ { marginLeft: 'auto' } }
									onClick={ () => updateItem( itemData ) }
									variant={ 'primary' }
									iconSize={ 16 }
									icon={ download }
								>
									{ __( 'Save', 'vsge-mapbox-block' ) }
								</Button>
							</Flex>
						</PanelRow>
					</div>
				</div>
			) }
		</Draggable>
	);
};
