import {
	Button,
	Flex,
	FlexItem,
	Panel,
	PanelBody,
	TextControl,
} from '@wordpress/components';
import { cancelCircleFilled, mapMarker, plusCircle } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { getNextId } from '../../utils/dataset';
import { MarkerIcon } from '../../types';

export const IconItem = ( props: {
	id: number;
	name: string;
	content: string;
	setIcon: ( props: any ) => void;
	removeIcon: ( id: number ) => void;
} ) => {
	const { id, name, content, setIcon, removeIcon } = props;

	return (
		<FlexItem className={ 'marker-icon-item icon-item-' + id }>
			<div className={ 'marker-icon-item__preview' }>
				<div
					className={ 'svg-wrapper' }
					dangerouslySetInnerHTML={ { __html: content } }
				></div>
				<Button
					icon={ cancelCircleFilled }
					title={ __( 'Delete icon' ) }
					className={ 'remove-sortable-item' }
					style={ { width: '50%' } }
					onClick={ () => removeIcon( id ) }
				/>
			</div>

			<div>
				<TextControl
					placeholder={ __( 'Marker Name' ) }
					value={ name || 'mapMarker' }
					onChange={ ( newValue ) =>
						setIcon( {
							...props,
							name: newValue,
						} )
					}
				/>
				<TextControl
					placeholder={ __( 'svg markup' ) }
					value={ content || '<svg></svg>' }
					onChange={ ( newValue ) =>
						setIcon( {
							...props,
							content: newValue,
						} )
					}
				/>
			</div>
		</FlexItem>
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

	function removeIcon( id: number ) {
		setOptions(
			'icons',
			icons.filter( ( icon ) => icon.id !== id )
		);
	}

	return (
		<Panel>
			<PanelBody title="Pointer" icon={ mapMarker } initialOpen={ false }>
				<Flex direction={ 'column' }>
					{ icons?.map( ( icon, index ) => (
						<>
							<IconItem
								key={ index }
								{ ...icon }
								setIcon={ setIcon }
								removeIcon={ removeIcon }
							/>
							<hr />
						</>
					) ) }
				</Flex>
				<Button
					icon={ plusCircle }
					text={ __( 'Add new' ) }
					className={ 'add-new-sortable-item' }
					style={ { width: '50%' } }
					onClick={ () => addNewIcon( getNextId( icons ) ) }
				/>
			</PanelBody>
		</Panel>
	);
};
