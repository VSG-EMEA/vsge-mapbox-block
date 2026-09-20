import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	Button,
	Notice,
	Panel,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { lazy, Suspense, useMemo, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import classNames from 'classnames';
import { mapProjections, mapStyles } from '../../constants';
import type {
	CoordinatesDef,
	FilterCollection,
	MapAttributes,
	MapBoxListing,
	MapboxOptions,
	MarkerIcon,
} from '../../types';
import { getMapDefaults } from '../../utils';
import { getNextId, reorder } from '../../utils/dataset';
import { DealerManager } from './DealerManager';
import { EditPanelIcons } from './EditPanelIcons';

import { dragHandle, Icon, trash } from '@wordpress/icons';
import {
	exportMapboxJson,
	validateAndSanitizeMapboxImport,
} from '../../utils/export';

const EditorMap = lazy( async () => ( {
	default: ( await import( './EditorMap' ) ).EditorMap,
} ) );

type MapEditProps = {
	attributes: MapAttributes;
	setAttributes: ( attributes: Partial< MapAttributes > ) => void;
	isSelected: boolean;
};

function parseRawOptions( raw: unknown ): Partial< MapboxOptions > {
	if ( typeof raw === 'string' ) {
		try {
			return JSON.parse( raw );
		} catch {
			return {};
		}
	}
	return typeof raw === 'object' && raw !== null ? raw : {};
}

function normalizeCollection( items: unknown ): FilterCollection[] {
	if ( ! Array.isArray( items ) ) {
		return [];
	}
	return items.map( ( item, index ) => {
		if ( typeof item === 'string' ) {
			return { id: index + 1, value: item };
		}
		if ( typeof item === 'object' && item !== null ) {
			const record = item as Record< string, unknown >;
			const val = record.value ?? record.tag ?? record.filter ?? '';
			const id = typeof record.id === 'number' ? record.id : index + 1;
			return { id, value: String( val ) };
		}
		return { id: index + 1, value: String( item ?? '' ) };
	} );
}

function ValueManager( {
	label,
	itemType,
	items,
	addButtonLabel,
	onChange,
}: {
	label: string;
	itemType: 'tag' | 'filter';
	items: FilterCollection[];
	addButtonLabel?: string;
	onChange: ( items: FilterCollection[] ) => void;
} ): JSX.Element {
	const getItemValue = ( item: FilterCollection ): string =>
		item.value ?? ( item as any ).tag ?? ( item as any ).filter ?? '';

	const getConfirmMessage = ( item: FilterCollection ) => {
		const val = getItemValue( item );
		return itemType === 'tag'
			? sprintf(
					/* translators: %s: tag name */
					__( 'Remove tag "%s"?', 'vsge-mapbox-block' ),
					val
			  )
			: sprintf(
					/* translators: %s: filter name */
					__( 'Remove filter "%s"?', 'vsge-mapbox-block' ),
					val
			  );
	};

	const getDeleteLabel = ( item: FilterCollection ) => {
		const val = getItemValue( item );
		return itemType === 'tag'
			? sprintf(
					/* translators: %s: tag name */
					__( 'Remove tag "%s"', 'vsge-mapbox-block' ),
					val
			  )
			: sprintf(
					/* translators: %s: filter name */
					__( 'Remove filter "%s"', 'vsge-mapbox-block' ),
					val
			  );
	};

	return (
		<div className="vsge-mapbox-value-manager">
			<h4>{ label }</h4>
			<div className="vsge-mapbox-value-list">
				{ items.map( ( item, index ) => {
					const itemValue = getItemValue( item );
					return (
						<div
							key={ item.id }
							className="vsge-mapbox-value-row"
							draggable
							onDragStart={ ( e ) => {
								e.dataTransfer.setData(
									'text/plain',
									String( index )
								);
								e.dataTransfer.effectAllowed = 'move';
							} }
							onDragOver={ ( e ) => {
								e.preventDefault();
								e.dataTransfer.dropEffect = 'move';
							} }
							onDrop={ ( e ) => {
								e.preventDefault();
								const fromIndex = Number(
									e.dataTransfer.getData( 'text/plain' )
								);
								if (
									! isNaN( fromIndex ) &&
									fromIndex !== index
								) {
									onChange(
										reorder( items, fromIndex, index )
									);
								}
							} }
						>
							<span
								className="vsge-mapbox-value-drag-handle"
								title={ __(
									'Drag to reorder',
									'vsge-mapbox-block'
								) }
							>
								<Icon icon={ dragHandle } size={ 18 } />
							</span>
							<TextControl
								value={ itemValue }
								className="vsge-mapbox-value-input"
								__nextHasNoMarginBottom
								onChange={ ( value ) =>
									onChange(
										items.map( ( current ) =>
											current.id === item.id
												? {
														...current,
														value,
														...( ( current as any )
															.tag !== undefined
															? { tag: value }
															: {} ),
														...( ( current as any )
															.filter !==
														undefined
															? {
																	filter: value,
															  }
															: {} ),
												  }
												: current
										)
									)
								}
							/>
							<Button
								icon={ trash }
								label={ getDeleteLabel( item ) }
								isDestructive
								className="vsge-mapbox-value-delete"
								onClick={ () => {
									if (
										window.confirm(
											getConfirmMessage( item )
										)
									) {
										onChange(
											items.filter(
												( current ) =>
													current.id !== item.id
											)
										);
									}
								} }
							/>
						</div>
					);
				} ) }
			</div>
			<Button
				variant="secondary"
				className="vsge-mapbox-value-add"
				onClick={ () => {
					const nextVal = `${ __(
						'New',
						'vsge-mapbox-block'
					) } ${ label }`;
					onChange( [
						...items,
						{
							id: getNextId( items ),
							value: nextVal,
						},
					] );
				} }
			>
				{ addButtonLabel || __( 'Add', 'vsge-mapbox-block' ) }
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
	const [ importNotice, setImportNotice ] = useState< {
		status: 'error' | 'success';
		message: string;
	} | null >( null );
	const fileInputRef = useRef< HTMLInputElement | null >( null );
	const defaults = useMemo( () => getMapDefaults(), [] );
	const attrRecord = attributes as Record< string, unknown >;
	const attrTags = attrRecord.tags;
	const attrFilters = attrRecord.filters;
	const attrListings = attrRecord.listings;
	const attrIcons = attrRecord.icons;

	const options: MapboxOptions = useMemo( () => {
		const rawOptions = parseRawOptions( attributes.mapboxOptions );
		const rawTags = rawOptions.tags || attrTags;
		const rawFilters = rawOptions.filters || attrFilters;
		const rawListings = ( rawOptions.listings ||
			attrListings ||
			[] ) as MapBoxListing[];
		const rawIcons = ( rawOptions.icons ||
			attrIcons ||
			[] ) as MarkerIcon[];

		let normalizedTags = normalizeCollection( rawTags );
		if ( normalizedTags.length === 0 ) {
			const found = new Set< string >();
			rawListings.forEach( ( listing ) => {
				( listing.properties?.itemTags || [] ).forEach( ( tag ) => {
					if ( typeof tag === 'string' && tag.trim() ) {
						found.add( tag.trim() );
					}
				} );
			} );
			normalizedTags = Array.from( found ).map( ( tag, idx ) => ( {
				id: idx + 1,
				value: tag,
			} ) );
		}

		let normalizedFilters = normalizeCollection( rawFilters );
		if ( normalizedFilters.length === 0 ) {
			const found = new Set< string >();
			rawListings.forEach( ( listing ) => {
				( listing.properties?.itemFilters || [] ).forEach(
					( filter ) => {
						if ( typeof filter === 'string' && filter.trim() ) {
							found.add( filter.trim() );
						}
					}
				);
			} );
			normalizedFilters = Array.from( found ).map( ( filter, idx ) => ( {
				id: idx + 1,
				value: filter,
			} ) );
		}

		return {
			listings: rawListings,
			tags: normalizedTags,
			filters: normalizedFilters,
			icons: rawIcons,
		};
	}, [
		attributes.mapboxOptions,
		attrTags,
		attrFilters,
		attrListings,
		attrIcons,
	] );
	const setOptions = < Key extends keyof MapboxOptions >(
		key: Key,
		value: MapboxOptions[ Key ]
	) => {
		const newOptions = { ...options, [ key ]: value };
		const updates: Record< string, unknown > = {
			mapboxOptions: newOptions,
		};
		if (
			( attributes as Record< string, unknown > )[ key ] !== undefined
		) {
			updates[ key ] = value;
		}
		setAttributes( updates );
	};
	const setNumber = (
		key: 'latitude' | 'longitude' | 'pitch' | 'bearing' | 'mapZoom',
		value: number | undefined
	) => setAttributes( { [ key ]: value ?? 0 } );

	const handleImportClick = () => {
		setImportNotice( null );
		fileInputRef.current?.click();
	};

	const handleFileChange = (
		event: React.ChangeEvent< HTMLInputElement >
	) => {
		const file = event.target.files?.[ 0 ];
		if ( ! file ) {
			return;
		}

		event.target.value = '';

		const reader = new FileReader();
		reader.onload = () => {
			const text = reader.result;
			if ( typeof text !== 'string' ) {
				setImportNotice( {
					status: 'error',
					message: __( 'Failed to read file.', 'vsge-mapbox-block' ),
				} );
				return;
			}

			const result = validateAndSanitizeMapboxImport( text );
			if ( result.valid === false ) {
				setImportNotice( {
					status: 'error',
					message: result.error,
				} );
				return;
			}

			const confirmed = window.confirm(
				__(
					'Import this JSON configuration? This will replace dealers, tags, filters and custom icons in this block.',
					'vsge-mapbox-block'
				)
			);

			if ( ! confirmed ) {
				return;
			}

			setSelectedDealerId( null );
			setPendingCoordinates( null );

			setAttributes( {
				mapboxOptions: {
					...( ( attributes.mapboxOptions as Partial< MapboxOptions > ) ||
						{} ),
					listings: result.data.listings,
					tags: result.data.tags,
					filters: result.data.filters,
					icons: result.data.icons,
				},
			} );

			setImportNotice( {
				status: 'success',
				message: sprintf(
					/* translators: %d: count of dealers */
					__(
						'Successfully imported %d dealers.',
						'vsge-mapbox-block'
					),
					result.data.listings.length
				),
			} );
		};

		reader.onerror = () => {
			setImportNotice( {
				status: 'error',
				message: __(
					'Error reading the selected file.',
					'vsge-mapbox-block'
				),
			} );
		};

		reader.readAsText( file );
	};

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
				<Panel>
					<PanelBody
						title={ __( 'Filters and tags', 'vsge-mapbox-block' ) }
					>
						<ValueManager
							label={ __( 'Filters', 'vsge-mapbox-block' ) }
							itemType="filter"
							items={ options.filters }
							addButtonLabel={ __(
								'Add filter',
								'vsge-mapbox-block'
							) }
							onChange={ ( filters ) =>
								setOptions( 'filters', filters )
							}
						/>
						<ValueManager
							label={ __( 'Tags', 'vsge-mapbox-block' ) }
							itemType="tag"
							items={ options.tags }
							addButtonLabel={ __(
								'Add tag',
								'vsge-mapbox-block'
							) }
							onChange={ ( tags ) => setOptions( 'tags', tags ) }
						/>
					</PanelBody>
				</Panel>
				<EditPanelIcons
					icons={ options.icons }
					setOptions={ setOptions }
				/>
				<Panel>
					<PanelBody
						title={ __( 'Data / Export', 'vsge-mapbox-block' ) }
						initialOpen={ false }
					>
						<p
							style={ {
								fontSize: '13px',
								color: '#666',
								marginTop: 0,
								marginBottom: '12px',
							} }
						>
							{ __(
								'Import or export the map configuration, dealers, tags, filters, and custom icons.',
								'vsge-mapbox-block'
							) }
						</p>
						{ importNotice && (
							<Notice
								status={ importNotice.status }
								isDismissible
								onDismiss={ () => setImportNotice( null ) }
								className="vsge-mapbox-import-notice"
							>
								{ importNotice.message }
							</Notice>
						) }
						<div className="vsge-mapbox-data-buttons">
							<Button
								variant="secondary"
								onClick={ handleImportClick }
							>
								{ __( 'Import JSON', 'vsge-mapbox-block' ) }
							</Button>
							<Button
								variant="secondary"
								onClick={ () => exportMapboxJson( options ) }
							>
								{ __( 'Export JSON', 'vsge-mapbox-block' ) }
							</Button>
						</div>
						<input
							ref={ fileInputRef }
							type="file"
							accept=".json,application/json"
							style={ { display: 'none' } }
							onChange={ handleFileChange }
						/>
					</PanelBody>
				</Panel>
			</InspectorControls>
			<div className="vsge-mapbox-editor-workspace">
				<DealerManager
					options={ options }
					selectedId={ selectedDealerId }
					onSelect={ setSelectedDealerId }
					pendingCoordinates={ pendingCoordinates }
					onListingsChange={ ( listings ) =>
						setOptions( 'listings', listings )
					}
				/>
				<div className="vsge-mapbox-editor-map-pane">
					<Suspense
						fallback={
							<p className="vsge-mapbox-editor-map-loading">
								{ __(
									'Loading map editor…',
									'vsge-mapbox-block'
								) }
							</p>
						}
					>
						<EditorMap
							attributes={ attributes }
							defaults={ defaults }
							selectedId={ selectedDealerId }
							pendingCoordinates={ pendingCoordinates }
							onSelect={ setSelectedDealerId }
							onMapClick={ setPendingCoordinates }
						/>
					</Suspense>
				</div>
			</div>
		</div>
	);
}
