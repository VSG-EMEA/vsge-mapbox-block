import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	Button,
	Panel,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { lazy, Suspense, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import classNames from 'classnames';
import { mapProjections, mapStyles } from '../../constants';
import type {
	CoordinatesDef,
	FilterCollection,
	MapAttributes,
	MapboxOptions,
} from '../../types';
import { getMapDefaults } from '../../utils';
import { getNextId } from '../../utils/dataset';
import { DealerManager } from './DealerManager';
import { EditPanelIcons } from './EditPanelIcons';

const EditorMap = lazy( async () => ( {
	default: ( await import( './EditorMap' ) ).EditorMap,
} ) );

type MapEditProps = {
	attributes: MapAttributes;
	setAttributes: ( attributes: Partial< MapAttributes > ) => void;
	isSelected: boolean;
};

function ValueManager( {
	label,
	items,
	onChange,
}: {
	label: string;
	items: FilterCollection[];
	onChange: ( items: FilterCollection[] ) => void;
} ): JSX.Element {
	return (
		<div>
			<h3>{ label }</h3>
			{ items.map( ( item ) => (
				<div key={ item.id }>
					<TextControl
						value={ item.value }
						onChange={ ( value ) =>
							onChange(
								items.map( ( current ) =>
									current.id === item.id
										? { ...current, value }
										: current
								)
							)
						}
					/>
					<Button
						variant="tertiary"
						isDestructive
						onClick={ () =>
							onChange(
								items.filter(
									( current ) => current.id !== item.id
								)
							)
						}
					>
						{ __( 'Remove', 'vsge-mapbox-block' ) }
					</Button>
				</div>
			) ) }
			<Button
				variant="secondary"
				onClick={ () =>
					onChange( [
						...items,
						{
							id: getNextId( items ),
							value: `${ __(
								'New',
								'vsge-mapbox-block'
							) } ${ label }`,
						},
					] )
				}
			>
				{ __( 'Add', 'vsge-mapbox-block' ) }
			</Button>
		</div>
	);
}

export function MapEdit( {
	attributes,
	setAttributes,
}: MapEditProps ): JSX.Element {
	const [ pendingCoordinates, setPendingCoordinates ] =
		useState< CoordinatesDef | null >( null );
	const [ selectedDealerId, setSelectedDealerId ] = useState< number | null >(
		null
	);
	const defaults = useMemo( () => getMapDefaults(), [] );
	const rawOptions = attributes.mapboxOptions as Partial< MapboxOptions >;
	const options: MapboxOptions = {
		listings: rawOptions.listings || [],
		tags: rawOptions.tags || [],
		filters: rawOptions.filters || [],
		icons: rawOptions.icons || [],
	};
	const setOptions = < Key extends keyof MapboxOptions >(
		key: Key,
		value: MapboxOptions[ Key ]
	) => setAttributes( { mapboxOptions: { ...options, [ key ]: value } } );
	const setNumber = (
		key: 'latitude' | 'longitude' | 'pitch' | 'bearing' | 'mapZoom',
		value: number | undefined
	) => setAttributes( { [ key ]: value ?? 0 } );

	return (
		<div
			{ ...useBlockProps( {
				className: classNames( 'wp-block-vsge-mapbox', 'block-mapbox' ),
			} ) }
		>
			<InspectorControls>
				<Panel>
					<PanelBody title={ __( 'Options', 'vsge-mapbox-block' ) }>
						<ToggleControl
							label={ __(
								'Enable sidebar',
								'vsge-mapbox-block'
							) }
							checked={ attributes.sidebarEnabled }
							onChange={ ( sidebarEnabled ) =>
								setAttributes( {
									sidebarEnabled,
									geocoderEnabled: sidebarEnabled
										? attributes.geocoderEnabled
										: false,
								} )
							}
						/>
						{ attributes.sidebarEnabled && (
							<ToggleControl
								label={ __(
									'Enable geocoder',
									'vsge-mapbox-block'
								) }
								checked={ attributes.geocoderEnabled }
								onChange={ ( geocoderEnabled ) =>
									setAttributes( { geocoderEnabled } )
								}
							/>
						) }
						<ToggleControl
							label={ __(
								'Enable filters',
								'vsge-mapbox-block'
							) }
							checked={ attributes.filtersEnabled }
							onChange={ ( filtersEnabled ) =>
								setAttributes( { filtersEnabled } )
							}
						/>
						<ToggleControl
							label={ __( 'Enable tags', 'vsge-mapbox-block' ) }
							checked={ attributes.tagsEnabled }
							onChange={ ( tagsEnabled ) =>
								setAttributes( { tagsEnabled } )
							}
						/>
						<ToggleControl
							label={ __(
								'Enable fit view',
								'vsge-mapbox-block'
							) }
							checked={ attributes.fitView }
							onChange={ ( fitView ) =>
								setAttributes( { fitView } )
							}
						/>
						<ToggleControl
							label={ __(
								'Enable elevation',
								'vsge-mapbox-block'
							) }
							checked={ attributes.elevation }
							onChange={ ( elevation ) =>
								setAttributes( { elevation } )
							}
						/>
						<ToggleControl
							label={ __(
								'Enable 3D camera rotation',
								'vsge-mapbox-block'
							) }
							checked={ attributes.freeViewCamera }
							onChange={ ( freeViewCamera ) =>
								setAttributes( {
									freeViewCamera,
									bearing: freeViewCamera
										? attributes.bearing
										: 0,
									pitch: freeViewCamera
										? attributes.pitch
										: 0,
								} )
							}
						/>
						<ToggleControl
							label={ __(
								'Enable mouse wheel zoom',
								'vsge-mapbox-block'
							) }
							checked={ attributes.mouseWheelZoom }
							onChange={ ( mouseWheelZoom ) =>
								setAttributes( { mouseWheelZoom } )
							}
						/>
					</PanelBody>
				</Panel>
				<Panel>
					<PanelBody title={ __( 'Camera', 'vsge-mapbox-block' ) }>
						<RangeControl
							label={ __( 'Latitude', 'vsge-mapbox-block' ) }
							value={ attributes.latitude }
							min={ -90 }
							max={ 90 }
							step={ 0.0001 }
							onChange={ ( value ) =>
								setNumber( 'latitude', value )
							}
						/>
						<RangeControl
							label={ __( 'Longitude', 'vsge-mapbox-block' ) }
							value={ attributes.longitude }
							min={ -180 }
							max={ 180 }
							step={ 0.0001 }
							onChange={ ( value ) =>
								setNumber( 'longitude', value )
							}
						/>
						<RangeControl
							label={ __( 'Pitch', 'vsge-mapbox-block' ) }
							value={ attributes.pitch }
							min={ 0 }
							max={ 90 }
							step={ 0.01 }
							onChange={ ( value ) =>
								setNumber( 'pitch', value )
							}
						/>
						<RangeControl
							label={ __( 'Bearing', 'vsge-mapbox-block' ) }
							value={ attributes.bearing }
							min={ -180 }
							max={ 180 }
							step={ 0.01 }
							onChange={ ( value ) =>
								setNumber( 'bearing', value )
							}
						/>
						<RangeControl
							label={ __( 'Zoom', 'vsge-mapbox-block' ) }
							value={ attributes.mapZoom }
							min={ 0 }
							max={ 15 }
							step={ 0.01 }
							onChange={ ( value ) =>
								setNumber( 'mapZoom', value )
							}
						/>
						<SelectControl
							label={ __( 'Style', 'vsge-mapbox-block' ) }
							value={ attributes.mapStyle }
							options={ mapStyles }
							onChange={ ( mapStyle ) =>
								setAttributes( { mapStyle } )
							}
						/>
						<SelectControl
							label={ __( 'Projection', 'vsge-mapbox-block' ) }
							value={ attributes.mapProjection }
							options={ mapProjections }
							onChange={ ( mapProjection ) =>
								setAttributes( { mapProjection } )
							}
						/>
					</PanelBody>
				</Panel>
				{ ( attributes.tagsEnabled || attributes.filtersEnabled ) && (
					<Panel>
						<PanelBody
							title={ __(
								'Filters and tags',
								'vsge-mapbox-block'
							) }
						>
							{ attributes.tagsEnabled && (
								<ValueManager
									label={ __( 'Tags', 'vsge-mapbox-block' ) }
									items={ options.tags }
									onChange={ ( tags ) =>
										setOptions( 'tags', tags )
									}
								/>
							) }
							{ attributes.filtersEnabled && (
								<ValueManager
									label={ __(
										'Filters',
										'vsge-mapbox-block'
									) }
									items={ options.filters }
									onChange={ ( filters ) =>
										setOptions( 'filters', filters )
									}
								/>
							) }
						</PanelBody>
					</Panel>
				) }
				<EditPanelIcons
					icons={ options.icons }
					setOptions={ setOptions }
				/>
			</InspectorControls>
			<Suspense
				fallback={
					<p>{ __( 'Loading map editor…', 'vsge-mapbox-block' ) }</p>
				}
			>
				<EditorMap
					attributes={ attributes }
					defaults={ defaults }
					selectedId={ selectedDealerId }
					onSelect={ setSelectedDealerId }
					onMapClick={ setPendingCoordinates }
				/>
			</Suspense>
			<DealerManager
				options={ options }
				selectedId={ selectedDealerId }
				onSelect={ setSelectedDealerId }
				pendingCoordinates={ pendingCoordinates }
				onListingsChange={ ( listings ) =>
					setOptions( 'listings', listings )
				}
			/>
		</div>
	);
}
