import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { BlockAttributes, BlockEditProps } from '@wordpress/blocks';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef } from '@wordpress/element';
import {getDefaults, mapStyles} from './constants';
import mapboxgl, { Map } from 'mapbox-gl';

import {
	Panel,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { MapboxBlock } from './components/Mapbox';
import { __ } from '@wordpress/i18n';
import { Sortable } from './components/Sortable';

import { initGeocoder } from './frontend/geocoder';

/**
 * The edit function describes the structure of your block in the context of the editor.
 *
 * @param  props
 * @param  props.attributes    - the block attributes
 * @param  props.setAttributes - the setState function
 *
 * @param  props.isSelected
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
		mapboxOptions: {
			sidebarEnabled,
			geocoderEnabled,
			tags,
			features,
			listings,
			filters,
			fitView,
			filtersEnabled,
			tagsEnabled,
		},
	} = attributes;

	const mapContainer: React.MutableRefObject< HTMLElement | undefined > =
		useRef( undefined );
	const mapInstance: React.MutableRefObject< Map | undefined > = useRef();
	const geocoder: React.MutableRefObject< Map | undefined > = useRef();
	const defaults = getDefaults();

	function updateMap( key: string, value: any ) {
		if ( mapInstance.current )
			switch ( key ) {
				case 'latitude':
					setAttributes( {
						...attributes,
						latitude: value,
					} );
					mapInstance.current.setCenter( [ longitude, value ] );
					break;
				case 'longitude':
					setAttributes( {
						...attributes,
						longitude: value,
					} );
					mapInstance.current.setCenter( [ value, latitude ] );
					break;
				case 'pitch':
					setAttributes( {
						...attributes,
						pitch: value,
					} );
					mapInstance.current?.setPitch( pitch );
					break;
				case 'bearing':
					setAttributes( {
						...attributes,
						bearing: value,
					} );
					mapInstance.current?.setBearing( value );
					break;
				case 'mapZoom':
					setAttributes( {
						...attributes,
						mapZoom: value,
					} );
					mapInstance.current.setZoom( value );
					break;
				case 'mapStyle':
					setAttributes( {
						...attributes,
						mapStyle: value,
					} );
					mapInstance.current.setStyle(
						'mapbox://styles/mapbox/' + value
					);
					break;
				default:
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

	const setItems = ( items: any ) => {
		setAttributes( {
			...attributes,
			items,
		} );
	};

	function refreshMap( currentMap: mapboxgl.Map | undefined ) {
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
		if ( ! mapInstance.current ) return;

		mapInstance.current.on( 'move', () =>
			refreshMap( mapInstance.current )
		);
	} );

	useEffect( () => {
		if ( defaults?.accessToken ) {
			mapboxgl.accessToken = defaults.accessToken;

			if ( listings.length === 0 ) {
				setAttributes( {
					...attributes,
					mapboxOptions: {
						...attributes.mapboxOptions,
						listings: features,
					},
				} );
			}

			if ( mapboxgl.accessToken && mapInstance.current !== null ) {
				mapInstance.current = new mapboxgl.Map( {
					container: mapContainer.current || '',
					style: 'mapbox://styles/mapbox/' + mapStyle,
					center: [ parseFloat( longitude ), parseFloat( latitude ) ],
					pitch: parseFloat( pitch ),
					bearing: parseFloat( bearing ),
					zoom: parseFloat( mapZoom ),
				} );
			}

			refreshMap( mapInstance.current );
		} else {
			throw new Error( 'cannot find access token' );
		}
	}, [] );

	useEffect( () => {
		if ( geocoderEnabled ) {
			initGeocoder( geocoder, mapboxgl, listings, defaults );
		}
	}, [ geocoderEnabled ] );

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
						<ToggleControl
							label={ __( 'Enable Sidebar' ) }
							checked={ sidebarEnabled }
							onChange={ ( newValue: boolean ) =>
								setOptions( 'sidebarEnabled', newValue )
							}
						/>
						<ToggleControl
							label={ __( 'Enable Geocoder' ) }
							checked={ geocoderEnabled }
							onChange={ ( newValue: boolean ) =>
								setOptions( 'geocoderEnabled', newValue )
							}
						/>
						<ToggleControl
							label={ __( 'Enable fitView' ) }
							checked={ fitView }
							onChange={ ( newValue: boolean ) =>
								setOptions( 'fitView', newValue )
							}
						/>
						<ToggleControl
							label={ __( 'Enable Filters' ) }
							checked={ filtersEnabled }
							onChange={ ( newValue: boolean ) =>
								setOptions( 'filtersEnabled', newValue )
							}
						/>
						<ToggleControl
							label={ __( 'Enable Filter by Tag' ) }
							checked={ tagsEnabled }
							onChange={ ( newValue: boolean ) =>
								setOptions( 'tagsEnabled', newValue )
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
			<MapboxBlock
				mapboxOptions={ attributes.mapboxOptions }
				innerRef={ mapContainer }
				geocoderRef={ geocoder }
			/>
		</div>
	);
}
