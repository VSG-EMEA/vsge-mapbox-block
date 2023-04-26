import { Button, Icon, SelectControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { safeSlug } from '../../utils';
import { fitInView } from '../../utils/view';

/**
 * trasform an array of strings into a select values that could be used with select control
 *
 * @param {string[]} selectValues       the select values to transform
 * @param            selectValues.id
 * @param            selectValues.value
 * @return {SelectControl.Option[]} the select values
 */
function topbarSelectValue( selectValues: { id: number; value: string } ) {
	const selectItems = selectValues.map( ( item ) => {
		return { label: item.value, value: safeSlug( item.value ) };
	} );
	return selectItems;
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

export const TopBar = ( attributes ) => {
	const { fitView, tagsEnabled, filtersEnabled, mapboxOptions } = attributes;
	const [ filter, setFilter ] = useState( '' );
	const [ tag, setTag ] = useState( '' );

	return (
		<div className={ 'map-topbar' }>
			{ fitView ? (
				<Button
					icon={ centerViewIcon }
					isSmall={ true }
					className={ 'fit-view' }
					onClick={ () => fitInView() }
				>
					fit-view
				</Button>
			) : null }

			{ tagsEnabled ? (
				<SelectControl
					className={ 'mapbox-map-filter filter-by-partnership' }
					value={ filter }
					options={ [
						{
							value: '',
							label: 'Select a partnership',
							disabled: true,
						},
						...topbarSelectValue( mapboxOptions.filters ),
					] }
					onChange={ ( selected ) => setFilter( selected ) }
					__nextHasNoMarginBottom
				/>
			) : null }

			{ filtersEnabled ? (
				<SelectControl
					className={ 'mapbox-map-filter filter-by-tag' }
					value={ tag }
					options={ [
						{ value: '', label: 'Select a tag', disabled: true },
						...topbarSelectValue( mapboxOptions.tags ),
					] }
					onChange={ ( selected ) => setTag( selected ) }
					__nextHasNoMarginBottom
				/>
			) : null }
		</div>
	);
};
