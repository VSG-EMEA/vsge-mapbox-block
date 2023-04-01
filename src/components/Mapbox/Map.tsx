import { __ } from '@wordpress/i18n';
import React from 'react';
import { Button } from '@wordpress/components';

export const Mapbox = ( props ): JSX.Element => {
	return (
		<div ref={ props.mapContainer }>
			<div id="map-topbar">
				{ props.fitView ? (
					<Button
						id="fit-view"
						className="button outlined has-white-background-color"
						icon="filter_center_focus"
						onClick={ () => {
							props.fitView = ! props.fitView;
						} }
					/>
				) : null }

				{ props.filtersEnabled ? (
					<select id="filter-by-partnership">
						<option value="" selected>
							{ __( 'Filter by partnership' ) }
						</option>
						{ props.features.map( ( feature: any ) => (
							<option
								value={ feature.properties.partnership }
								key={ feature.properties.partnership }
							>
								{ feature.properties.partnership }
							</option>
						) ) }
					</select>
				) : null }

				{ props.filtersEnabled ? (
					<select id="filter-by-tag">
						<option value="" selected>
							{ __( 'Filter by brand' ) }
						</option>
						{ props.tags.map( ( tag: any ) => (
							<option value={ tag } key={ tag }>
								{ tag }
							</option>
						) ) }
					</select>
				) : null }
			</div>

			<div id="map" className="map" ref={ props.mapRef }></div>
		</div>
	);
};
