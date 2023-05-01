import { MapboxContext, useMap } from './MapboxContext';
import mapboxgl from 'mapbox-gl';
import { useContext, useEffect } from '@wordpress/element';
import { MapBox } from './index';
import { InspectorControls } from '@wordpress/block-editor';
import {
	Panel,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	__experimentalUnitControl as UnitControl,
	Button,
} from '@wordpress/components';
import { mapMarker, cog, filter } from '@wordpress/icons';
import { mapStyles } from '../../constants';
import { __ } from '@wordpress/i18n';
import { Sortable } from '../Sortable';
import { initGeocoder } from './utils/geocoder';
import { MapAttributes } from '../../types';
import {
	setMapElevation,
	setMapThreeDimensionality,
	setMapWheelZoom,
} from './utils/initMap';

export function MapEdit( {
	attributes,
	setAttributes,
	isSelected,
}: {
	attributes: MapAttributes;
	setAttributes: ( attributes: MapAttributes ) => void;
	isSelected: boolean;
} ): JSX.Element {
	const {
		latitude,
		longitude,
		pitch,
		bearing,
		mapZoom,
		mapStyle,
		mapHeight,
		sidebarEnabled,
		geocoderEnabled,
		filtersEnabled,
		tagsEnabled,
		elevation,
		fitView,
		freeViewCamera,
		mouseWheelZoom,
		mapboxOptions: { tags, filters, listings },
	}: MapAttributes = attributes;

	const { map, mapRef, setGeoCoder, geocoderRef, defaults } =
		useContext( MapboxContext );

	const setOptions = ( key: string, value: string | number | boolean ) => {
		setAttributes( {
			...attributes,
			mapboxOptions: {
				...attributes.mapboxOptions,
				[ key ]: value,
			},
		} );
	};

	function pullMapOptions( currentMap: mapboxgl.Map | undefined ) {
		if ( currentMap )
			setAttributes( {
				...attributes,
				latitude: currentMap.getCenter().lat,
				longitude: currentMap.getCenter().lng,
				pitch: currentMap.getPitch(),
				bearing: currentMap.getBearing(),
				mapZoom: currentMap.getZoom(),
			} );
	}

	function refreshMap( timeout: number = 100 ) {
		// wait 100 ms then resize the map
		setTimeout( () => {
			// get the mapRef element width and height
			if ( mapRef.current?.style ) map?.resize();
		}, timeout );
	}

	/*
	LIVE UPDATES DISABLED DUE LOW PERFORMANCE
	useEffect( () => {
		if ( map ) {
			const handle = setInterval( () => {
				map.on( 'move', () => pullMapOptions( map ) );
			}, 100 );
			return () => {
				clearInterval( handle );
			};
		}
	}, [
		attributes.latitude,
		attributes.longitude,
		attributes.pitch,
		attributes.bearing,
		attributes.mapZoom,
	] );
	*/

	useEffect( () => {
		if ( map ) {
			map.setStyle( 'mapbox://styles/mapbox/' + attributes.mapStyle );
		}
	}, [ attributes.mapStyle ] );

	useEffect( () => {
		if ( map && attributes.geocoderEnabled ) {
			setGeoCoder(
				initGeocoder( geocoderRef, map, attributes, defaults )
			);
		}
	}, [ attributes.geocoderEnabled ] );

	useEffect( () => {
		if ( map ) {
			setMapThreeDimensionality( map, attributes.freeViewCamera );
		}
	}, [ attributes.freeViewCamera ] );

	useEffect( () => {
		if ( map ) {
			setMapElevation( map, attributes.elevation );
		}
	}, [ attributes.elevation ] );

	useEffect( () => {
		if ( map ) {
			setMapWheelZoom( map, attributes.mouseWheelZoom );
		}
	}, [ attributes.mouseWheelZoom ] );

	if ( ! defaults.accessToken ) {
		return (
			<>
				<InspectorControls>
					<Panel>
						<PanelBody title="Settings">
							<h3>Mapbox Access Token</h3>
							<p>
								<a
									href="//account.mapbox.com/auth/signup/"
									target="_blank"
									rel="noreferrer"
								>
									Get a Mapbox Access Token
								</a>
							</p>
						</PanelBody>
					</Panel>
				</InspectorControls>
				<div>
					<p>
						<a
							href="//account.mapbox.com/auth/signup/"
							target="_blank"
							rel="noreferrer"
						>
							Get a Mapbox Access Token
						</a>
					</p>
				</div>
			</>
		);
	}

	return (
		<>
			<InspectorControls>
				<Panel>
					<PanelBody title="Options" icon={ cog }>
						<ToggleControl
							label={ __( 'Enable Sidebar' ) }
							checked={ sidebarEnabled }
							onChange={ ( newValue: boolean ) => {
								setAttributes( {
									...attributes,
									sidebarEnabled: newValue,
								} );
								refreshMap();
							} }
						/>
						{ sidebarEnabled && (
							<ToggleControl
								label={ __( 'Enable Geocoder' ) }
								checked={ geocoderEnabled }
								onChange={ ( newValue: boolean ) => {
									setAttributes( {
										...attributes,
										geocoderEnabled: newValue,
										sidebarEnabled: newValue,
									} );
								} }
							/>
						) }
						<ToggleControl
							label={ __( 'Enable Filters' ) }
							checked={ filtersEnabled }
							onChange={ ( newValue: boolean ) =>
								setAttributes( {
									...attributes,
									filtersEnabled: newValue,
								} )
							}
						/>
						<ToggleControl
							label={ __( 'Enable Tag' ) }
							checked={ tagsEnabled }
							onChange={ ( newValue: boolean ) =>
								setAttributes( {
									...attributes,
									tagsEnabled: newValue,
								} )
							}
						/>
						<ToggleControl
							label={ __( 'Enable fitView' ) }
							checked={ fitView }
							onChange={ ( newValue: boolean ) => {
								setAttributes( {
									...attributes,
									fitView: newValue,
								} );
								refreshMap();
							} }
						/>
						<ToggleControl
							label={ __( 'Enable Elevation' ) }
							checked={ elevation }
							onChange={ ( newValue: boolean ) => {
								setAttributes( {
									...attributes,
									elevation: newValue,
								} );
								refreshMap();
							} }
						/>
						<ToggleControl
							label={ __( 'Enable camera 3d rotation' ) }
							checked={ freeViewCamera }
							onChange={ ( newValue: boolean ) => {
								setAttributes( {
									...attributes,
									freeViewCamera: newValue,
									bearing: newValue ? attributes.bearing : 0,
									pitch: newValue ? attributes.pitch : 0,
								} );
								refreshMap();
							} }
						/>
						<ToggleControl
							label={ __( 'Enable Zoom with mouse wheel' ) }
							checked={ mouseWheelZoom }
							onChange={ ( newValue: boolean ) => {
								setAttributes( {
									...attributes,
									mouseWheelZoom: newValue,
								} );
								refreshMap();
							} }
						/>
					</PanelBody>
				</Panel>
				<Panel>
					<PanelBody title="Settings">
						<h2>{ __( 'Camera Options' ) }</h2>
						{ map && (
							<Button
								variant="secondary"
								onClick={ () => pullMapOptions( map ) }
							>
								{ __( 'Get Current view' ) }
							</Button>
						) }
						<h2>{ __( 'Camera Fine tuning' ) }</h2>
						<RangeControl
							label={ __( 'Latitude' ) }
							value={ attributes.latitude }
							min={ -90 }
							max={ 90 }
							step={ 0.0001 }
							onChange={ ( newValue ) => {
								setAttributes( {
									...attributes,
									latitude: newValue || 0,
								} );
								if ( map && newValue )
									map.setCenter( [ newValue, longitude ] );
							} }
						/>
						<RangeControl
							label={ __( 'Longitude' ) }
							value={ attributes.longitude }
							min={ -180 }
							max={ 180 }
							step={ 0.0001 }
							onChange={ ( newValue ) => {
								setAttributes( {
									...attributes,
									longitude: newValue || 0,
								} );
								if ( newValue )
									map?.setCenter( [ latitude, newValue ] );
							} }
						/>
						<RangeControl
							label={ 'pitch' }
							value={ attributes.pitch }
							min={ 0 }
							max={ 90 }
							step={ 0.01 }
							onChange={ ( newValue ) => {
								setAttributes( {
									...attributes,
									pitch: newValue || 0,
								} );
								if ( newValue ) map?.setPitch( newValue );
							} }
						/>
						<RangeControl
							label={ 'bearing' }
							value={ attributes.bearing }
							min={ -180 }
							max={ 180 }
							step={ 0.01 }
							onChange={ ( newValue ) => {
								setAttributes( {
									...attributes,
									bearing: newValue || 0,
								} );
								if ( newValue ) map?.setBearing( newValue );
							} }
						/>
						<RangeControl
							label={ 'Zoom' }
							value={ attributes.mapZoom }
							min={ 0 }
							max={ 15 }
							step={ 0.01 }
							onChange={ ( newValue ) => {
								setAttributes( {
									...attributes,
									mapZoom: newValue || 0,
								} );
								if ( newValue ) map?.setZoom( newValue );
							} }
						/>
						<SelectControl
							options={ mapStyles }
							value={ attributes.mapStyle }
							label={ 'Style' }
							onChange={ ( newValue: string ) => {
								setAttributes( {
									...attributes,
									mapStyle: newValue,
								} );
								if ( newValue )
									map?.setStyle(
										'mapbox://styles/mapbox/' + newValue
									);
							} }
						/>
						<UnitControl
							value={ attributes.mapHeight }
							label={ __( 'Map Height' ) }
							onChange={ ( newValue: string ) => {
								setAttributes( {
									...attributes,
									mapHeight: newValue || '',
								} );
							} }
						/>
					</PanelBody>
				</Panel>

				{ filtersEnabled || tagsEnabled ? (
					<Panel>
						<PanelBody title="Filters" icon={ filter }>
							{ tagsEnabled === true ? (
								<>
									<h2>Tags</h2>
									<Sortable
										items={ tags }
										tax={ 'tags' }
										setOptions={ setOptions }
										mapboxOptions={ false }
									/>
								</>
							) : null }
							{ filtersEnabled ? (
								<>
									<h2>Filters</h2>
									<Sortable
										items={ filters }
										tax={ 'filters' }
										setOptions={ setOptions }
										mapboxOptions={ false }
									/>
								</>
							) : null }
						</PanelBody>
					</Panel>
				) : null }

				<Panel>
					<PanelBody title="Map Pins" icon={ mapMarker }>
						<Sortable
							items={ listings }
							tax={ 'listings' }
							setOptions={ setOptions }
							mapboxOptions={ attributes.mapboxOptions }
						/>
					</PanelBody>
				</Panel>
			</InspectorControls>
			<MapBox attributes={ attributes } />
		</>
	);
}
