import {
	Button,
	Flex,
	FlexItem,
	Icon,
	Panel,
	PanelBody,
	PanelRow,
	TextControl,
} from '@wordpress/components';
import { mapMarker, plusCircle, image} from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { getNextId } from '../../utils/dataset';
import { MarkerIcon } from '../../types';

export const IconItem = ( props ) => {
	const { id, name, content, setIcon } = props;

	return (
		<FlexItem className={ 'icon-item' + id }>
			<TextControl
				label={ __( 'Marker' ) }
				value={ name || 'mapMarker' }
				onChange={ ( newValue ) =>
					setIcon( {
						...props,
						name: newValue,
					} )
				}
			/>
			<TextControl
				label={ __( 'svg markup' ) }
				value={ content || '<svg></svg>' }
				onChange={ ( newValue ) =>
					setIcon( {
						...props,
						content: newValue,
					} )
				}
			/>
			{ (
				<div
					className={ 'icon-item-preview' }
					dangerouslySetInnerHTML={ { __html: content } }
				/>
			) ?? <Icon icon={ image } /> }
		</FlexItem>
	);
};

export const PanelIcons = ( {
	icons = [],
	setOptions,
}: {
	icons: MarkerIcon[];
	setOptions: Function;
} ) => {
	function setIcon( newIcon: MarkerIcon ) {
		const newIcons = icons.map( ( icon ) =>
			icon.id === newIcon.id
				? {
						...icon,
						...newIcon,
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
				name: [ __( 'New Marker ' ), nextId ].join( ' ' ),
				content: undefined,
			},
		] );
	}

	return (
		<Panel>
			<PanelBody title="Pointer" icon={ mapMarker } initialOpen={ false }>
				<Flex direction={ 'column' }>
					{ icons?.map( ( icon, index ) => (
						<IconItem
							key={ index }
							{ ...icon }
							setIcon={ setIcon }
						/>
					) ) }
				</Flex>
				<Button
					icon={ plusCircle }
					text={ __( 'Add new' ) }
					className={ 'add-new-sortable-item' }
					style={ { width: '100%' } }
					onClick={ () => addNewIcon( getNextId( icons ) ) }
				/>
			</PanelBody>
		</Panel>
	);
};
