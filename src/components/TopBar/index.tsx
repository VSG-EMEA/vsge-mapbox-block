import { Button, Icon, SelectControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { filterListingsBy, fitInView } from '../../utils/view';
import {
	FilterCollection,
	MapboxOptions,
	MountedMapsContextValue,
} from '../../types';
import { useMapboxContext } from '../Mapbox/MapboxContext';
import { __ } from '@wordpress/i18n';
import { removePopups } from '../Popup/';
import './style.scss';

/**
 * trasform an array of strings into a select values that could be used with select control
 *
 * @param {string[]} selectValues       the select values to transform
 * @param            selectValues.id
 * @param            selectValues.value
 * @return {SelectControl.Option[]} the select values
 */
function topbarBuildSelectFromArray(
	selectValues: FilterCollection[]
): { label: string; value: string }[] {
	return selectValues.map( ( item ) => {
		return { label: item.value ?? '', value: item.value ?? '' };
	} );
}

const centerViewIcon = () => (
	<Icon
		icon={ () => (
			<svg
				width={ 20 }
				height={ 20 }
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 48 48"
			>
				<path d="M0 0h48v48H0z" fill="none" />
				<path d="M10 30H6v8a4 4 0 0 0 4 4h8v-4h-8v-8zm0-20h8V6h-8a4 4 0 0 0-4 4v8h4v-8zm28-4h-8v4h8v8h4v-8a4 4 0 0 0-4-4zm0 32h-8v4h8a4 4 0 0 0 4-4v-8h-4v8zM24 16a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
			</svg>
		) }
	/>
);

const resetIcon = () => (
	<Icon
		icon={ () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="24"
				viewBox="0 -960 960 960"
				width={ '24' }
			>
				<path d="M440-122q-121-15-200.5-105.5T160-440q0-66 26-126.5T260-672l57 57q-38 34-57.5 79T240-440q0 88 56 155.5T440-202v80Zm80 0v-80q87-16 143.5-83T720-440q0-100-70-170t-170-70h-3l44 44-56 56-140-140 140-140 56 56-44 44h3q134 0 227 93t93 227q0 121-79.5 211.5T520-122Z" />
			</svg>
		) }
	/>
);

export const TopBar = ( attributes: {
	fitView: boolean;
	tagsEnabled: boolean;
	filtersEnabled: boolean;
	mapboxOptions: MapboxOptions;
} ) => {
	const {
		map,
		mapRef,
		listings,
		filteredListings,
		setListings,
		setFilteredListings,
	}: MountedMapsContextValue = useMapboxContext();
	const { fitView, tagsEnabled, filtersEnabled, mapboxOptions } = attributes;
	const [ filter, setFilter ] = useState( '' );
	const [ tag, setTag ] = useState( '' );

	useEffect( () => {
		// if a filter is selected, filter the listings by filter
		setFilteredListings( filterListingsBy( listings, { filter, tag } ) );
	}, [ filter, tag ] );

	// if no special stuff is required, return null
	return mapRef?.current && map?.current ? (
		<div
			className={
				fitView || filtersEnabled || tagsEnabled
					? 'map-topbar'
					: 'map-topbar-hidden'
			}
		>
			<Button
				icon={ resetIcon }
				hidden={ filteredListings.length !== listings.length }
				isSmall={ true }
				className={ 'reset-filters' }
				onClick={ () => {
					mapRef?.current && removePopups( mapRef.current );
					setFilteredListings( [] );
					setListings( attributes.mapboxOptions.listings );
				} }
			>
				{ __( 'Reset Filters', 'vsge-mapbox-block' ) }
			</Button>

			{ fitView && map ? (
				<Button
					icon={ centerViewIcon }
					isSmall={ true }
					className={ 'fit-view' }
					onClick={ () =>
						mapRef?.current &&
						map?.current &&
						fitInView( map.current, listings, mapRef.current )
					}
				>
					{ __( 'Fit View', 'vsge-mapbox-block' ) }
				</Button>
			) : null }

			{ filtersEnabled ? (
				<SelectControl
					className={ 'mapbox-map-filter filter-by-partnership' }
					value={ filter }
					options={ [
						{
							value: '',
							label: __( 'Select a filter' ),
						},
						...topbarBuildSelectFromArray( mapboxOptions.filters ),
					] }
					onChange={ ( selected ) => setFilter( selected ) }
					__nextHasNoMarginBottom
				/>
			) : null }

			{ tagsEnabled ? (
				<SelectControl
					className={ 'mapbox-map-filter filter-by-tag' }
					value={ tag }
					options={ [
						{
							value: '',
							label: __( 'Select a tag' ),
						},
						...topbarBuildSelectFromArray( mapboxOptions.tags ),
					] }
					onChange={ ( selected ) => setTag( selected ) }
					__nextHasNoMarginBottom
				/>
			) : null }
		</div>
	) : null;
};
