import { __ } from '@wordpress/i18n';
import React from 'react';
import { Button } from '@wordpress/components';

export default ( { attributes, mapContainer } ): JSX.Element => {
	const { fitView, tagsEnabled, filtersEnabled, mapboxOptions } = attributes;

	return (
		<>
			<div id="map-topbar">
				<button
					id={ 'fit-view' }
					className={ 'button outlined has-white-background-color' }
					variant="secondary"
					onClick={ () => {
						console.log( attributes.fitView );
					} }
				>
          fit-view
				</button>

				{ tagsEnabled ? (
					<select id="filter-by-partnership">
						<option value="" selected>
							{ __( 'Filters' ) }
						</option>
						{ mapboxOptions.filters.map( ( option: any ) => (
							<option value={ option.value } key={ option.key }>
								{ option.value }
							</option>
						) ) }
					</select>
				) : null }

				{ filtersEnabled ? (
					<select id="filter-by-tag">
						<option value="" selected>
							{ __( 'Tags' ) }
						</option>
						{ mapboxOptions.tags.map( ( option: any ) => (
							<option value={ option.value } key={ option.key }>
								{ option.value }
							</option>
						) ) }
					</select>
				) : null }
			</div>

			<div id="map" className="map" ref={ mapContainer }></div>
		</>
	);
};
