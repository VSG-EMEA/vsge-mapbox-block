import {
	BaseControl,
	Button,
	CheckboxControl,
	ColorPicker,
	Dropdown,
	PanelRow,
	RangeControl,
	SelectControl,
	TextareaControl,
	TextControl,
} from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type {
	CoordinatesDef,
	FilterCollection,
	MapBoxListing,
	MarkerIcon,
	MarkerProps,
	TagArray,
} from '../../types';
import { defaultColors, defaultMarkerSize } from '../Marker/defaults';
import { getNextId } from '../../utils/dataset';
import { getMakiNames } from '../../utils/maki';

type DealerEditorProps = {
	listing: MapBoxListing;
	tags: FilterCollection[];
	filters: FilterCollection[];
	icons: MarkerIcon[];
	pendingCoordinates: CoordinatesDef | null;
	onSave: ( listing: MapBoxListing ) => void;
	onDelete: ( id: number ) => void;
};

function toggleValue(
	values: TagArray,
	value: string,
	checked: boolean
): string[] {
	const current = values || [];
	return checked
		? Array.from( new Set( [ ...current, value ] ) )
		: current.filter( ( currentValue ) => currentValue !== value );
}

function getCollectionItemLabel(
	item:
		| FilterCollection
		| { tag?: string; filter?: string; value?: string }
		| string
): string {
	if ( typeof item === 'string' ) {
		return item;
	}
	return item.value ?? ( item as any ).tag ?? ( item as any ).filter ?? '';
}

function getCollectionItemKey(
	item: FilterCollection | { id?: number },
	fallback: number
): number | string {
	return typeof item === 'object' &&
		item !== null &&
		typeof ( item as any ).id === 'number'
		? ( item as any ).id
		: fallback;
}

/** Only the selected dealer owns this local, deliberately committed draft. */
export function DealerEditor( {
	listing,
	tags,
	filters,
	icons,
	pendingCoordinates,
	onSave,
	onDelete,
}: DealerEditorProps ): JSX.Element {
	const [ draft, setDraft ] = useState< MapBoxListing >( listing );
	const [ makiOptions, setMakiOptions ] = useState<
		{ value: string; label: string }[]
	>( [] );

	const availableTags = useMemo( () => {
		const existing = new Set(
			tags
				.map( ( t ) => getCollectionItemLabel( t ).toLowerCase() )
				.filter( Boolean )
		);
		const combined: FilterCollection[] = [ ...tags ];
		( draft.properties.itemTags || [] ).forEach( ( tagStr ) => {
			if (
				tagStr &&
				typeof tagStr === 'string' &&
				! existing.has( tagStr.toLowerCase() )
			) {
				existing.add( tagStr.toLowerCase() );
				combined.push( {
					id: getNextId( combined ),
					value: tagStr,
				} );
			}
		} );
		return combined;
	}, [ tags, draft.properties.itemTags ] );

	const availableFilters = useMemo( () => {
		const existing = new Set(
			filters
				.map( ( f ) => getCollectionItemLabel( f ).toLowerCase() )
				.filter( Boolean )
		);
		const combined: FilterCollection[] = [ ...filters ];
		( draft.properties.itemFilters || [] ).forEach( ( filterStr ) => {
			if (
				filterStr &&
				typeof filterStr === 'string' &&
				! existing.has( filterStr.toLowerCase() )
			) {
				existing.add( filterStr.toLowerCase() );
				combined.push( {
					id: getNextId( combined ),
					value: filterStr,
				} );
			}
		} );
		return combined;
	}, [ filters, draft.properties.itemFilters ] );

	useEffect( () => {
		setDraft( listing );
	}, [ listing ] );

	useEffect( () => {
		let cancelled = false;
		getMakiNames().then( ( names ) => {
			if ( ! cancelled && Array.isArray( names ) ) {
				setMakiOptions(
					names.map( ( name ) => ( {
						value: `maki-${ name }`,
						label: `Maki: ${ name }`,
					} ) )
				);
			}
		} );
		return () => {
			cancelled = true;
		};
	}, [] );

	const updateProperties = ( values: Partial< MarkerProps > ) => {
		setDraft( ( current ) => ( {
			...current,
			properties: { ...current.properties, ...values },
		} ) );
	};
	const updateCoordinates = ( coordinates: CoordinatesDef ) => {
		setDraft( ( current ) => ( {
			...current,
			geometry: { ...current.geometry, type: 'Point', coordinates },
		} ) );
	};
	const coordinate = ( value: string, fallback: number ) => {
		const parsed = Number( value );
		return Number.isFinite( parsed ) ? parsed : fallback;
	};

	return (
		<div className="vsge-mapbox-dealer-editor">
			<h3>
				{ draft.properties.name ||
					__( 'New dealer', 'vsge-mapbox-block' ) }
			</h3>
			<div className="vsge-mapbox-form-row">
				<TextControl
					label={ __( 'Longitude', 'vsge-mapbox-block' ) }
					type="number"
					value={ draft.geometry.coordinates[ 0 ] }
					__nextHasNoMarginBottom
					onChange={ ( value ) =>
						updateCoordinates( [
							coordinate(
								value,
								draft.geometry.coordinates[ 0 ]
							),
							draft.geometry.coordinates[ 1 ],
						] )
					}
				/>
				<TextControl
					label={ __( 'Latitude', 'vsge-mapbox-block' ) }
					type="number"
					value={ draft.geometry.coordinates[ 1 ] }
					__nextHasNoMarginBottom
					onChange={ ( value ) =>
						updateCoordinates( [
							draft.geometry.coordinates[ 0 ],
							coordinate(
								value,
								draft.geometry.coordinates[ 1 ]
							),
						] )
					}
				/>
			</div>
			<Button
				variant="secondary"
				disabled={ ! pendingCoordinates }
				className="vsge-mapbox-use-click-btn"
				onClick={ () =>
					pendingCoordinates &&
					updateCoordinates( pendingCoordinates )
				}
			>
				{ __( 'Use last map click', 'vsge-mapbox-block' ) }
			</Button>
			<TextControl
				label={ __( 'Name', 'vsge-mapbox-block' ) }
				value={ draft.properties.name || '' }
				__nextHasNoMarginBottom
				onChange={ ( name ) => updateProperties( { name } ) }
			/>
			<TextControl
				label={ __( 'Description', 'vsge-mapbox-block' ) }
				value={ draft.properties.description || '' }
				__nextHasNoMarginBottom
				onChange={ ( description ) =>
					updateProperties( { description } )
				}
			/>
			<TextControl
				label={ __( 'Company', 'vsge-mapbox-block' ) }
				value={ draft.properties.company || '' }
				__nextHasNoMarginBottom
				onChange={ ( company ) => updateProperties( { company } ) }
			/>
			<div className="vsge-mapbox-form-row">
				<TextControl
					label={ __( 'Phone', 'vsge-mapbox-block' ) }
					type="tel"
					value={ draft.properties.phone || '' }
					__nextHasNoMarginBottom
					onChange={ ( phone ) => updateProperties( { phone } ) }
				/>
				<TextControl
					label={ __( 'Mobile', 'vsge-mapbox-block' ) }
					type="tel"
					value={ draft.properties.mobile || '' }
					__nextHasNoMarginBottom
					onChange={ ( mobile ) => updateProperties( { mobile } ) }
				/>
			</div>
			<TextControl
				label={ __( 'Email', 'vsge-mapbox-block' ) }
				type="email"
				value={ draft.properties.emailAddress || '' }
				__nextHasNoMarginBottom
				onChange={ ( emailAddress ) =>
					updateProperties( { emailAddress } )
				}
			/>
			<TextControl
				label={ __( 'Website', 'vsge-mapbox-block' ) }
				type="url"
				value={ draft.properties.website || '' }
				__nextHasNoMarginBottom
				onChange={ ( website ) => updateProperties( { website } ) }
			/>
			<TextareaControl
				label={ __( 'Address', 'vsge-mapbox-block' ) }
				value={ draft.properties.address || '' }
				onChange={ ( address ) => updateProperties( { address } ) }
				__nextHasNoMarginBottom
			/>
			<div className="vsge-mapbox-form-row">
				<TextControl
					label={ __( 'City', 'vsge-mapbox-block' ) }
					value={ draft.properties.city || '' }
					__nextHasNoMarginBottom
					onChange={ ( city ) => updateProperties( { city } ) }
				/>
				<TextControl
					label={ __( 'Postal code', 'vsge-mapbox-block' ) }
					value={ draft.properties.postalCode || '' }
					__nextHasNoMarginBottom
					onChange={ ( postalCode ) =>
						updateProperties( { postalCode } )
					}
				/>
			</div>
			<div className="vsge-mapbox-form-row">
				<TextControl
					label={ __( 'Country', 'vsge-mapbox-block' ) }
					value={ draft.properties.country || '' }
					__nextHasNoMarginBottom
					onChange={ ( country ) => updateProperties( { country } ) }
				/>
				<TextControl
					label={ __( 'Country code', 'vsge-mapbox-block' ) }
					value={ draft.properties.countryCode || '' }
					__nextHasNoMarginBottom
					onChange={ ( countryCode ) =>
						updateProperties( { countryCode } )
					}
				/>
			</div>
			<TextControl
				label={ __( 'Preferred area', 'vsge-mapbox-block' ) }
				value={ ( draft.properties.preferredArea || [] ).join( ', ' ) }
				__nextHasNoMarginBottom
				onChange={ ( preferredArea ) =>
					updateProperties( {
						preferredArea: preferredArea
							.split( ',' )
							.map( ( area ) => area.trim() )
							.filter( Boolean ),
					} )
				}
			/>
			<fieldset className="vsge-mapbox-dealer-fieldset">
				<legend>{ __( 'Tags', 'vsge-mapbox-block' ) }</legend>
				<div className="vsge-mapbox-checkbox-list">
					{ availableTags.map( ( tag, index ) => {
						const tagValue = getCollectionItemLabel( tag );
						return (
							<CheckboxControl
								key={ getCollectionItemKey( tag, index ) }
								label={ tagValue }
								checked={ Boolean(
									tagValue &&
										draft.properties.itemTags?.includes(
											tagValue
										)
								) }
								__nextHasNoMarginBottom
								onChange={ ( checked ) =>
									updateProperties( {
										itemTags: toggleValue(
											draft.properties.itemTags,
											tagValue,
											checked
										),
									} )
								}
							/>
						);
					} ) }
				</div>
			</fieldset>
			<fieldset className="vsge-mapbox-dealer-fieldset">
				<legend>{ __( 'Filters', 'vsge-mapbox-block' ) }</legend>
				<div className="vsge-mapbox-checkbox-list">
					{ availableFilters.map( ( filter, index ) => {
						const filterValue = getCollectionItemLabel( filter );
						return (
							<CheckboxControl
								key={ getCollectionItemKey( filter, index ) }
								label={ filterValue }
								checked={ Boolean(
									filterValue &&
										draft.properties.itemFilters?.includes(
											filterValue
										)
								) }
								__nextHasNoMarginBottom
								onChange={ ( checked ) =>
									updateProperties( {
										itemFilters: toggleValue(
											draft.properties.itemFilters,
											filterValue,
											checked
										),
									} )
								}
							/>
						);
					} ) }
				</div>
			</fieldset>
			<h4>{ __( 'Marker', 'vsge-mapbox-block' ) }</h4>
			<RangeControl
				label={ __( 'Icon size', 'vsge-mapbox-block' ) }
				value={ draft.properties.iconSize ?? defaultMarkerSize }
				min={ 0 }
				max={ 100 }
				__nextHasNoMarginBottom
				onChange={ ( iconSize ) =>
					updateProperties( {
						iconSize: iconSize ?? defaultMarkerSize,
					} )
				}
			/>
			<BaseControl
				id="vsge-mapbox-dealer-icon-color"
				label={ __( 'Icon colour', 'vsge-mapbox-block' ) }
				__nextHasNoMarginBottom
			>
				<Dropdown
					className="vsge-mapbox-color-dropdown"
					popoverProps={ { placement: 'bottom-start' } }
					renderToggle={ ( { isOpen, onToggle } ) => (
						<Button
							variant="secondary"
							className="vsge-mapbox-color-swatch-button"
							onClick={ onToggle }
							aria-expanded={ isOpen }
							aria-label={ __(
								'Select icon colour',
								'vsge-mapbox-block'
							) }
						>
							<span
								className="vsge-mapbox-color-swatch"
								style={ {
									backgroundColor:
										draft.properties.iconColor ||
										defaultColors[ 0 ],
								} }
							/>
							<span className="vsge-mapbox-color-value">
								{ draft.properties.iconColor ||
									defaultColors[ 0 ] }
							</span>
						</Button>
					) }
					renderContent={ () => (
						<div className="vsge-mapbox-color-picker-popover">
							<ColorPicker
								color={
									draft.properties.iconColor ||
									defaultColors[ 0 ]
								}
								onChange={ ( iconColor ) =>
									updateProperties( { iconColor } )
								}
								enableAlpha={ false }
							/>
						</div>
					) }
				/>
			</BaseControl>
			<SelectControl
				label={ __( 'Marker icon', 'vsge-mapbox-block' ) }
				value={ draft.properties.icon || 'default' }
				__nextHasNoMarginBottom
				options={ [
					{
						value: 'default',
						label: __( 'Default', 'vsge-mapbox-block' ),
					},
					...icons.map( ( icon ) => ( {
						value: `custom-${ icon.id }`,
						label: `Custom: ${ icon.name }`,
					} ) ),
					...makiOptions,
					...( draft.properties.icon &&
					draft.properties.icon !== 'default' &&
					! icons.some(
						( i ) => `custom-${ i.id }` === draft.properties.icon
					) &&
					! makiOptions.some(
						( m ) => m.value === draft.properties.icon
					)
						? [
								{
									value: draft.properties.icon,
									label: draft.properties.icon,
								},
						  ]
						: [] ),
				] }
				onChange={ ( icon ) => updateProperties( { icon } ) }
			/>
			<PanelRow>
				<Button
					variant="secondary"
					isDestructive
					onClick={ () =>
						window.confirm(
							__( 'Delete this dealer?', 'vsge-mapbox-block' )
						) && onDelete( draft.id )
					}
				>
					{ __( 'Delete dealer', 'vsge-mapbox-block' ) }
				</Button>
				<Button
					variant="secondary"
					onClick={ () => setDraft( listing ) }
				>
					{ __( 'Reset', 'vsge-mapbox-block' ) }
				</Button>
				<Button variant="primary" onClick={ () => onSave( draft ) }>
					{ __( 'Save dealer', 'vsge-mapbox-block' ) }
				</Button>
			</PanelRow>
		</div>
	);
}
