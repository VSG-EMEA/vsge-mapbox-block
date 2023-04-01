import { __ } from '@wordpress/i18n';
import React from 'react';

export const Listing = ( data ) => {
	return data.type === 'Feature' ? (
		<div
			style={ {
				borderRadius: '2px',
				border: '1px solid #ccc',
				padding: '4px',
				margin: '2px 2px 8px',
			} }
		>
			<p>
				<b>{ data.properties.name }</b>
			</p>
			<p>{ data.properties.phone }</p>
			<p>{ data.properties.address }</p>
		</div>
	) : null;
};

export const MapboxSidebar = ( {
	geocoderEnabled,
	geocoderRef,
	listings,
} ): JSX.Element => {
	return (
		<div id="map-sidebar">
			{ geocoderEnabled === true ? (
				<div
					id="geocoder"
					className="geocoder"
					ref={ geocoderRef }
				></div>
			) : null }
			<div id="feature-listing" className="feature-listing">
				{ listings.map( ( data: any, index: number ) => (
					<Listing { ...data } key={ index } />
				) ) }
			</div>
		</div>
	);
};

export const Mapbox = ( props: {
	fitView: any;
	filtersEnabled: any;
} ): JSX.Element => {
	return (
		<div>
			<div id="map-topbar">
				{ props.fitView ? (
					<button
						id="fit-view"
						className="button outlined has-white-background-color"
					>
						<i className="material-icons">filter_center_focus</i>
					</button>
				) : null }

				{ props.filtersEnabled ? (
					<select id="filter-by-partnership">
						<option value="" selected>
							{ __( 'Filter by partnership' ) }
						</option>
					</select>
				) : null }

				{ props.filtersEnabled ? (
					<select id="filter-by-tag">
						<option value="" selected>
							{ __( 'Filter by brand' ) }
						</option>
					</select>
				) : null }
			</div>
			<div id="map" className="map"></div>
		</div>
	);
};

export const MapboxBlock: ( {
	innerRef,
	mapboxOptions,
	geocoderRef,
}: {
	innerRef: any;
	mapboxOptions: any;
	geocoderRef: any;
} ) => JSX.Element = ( { innerRef, mapboxOptions, geocoderRef } ) => {
	return (
		<div className="map-wrapper">
			{ mapboxOptions.sidebarEnabled ? (
				<MapboxSidebar
					geocoderEnabled={ mapboxOptions.geocoderEnabled }
					geocoderRef={ geocoderRef }
					listings={ mapboxOptions.listings }
				/>
			) : null }
			<div ref={ innerRef } id="map-container">
				<Mapbox { ...mapboxOptions } />
			</div>
		</div>
	);
};
