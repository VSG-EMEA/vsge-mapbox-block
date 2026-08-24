import {
	Button,
	CheckboxControl,
	PanelRow,
	RangeControl,
	SelectControl,
	TextareaControl,
	TextControl,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type {
	CoordinatesDef,
	FilterCollection,
	MapBoxListing,
	MarkerIcon,
	MarkerProps,
	TagArray,
} from '../../types';

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

	useEffect( () => {
		setDraft( listing );
	}, [ listing ] );

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
			<TextControl
				label={ __( 'Longitude', 'vsge-mapbox-block' ) }
				type="number"
				value={ draft.geometry.coordinates[ 0 ] }
				onChange={ ( value ) =>
					updateCoordinates( [
						coordinate( value, draft.geometry.coordinates[ 0 ] ),
						draft.geometry.coordinates[ 1 ],
					] )
				}
			/>
			<TextControl
				label={ __( 'Latitude', 'vsge-mapbox-block' ) }
				type="number"
				value={ draft.geometry.coordinates[ 1 ] }
				onChange={ ( value ) =>
					updateCoordinates( [
						draft.geometry.coordinates[ 0 ],
						coordinate( value, draft.geometry.coordinates[ 1 ] ),
					] )
				}
			/>
			<Button
				variant="secondary"
				disabled={ ! pendingCoordinates }
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
				onChange={ ( name ) => updateProperties( { name } ) }
			/>
			<TextControl
				label={ __( 'Description', 'vsge-mapbox-block' ) }
				value={ draft.properties.description || '' }
				onChange={ ( description ) =>
					updateProperties( { description } )
				}
			/>
			<TextControl
				label={ __( 'Company', 'vsge-mapbox-block' ) }
				value={ draft.properties.company || '' }
				onChange={ ( company ) => updateProperties( { company } ) }
			/>
			<TextControl
				label={ __( 'Phone', 'vsge-mapbox-block' ) }
				type="tel"
				value={ draft.properties.phone || '' }
				onChange={ ( phone ) => updateProperties( { phone } ) }
			/>
			<TextControl
				label={ __( 'Mobile', 'vsge-mapbox-block' ) }
				type="tel"
				value={ draft.properties.mobile || '' }
				onChange={ ( mobile ) => updateProperties( { mobile } ) }
			/>
			<TextControl
				label={ __( 'Email', 'vsge-mapbox-block' ) }
				type="email"
				value={ draft.properties.emailAddress || '' }
				onChange={ ( emailAddress ) =>
					updateProperties( { emailAddress } )
				}
			/>
			<TextControl
				label={ __( 'Website', 'vsge-mapbox-block' ) }
				type="url"
				value={ draft.properties.website || '' }
				onChange={ ( website ) => updateProperties( { website } ) }
			/>
			<TextareaControl
				label={ __( 'Address', 'vsge-mapbox-block' ) }
				value={ draft.properties.address || '' }
				onChange={ ( address ) => updateProperties( { address } ) }
				__nextHasNoMarginBottom
			/>
			<TextControl
				label={ __( 'City', 'vsge-mapbox-block' ) }
				value={ draft.properties.city || '' }
				onChange={ ( city ) => updateProperties( { city } ) }
			/>
			<TextControl
				label={ __( 'Postal code', 'vsge-mapbox-block' ) }
				value={ draft.properties.postalCode || '' }
				onChange={ ( postalCode ) =>
					updateProperties( { postalCode } )
				}
			/>
			<TextControl
				label={ __( 'Country', 'vsge-mapbox-block' ) }
				value={ draft.properties.country || '' }
				onChange={ ( country ) => updateProperties( { country } ) }
			/>
			<TextControl
				label={ __( 'Country code', 'vsge-mapbox-block' ) }
				value={ draft.properties.countryCode || '' }
				onChange={ ( countryCode ) =>
					updateProperties( { countryCode } )
				}
			/>
			<TextControl
				label={ __( 'Preferred area', 'vsge-mapbox-block' ) }
				value={ ( draft.properties.preferredArea || [] ).join( ', ' ) }
				onChange={ ( preferredArea ) =>
					updateProperties( {
						preferredArea: preferredArea
							.split( ',' )
							.map( ( area ) => area.trim() )
							.filter( Boolean ),
					} )
				}
			/>
			<h4>{ __( 'Tags', 'vsge-mapbox-block' ) }</h4>
			{ tags.map( ( tag ) => (
				<CheckboxControl
					key={ tag.id }
					label={ tag.value }
					checked={ draft.properties.itemTags?.includes( tag.value ) }
					onChange={ ( checked ) =>
						updateProperties( {
							itemTags: toggleValue(
								draft.properties.itemTags,
								tag.value,
								checked
							),
						} )
					}
				/>
			) ) }
			<h4>{ __( 'Filters', 'vsge-mapbox-block' ) }</h4>
			{ filters.map( ( filter ) => (
				<CheckboxControl
					key={ filter.id }
					label={ filter.value }
					checked={ draft.properties.itemFilters?.includes(
						filter.value
					) }
					onChange={ ( checked ) =>
						updateProperties( {
							itemFilters: toggleValue(
								draft.properties.itemFilters,
								filter.value,
								checked
							),
						} )
					}
				/>
			) ) }
			<h4>{ __( 'Marker', 'vsge-mapbox-block' ) }</h4>
			<RangeControl
				label={ __( 'Icon size', 'vsge-mapbox-block' ) }
				value={ draft.properties.iconSize || 0 }
				min={ 0 }
				max={ 100 }
				onChange={ ( iconSize ) =>
					updateProperties( { iconSize: iconSize ?? 0 } )
				}
			/>
			<TextControl
				label={ __( 'Icon colour', 'vsge-mapbox-block' ) }
				value={ draft.properties.iconColor || '' }
				onChange={ ( iconColor ) => updateProperties( { iconColor } ) }
			/>
			<SelectControl
				label={ __( 'Marker icon', 'vsge-mapbox-block' ) }
				value={ draft.properties.icon || 'default' }
				options={ [
					{
						value: 'default',
						label: __( 'Default', 'vsge-mapbox-block' ),
					},
					...icons.map( ( icon ) => ( {
						value: `custom-${ icon.id }`,
						label: icon.name,
					} ) ),
				] }
				onChange={ ( icon ) => updateProperties( { icon } ) }
			/>
			<CheckboxControl
				label={ __( 'Draggable', 'vsge-mapbox-block' ) }
				checked={ Boolean( draft.properties.draggable ) }
				onChange={ ( draggable ) => updateProperties( { draggable } ) }
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
