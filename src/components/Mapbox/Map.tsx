import { __ } from '@wordpress/i18n';
import React from 'react';
import { Button } from '@wordpress/components';

export const Mapbox = ( props ): JSX.Element => {
	return (
		<div ref={ props.mapContainer }>
			<div id="map-topbar">
				<Button
					id="fit-view"
					className="button outlined has-white-background-color"
					icon="filter_center_focus"
					onClick={ () => {
						props.fitView = ! props.fitView;
					} }
				/>

				{ props.tagsEnabled ? (
					<select id="filter-by-partnership">
						<option value="" selected>
							{ __( 'Filter by partnership' ) }
						</option>
						{ props.filters.map( ( option: any ) => (
							<option value={ option } key={ option }>
								{ option }
							</option>
						) ) }
					</select>
				) : null }

				{ props.filtersEnabled ? (
					<select id="filter-by-tag">
						<option value="" selected>
							{ __( 'Filter by brand' ) }
						</option>
						{ props.tags.map( ( option: any ) => (
							<option value={ option } key={ option }>
								{ option }
							</option>
						) ) }
					</select>
				) : null }
			</div>

			<div id="map" className="map" ref={ props.mapRef }></div>
		</div>
	);
};
