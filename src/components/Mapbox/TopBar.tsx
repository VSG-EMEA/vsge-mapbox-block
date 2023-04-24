import { Button, SelectControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { safeSlug } from '../../utils';

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

export const TopBar = ( attributes ) => {
	const { fitView, tagsEnabled, filtersEnabled, mapboxOptions } = attributes;
	const [ filter, setFilter ] = useState( '' );
	const [ tag, setTag ] = useState( '' );

	return (
		<div className={ 'map-topbar' }>
			{ fitView ? (
				<Button
					icon={ 'align-center' }
					className={
						'button button-secondary outlined has-white-background-color fit-view'
					}
				>
					fit-view
				</Button>
			) : null }

			{ tagsEnabled ? (
				<SelectControl
					label={ __( 'partnership:' ) }
					className={ 'filter-by-partnership' }
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
					label={ __( 'Tag:' ) }
					className={ 'filter-by-tag' }
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
