import { Button, Panel, PanelBody, TextControl } from '@wordpress/components';
import { mapMarker, plusCircle, trash } from '@wordpress/icons';
import { __, sprintf } from '@wordpress/i18n';
import { getNextId } from '../../utils/dataset';
import type { MarkerIcon } from '../../types';
import { sanitizeMarkerSvg } from '../../utils/svg';

export const IconItem = ( props: {
	id: number;
	name: string;
	content: string;
	setIcon: ( props: MarkerIcon ) => void;
	removeIcon: ( id: number ) => void;
} ) => {
	const { id, name, content, setIcon, removeIcon } = props;

	const confirmMessage = sprintf(
		/* translators: %s: pointer name */
		__( 'Remove pointer "%s"?', 'vsge-mapbox-block' ),
		name || ''
	);

	const deleteLabel = sprintf(
		/* translators: %s: pointer name */
		__( 'Remove pointer "%s"', 'vsge-mapbox-block' ),
		name || ''
	);

	return (
		<div className={ 'vsge-mapbox-pointer-row pointer-item-' + id }>
			<div
				className="vsge-mapbox-pointer-preview"
				dangerouslySetInnerHTML={ {
					__html: sanitizeMarkerSvg( content ) || '',
				} }
			/>
			<TextControl
				placeholder={ __( 'Name', 'vsge-mapbox-block' ) }
				aria-label={ __( 'Pointer name', 'vsge-mapbox-block' ) }
				value={ name }
				className="vsge-mapbox-pointer-name"
				__nextHasNoMarginBottom
				onChange={ ( newValue ) =>
					setIcon( {
						id,
						content,
						name: newValue,
					} )
				}
			/>
			<TextControl
				placeholder={ __( 'SVG markup', 'vsge-mapbox-block' ) }
				aria-label={ __( 'SVG markup', 'vsge-mapbox-block' ) }
				value={ content }
				className="vsge-mapbox-pointer-svg"
				__nextHasNoMarginBottom
				onChange={ ( newValue ) =>
					setIcon( {
						id,
						name,
						content: newValue,
					} )
				}
			/>
			<Button
				icon={ trash }
				label={ deleteLabel }
				isDestructive
				className="vsge-mapbox-pointer-delete"
				onClick={ () => {
					if ( window.confirm( confirmMessage ) ) {
						removeIcon( id );
					}
				} }
			/>
		</div>
	);
};

export const EditPanelIcons = ( {
	icons = [],
	setOptions,
}: {
	icons: MarkerIcon[];
	setOptions: Function;
} ) => {
	function setIcon( newIcon: MarkerIcon ) {
		const content = sanitizeMarkerSvg( newIcon.content ) || '';
		const newIcons = icons.map( ( icon ) =>
			icon.id === newIcon.id
				? {
						...icon,
						...newIcon,
						content,
				  }
				: icon
		);
		setOptions( 'icons', newIcons );
	}

	function addNewIcon( nextId: number ) {
		setOptions( 'icons', [
			...icons,
			{
				id: nextId,
				name: sprintf(
					/* translators: %s: marker icon ID */
					__( 'Pointer %s', 'vsge-mapbox-block' ),
					String( nextId )
				),
				content: '',
			},
		] );
	}

	function removeIcon( id: number ) {
		setOptions(
			'icons',
			icons.filter( ( icon ) => icon.id !== id )
		);
	}

	return (
		<Panel>
			<PanelBody
				title={ __( 'Pointer', 'vsge-mapbox-block' ) }
				icon={ mapMarker }
				initialOpen={ false }
				className="vsge-mapbox-pointer-section"
			>
				<p className="vsge-mapbox-pointer-helper">
					{ __(
						'Custom reusable marker icons.',
						'vsge-mapbox-block'
					) }
				</p>
				<div className="vsge-mapbox-pointer-list">
					{ icons?.map( ( icon ) => (
						<IconItem
							key={ icon.id }
							{ ...icon }
							setIcon={ setIcon }
							removeIcon={ removeIcon }
						/>
					) ) }
				</div>
				<Button
					icon={ plusCircle }
					variant="secondary"
					className="vsge-mapbox-pointer-add"
					onClick={ () => addNewIcon( getNextId( icons ) ) }
				>
					{ __( 'Add new', 'vsge-mapbox-block' ) }
				</Button>
			</PanelBody>
		</Panel>
	);
};
