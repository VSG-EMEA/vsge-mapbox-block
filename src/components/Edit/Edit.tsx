import { useMapboxContext } from '../Mapbox/MapboxContext';
import { useEffect } from '@wordpress/element';
import { MapBox } from '../Mapbox';
import mapboxgl from 'mapbox-gl';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	__experimentalUnitControl as UnitControl,
	Button,
	Panel,
	PanelBody,
	RangeControl,
	SelectControl,
	TextareaControl,
	ToggleControl,
} from '@wordpress/components';
import { cog, list, tag, tool, update } from '@wordpress/icons';
import { mapProjections, mapStyles } from '../../constants';
import { __ } from '@wordpress/i18n';
import { Sortable } from '../Sortable';
import { MapAttributes } from '../../types';
import {
	setMapElevation,
	setMapThreeDimensionality,
	setMapWheelZoom,
} from '../Mapbox/utils';
import classNames from 'classnames';
import { getMapDefaults } from '../../utils';
import { EditPanelIcons } from './EditPanelIcons';

export function MapEdit( {
	attributes,
	setAttributes,
}: {
	attributes: MapAttributes;
	setAttributes: ( attributes: MapAttributes ) => void;
	isSelected: boolean;
} ): JSX.Element {
	const {
		align,
		latitude,
		longitude,
		pitch,
		bearing,
		mapZoom,
		mapStyle,
		mapProjection,
		mapHeight,
		sidebarEnabled,
		geocoderEnabled,
		filtersEnabled,
		tagsEnabled,
		elevation,
		fitView,
		freeViewCamera,
		mouseWheelZoom,
		mapboxOptions: { tags, icons, filters, listings },
	}: MapAttributes = attributes;

	const { map, mapRef, loaded, setListings } = useMapboxContext();

	/**
	 * This function sets options for a Mapbox map and updates the markers accordingly.
	 *
	 * @param {string}                    key   - A string representing the key of a property in the `mapboxOptions` object that
	 *                                          needs to be updated.
	 * @param {string | number | boolean} value - The `value` parameter can be a string, number, or boolean
	 *                                          data type. It is used to set the value of a specific option in the `mapboxOptions` object. The
	 *                                          `mapboxOptions` object is a property of the `attributes` object, which is being updated using the
	 */
	const setOptions = ( key: string, value: string | number | boolean ) => {
		// update the map
		setAttributes( {
			...attributes,
			mapboxOptions: {
				...attributes.mapboxOptions,
				[ key ]: value,
			},
		} );
	};

	/**
	 * This function updates the attributes of a map based on the current map's center, pitch, bearing, and
	 * zoom.
	 *
	 * @param {mapboxgl.Map | undefined} currentMap - currentMap is a variable of type mapboxgl.Map or
	 *                                              undefined. It represents the current map object that is being used.
	 */
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

	/**
	 * This function refreshes a map by resizing it after a specified timeout.
	 *
	 * @param {number} [timeout=100] - The timeout parameter is a number that specifies the amount of time
	 *                               in milliseconds to wait before resizing the map. By default, it is set to 100 milliseconds.
	 */
	function refreshMap( timeout: number = 100 ) {
		// wait 100 ms then resize the map
		setTimeout( () => {
			// get the mapRef element width and height
			if ( mapRef?.current?.style ) map.current?.resize();
		}, timeout );
	}

	useEffect( () => {
		if ( loaded ) {
			refreshMap();
		}
	}, [ align ] );

	useEffect( () => {
		if ( loaded ) {
			map.current.setStyle( 'mapbox://styles/mapbox/' + mapStyle );
			refreshMap();
		}
	}, [ mapStyle ] );

	useEffect( () => {
		if ( loaded ) {
			setMapThreeDimensionality( map.current, freeViewCamera );
		}
	}, [ freeViewCamera ] );

	useEffect( () => {
		if ( loaded ) {
			setMapElevation( map.current, elevation );
			refreshMap();
		}
	}, [ elevation ] );

	useEffect( () => {
		if ( loaded ) {
			setMapWheelZoom( map.current, mouseWheelZoom );
		}
	}, [ mouseWheelZoom ] );

	useEffect( () => {
		if ( loaded ) {
			setListings( attributes.mapboxOptions.listings );
		}
	}, [ attributes.mapboxOptions ] );

	const blockProps = useBlockProps( {
		className: classNames( 'wp-block-vsge-mapbox', 'block-mapbox' ),
	} );

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<Panel>
					<PanelBody title="Options" icon={ cog }>
						<ToggleControl
							label={ __( 'Enable Sidebar', 'vsge-mapbox-block' ) }
							checked={ sidebarEnabled }
							onChange={ ( newValue: boolean ) => {
								setAttributes( {
									...attributes,
									sidebarEnabled: newValue,
									geocoderEnabled: newValue
										? attributes.sidebarEnabled
										: false,
								} );
								refreshMap();
							} }
						/>
						{ sidebarEnabled && (
							<ToggleControl
								label={ __( 'Enable Geocoder', 'vsge-mapbox-block' ) }
								checked={ geocoderEnabled }
								onChange={ ( newValue: boolean ) => {
									setAttributes( {
										...attributes,
										geocoderEnabled: newValue,
									} );
								} }
							/>
						) }
						<ToggleControl
							label={ __( 'Enable Filters', 'vsge-mapbox-block' ) }
							checked={ filtersEnabled }
							onChange={ ( newValue: boolean ) =>
								setAttributes( {
									...attributes,
									filtersEnabled: newValue,
								} )
							}
						/>
						<ToggleControl
							label={ __( 'Enable Tag', 'vsge-mapbox-block' ) }
							checked={ tagsEnabled }
							onChange={ ( newValue: boolean ) =>
								setAttributes( {
									...attributes,
									tagsEnabled: newValue,
								} )
							}
						/>
						<ToggleControl
							label={ __( 'Enable fitView', 'vsge-mapbox-block' ) }
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
							label={ __( 'Enable Elevation', 'vsge-mapbox-block' ) }
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
							label={ __( 'Enable camera 3d rotation', 'vsge-mapbox-block' ) }
							checked={ freeViewCamera }
							onChange={ ( newValue: boolean ) => {
								setAttributes( {
									...attributes,
									freeViewCamera: newValue,
									bearing: newValue ? bearing : 0,
									pitch: newValue ? pitch : 0,
								} );
								refreshMap();
							} }
						/>
						<ToggleControl
							label={ __( 'Enable Zoom with mouse wheel', 'vsge-mapbox-block' ) }
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
					<PanelBody title="Settings" icon={ tool }>
						<h2>{ __( 'Camera Options', 'vsge-mapbox-block' ) }</h2>

						<Button
							variant="secondary"
							onClick={ () => {
								if ( map.current )
									pullMapOptions( map.current );
							} }
						>
							{ __( 'Get Current view', 'vsge-mapbox-block' ) }
						</Button>

						<h2>{ __( 'Camera Fine tuning', 'vsge-mapbox-block' ) }</h2>
						<RangeControl
							label={ __( 'Latitude', 'vsge-mapbox-block' ) }
							value={ latitude }
							min={ -90 }
							max={ 90 }
							step={ 0.0001 }
							onChange={ ( newValue ) => {
								setAttributes( {
									...attributes,
									latitude: newValue || 0,
								} );
								if ( map.current && newValue )
									map.current.setCenter( [
										newValue,
										longitude,
									] );
							} }
						/>
						<RangeControl
							label={ __( 'Longitude', 'vsge-mapbox-block' ) }
							value={ longitude }
							min={ -180 }
							max={ 180 }
							step={ 0.0001 }
							onChange={ ( newValue ) => {
								setAttributes( {
									...attributes,
									longitude: newValue || 0,
								} );
								if ( newValue )
									map.current?.setCenter( [
										latitude,
										newValue,
									] );
							} }
						/>
						<RangeControl
							label={ 'pitch' }
							value={ pitch }
							min={ 0 }
							max={ 90 }
							step={ 0.01 }
							onChange={ ( newValue ) => {
								setAttributes( {
									...attributes,
									pitch: newValue || 0,
								} );
								if ( newValue )
									map.current?.setPitch( newValue );
							} }
						/>
						<RangeControl
							label={ 'bearing' }
							value={ bearing }
							min={ -180 }
							max={ 180 }
							step={ 0.01 }
							onChange={ ( newValue ) => {
								setAttributes( {
									...attributes,
									bearing: newValue || 0,
								} );
								if ( newValue )
									map.current?.setBearing( newValue );
							} }
						/>
						<RangeControl
							label={ 'Zoom' }
							value={ mapZoom }
							min={ 0 }
							max={ 15 }
							step={ 0.01 }
							onChange={ ( newValue ) => {
								setAttributes( {
									...attributes,
									mapZoom: newValue || 0,
								} );
								if ( newValue )
									map.current?.setZoom( newValue );
							} }
						/>
						<SelectControl
							options={ mapStyles }
							value={ mapStyle }
							label={ 'Style' }
							onChange={ ( newValue: string ) => {
								setAttributes( {
									...attributes,
									mapStyle: newValue,
								} );
								if ( newValue )
									map.current?.setStyle(
										'mapbox://styles/mapbox/' + newValue
									);
							} }
						/>
						<SelectControl
							options={ mapProjections }
							value={ mapProjection }
							label={ 'Map Projection' }
							onChange={ ( newValue: string ) => {
								setAttributes( {
									...attributes,
									mapProjection: newValue,
								} );
								if ( newValue )
									map.current?.setProjection( newValue );
							} }
						/>
						<UnitControl
							value={ mapHeight }
							label={ __( 'Map Height', 'vsge-mapbox-block' ) }
							onChange={ ( newValue ) => {
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
						<PanelBody title="Filters" icon={ tag }>
							{ tagsEnabled === true ? (
								<>
									<h2>Tags</h2>
									<Sortable
										items={ tags }
										tax={ 'tags' }
										setOptions={ setOptions }
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
									/>
								</>
							) : null }
						</PanelBody>
					</Panel>
				) : null }

				<Panel>
					<PanelBody title="Map Pins" icon={ list }>
						<Sortable
							items={ listings }
							tax={ 'listings' }
							setOptions={ setOptions }
							mapboxOptions={ attributes.mapboxOptions }
						/>
					</PanelBody>
				</Panel>

				<EditPanelIcons icons={ icons } setOptions={ setOptions } />

				<Panel>
					<PanelBody
						title="Export"
						icon={ update }
						initialOpen={ false }
					>
						<TextareaControl
							value={ JSON.stringify( attributes.mapboxOptions ) }
							onChange={ ( e ) => {
								if ( typeof JSON.parse( e ) === 'object' ) {
									setAttributes( {
										...attributes,
										mapboxOptions: JSON.parse( e ),
									} );
								}
							} }
						/>
					</PanelBody>
				</Panel>
			</InspectorControls>

			<MapBox
				attributes={ attributes }
				mapDefaults={ getMapDefaults() }
				isEditor={ true }
				mapboxgl={ mapboxgl }
			/>
		</div>
	);
}
