import { __ } from '@wordpress/i18n';
import React from 'react';
import { Button } from '@wordpress/components';

export function Map( { attributes, mapContainer = null } ): JSX.Element {
	const { fitView, tagsEnabled, filtersEnabled, mapboxOptions } = attributes;

	return (
		<>
			<div className={ 'map-topbar' }>
				{ fitView ? (
					<button
						className={
							'button button-secondary outlined has-white-background-color fit-view'
						}
					>
						fit-view
					</button>
				) : null }

				{ tagsEnabled ? (
					<select className={ 'filter-by-partnership' }>
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
					<select className={ 'filter-by-tag' }>
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

			<div className="map" ref={ mapContainer }></div>
		</>
	);
}
