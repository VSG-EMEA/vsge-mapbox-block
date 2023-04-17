import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { BlockAttributes, BlockEditProps } from '@wordpress/blocks';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from '@wordpress/element';
import { mapStyles } from './constants';
import mapboxgl, { Map } from 'mapbox-gl';

import {
	Panel,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import MapBox from './components/Mapbox';
import { __ } from '@wordpress/i18n';
import { Sortable } from './components/Sortable';

/**
 * The edit function describes the structure of your block in the context of the editor.
 *
 * @param props
 * @param props.attributes    - the block attributes
 * @param props.setAttributes - the setState function
 *
 * @param props.isSelected
 */
export default function Edit( {
	attributes,
	setAttributes,
	isSelected,
}: BlockEditProps< BlockAttributes > ): JSX.Element {
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
		treeDimensionality,
		mapboxOptions: { tags, filters, listings },
	} = attributes;

	const [ mapboxInstance, setMapboxInstance ] = useState< Map | null >(
		null
	);

	const mapContainer = useRef< HTMLDivElement >( null );

	function updateMap( key: string, value: any ) {
		if ( mapboxInstance ) {
			switch ( key ) {
				case 'latitude':
					setAttributes( {
						...attributes,
						latitude: value,
					} );
					mapboxInstance.setCenter( [ longitude, value ] );
					break;
				case 'longitude':
					setAttributes( {
						...attributes,
						longitude: value,
					} );
					mapboxInstance.setCenter( [ value, latitude ] );
					break;
				case 'pitch':
					setAttributes( {
						...attributes,
						pitch: value,
					} );
					mapboxInstance?.setPitch( value );
					break;
				case 'bearing':
					setAttributes( {
						...attributes,
						bearing: value,
					} );
					mapboxInstance?.setBearing( value );
					break;
				case 'mapZoom':
					setAttributes( {
						...attributes,
						mapZoom: value,
					} );
					mapboxInstance.setZoom( value );
					break;
				case 'mapStyle':
					setAttributes( {
						...attributes,
						mapStyle: value,
					} );
					mapboxInstance.setStyle(
						'mapbox://styles/mapbox/' + value
					);
					break;
				default:
			}
		}
	}

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
		// wait for map to initialize
		if ( ! mapboxInstance ) return;

		mapboxInstance.on( 'move', () => pullMapOptions( mapboxInstance ) );
	} );

	return (
		<div { ...useBlockProps() }>
			<InspectorControls>
				<Panel>
					<PanelBody title="Settings">
						<RangeControl
							label={ 'Latitude' }
							value={ latitude }
							min={ -90 }
							max={ 90 }
							step={ 0.0001 }
							onChange={ ( newValue ) => {
								return updateMap( 'latitude', newValue );
							} }
						/>
						<RangeControl
							label={ 'Longitude' }
							value={ longitude }
							min={ -180 }
							max={ 180 }
							step={ 0.0001 }
							onChange={ ( newValue ) => {
								return updateMap( 'longitude', newValue );
							} }
						/>
						<RangeControl
							label={ 'pitch' }
							value={ pitch }
							min={ 0 }
							max={ 90 }
							step={ 0.01 }
							onChange={ ( newValue ) => {
								return updateMap( 'pitch', newValue );
							} }
						/>
						<RangeControl
							label={ 'bearing' }
							value={ bearing }
							min={ -180 }
							max={ 180 }
							step={ 0.01 }
							onChange={ ( newValue ) => {
								return updateMap( 'bearing', newValue );
							} }
						/>
						<RangeControl
							label={ 'Zoom' }
							value={ mapZoom }
							min={ 0 }
							max={ 15 }
							step={ 0.01 }
							onChange={ ( newValue ) => {
								return updateMap( 'mapZoom', newValue );
							} }
						/>
						<SelectControl
							options={ mapStyles }
							value={ mapStyle }
							label={ 'Style' }
							onChange={ ( newValue: number ) =>
								updateMap( 'mapStyle', newValue )
							}
						/>
					</PanelBody>
				</Panel>
				<Panel>
					<PanelBody title="Options">
						<ToggleControl
							label={ __( 'Enable Sidebar' ) }
							checked={ sidebarEnabled }
							onChange={ ( newValue: boolean ) =>
								setAttributes( { sidebarEnabled: newValue } )
							}
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
							checked={ treeDimensionality }
							onChange={ ( newValue: boolean ) =>
								setAttributes( {
									treeDimensionality: newValue,
								} )
							}
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
			<MapBox
				attributes={ attributes }
				map={ mapboxInstance }
				setMap={ setMapboxInstance }
			/>
		</div>
	);
}
