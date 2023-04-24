import { BlockAttributes, BlockEditProps } from '@wordpress/blocks';
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
} from '@wordpress/components';
import { mapStyles } from '../../constants';
import { __ } from '@wordpress/i18n';
import { Sortable } from '../Sortable';

export function MapEdit( {
	attributes,
	setAttributes,
	isSelected,
} ): JSX.Element {
	const {
		latitude,
		longitude,
		pitch,
		bearing,
		mapZoom,
		mapStyle,
		sidebarEnabled,
		geocoderEnabled,
		filtersEnabled,
		tagsEnabled,
		fitView,
		threeDimensionality,
		mapboxOptions: { tags, filters, listings },
	} = attributes;

	const { map, mapRef, geoCoder, geocoderRef, defaults } =
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
		if ( currentMap && isSelected )
			setAttributes( {
				latitude: currentMap.getCenter().lat,
				longitude: currentMap.getCenter().lng,
				pitch: currentMap.getPitch(),
				bearing: currentMap.getBearing(),
				mapZoom: currentMap.getZoom(),
			} );
	}

	useEffect( () => {
		if ( map ) {
			map.on( 'move', () => pullMapOptions( map ) );
		}
	}, [ attributes ] );

	useEffect( () => {
		if ( map ) {
			map.setStyle( 'mapbox://styles/mapbox/' + attributes.mapStyle );
		}
	}, [ attributes.mapStyle ] );

	useEffect( () => {
		if ( ! geoCoder ) {
			geoCoder.onAdd( map );
		}
	}, [ attributes.geocoderEnabled ] );

	useEffect( () => {
		if ( map ) {
			if ( attributes.threeDimensionality ) {
				if ( ! map.getSource( 'mapbox-dem' ) ) {
					map.addSource( 'mapbox-dem', {
						type: 'raster-dem',
						url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
						tileSize: 512,
						maxzoom: 14,
					} );
				}

				// add the DEM source as a terrain layer with exaggerated height
				map.setTerrain( {
					source: 'mapbox-dem',
					exaggeration: 1.5,
				} );
			} else if ( map.getSource( 'mapbox-dem' ) ) {
				map.removeSource( 'mapbox-dem' );
				map.setTerrain();
			}
		}
	}, [ attributes.threeDimensionality ] );

	return (
		<>
			<InspectorControls>
				<Panel>
					<PanelBody title="Settings">
						<RangeControl
							label={ __( 'Latitude' ) }
							value={ latitude }
							min={ -90 }
							max={ 90 }
							step={ 0.0001 }
							onChange={ ( newValue ) => {
								setAttributes( {
									...attributes,
									latitude: newValue,
								} );
								if ( map && newValue )
									map.setCenter( [ newValue, longitude ] );
							} }
						/>
						<RangeControl
							label={ __( 'Longitude' ) }
							value={ longitude }
							min={ -180 }
							max={ 180 }
							step={ 0.0001 }
							onChange={ ( newValue ) => {
								setAttributes( {
									...attributes,
									longitude: newValue,
								} );
								if ( newValue )
									map?.setCenter( [ latitude, newValue ] );
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
									pitch: newValue,
								} );
								if ( newValue ) map?.setPitch( newValue );
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
									bearing: newValue,
								} );
								if ( newValue ) map?.setBearing( newValue );
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
									mapZoom: newValue,
								} );
								if ( newValue ) map?.setZoom( newValue );
							} }
						/>
						<SelectControl
							options={ mapStyles }
							value={ mapStyle }
							label={ 'Style' }
							onChange={ ( newValue: number ) => {
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
					</PanelBody>
				</Panel>
				<Panel>
					<PanelBody title="Options">
						<ToggleControl
							label={ __( 'Enable Sidebar' ) }
							checked={ sidebarEnabled }
							onChange={ ( newValue: boolean ) => {
								setAttributes( { sidebarEnabled: newValue } );
								// wait 500 ms then resize the map
								setTimeout( () => {
									// get the mapRef element width and height
									map?.resize(
										mapRef.current.style.width,
										mapRef.current.style.height
									);
								}, 100 );
							} }
						/>
						<ToggleControl
							label={ __( 'Enable Geocoder' ) }
							checked={ geocoderEnabled }
							onChange={ ( newValue: boolean ) =>
								setAttributes( { geocoderEnabled: newValue } )
							}
						/>
						<ToggleControl
							label={ __( 'Enable Filters' ) }
							checked={ filtersEnabled }
							onChange={ ( newValue: boolean ) =>
								setAttributes( { filtersEnabled: newValue } )
							}
						/>
						<ToggleControl
							label={ __( 'Enable Tag' ) }
							checked={ tagsEnabled }
							onChange={ ( newValue: boolean ) =>
								setAttributes( { tagsEnabled: newValue } )
							}
						/>
						<ToggleControl
							label={ __( 'Enable fitView' ) }
							checked={ fitView }
							onChange={ ( newValue: boolean ) =>
								setAttributes( { fitView: newValue } )
							}
						/>
						<ToggleControl
							label={ __( 'Enable map tree dimensionality' ) }
							checked={ threeDimensionality }
							onChange={ ( newValue: boolean ) => {
								setAttributes( {
									threeDimensionality: newValue,
								} );
							} }
						/>
					</PanelBody>
				</Panel>
				<Panel>
					<PanelBody title="Filters">
						{ tagsEnabled === true ? (
							<>
								<p>Tags</p>
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
								<p>Filters</p>
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

				<Panel>
					<PanelBody title="Map Pins" icon={ 'marker' }>
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
