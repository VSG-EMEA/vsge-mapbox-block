import { registerBlockType } from '@wordpress/blocks';

/** add styles to bundle */
import './style/admin.scss';

/** the edit function */
import Edit from './edit';

/** the save function */
import Save from './save';

/** Block settings */
import blockConfig from './block.json';

const jsonData = blockConfig as Record< string, any >;

registerBlockType( jsonData.name, {
	...jsonData,
	icon: (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.696 14.943c-4.103 4.103-11.433 2.794-11.433 2.794S4.94 10.421 9.057 6.304c2.281-2.281 6.061-2.187 8.45.189s2.471 6.168.189 8.45zm-4.319-7.91-1.174 2.416-2.416 1.174 2.416 1.174 1.174 2.416 1.174-2.416 2.416-1.174-2.416-1.174-1.174-2.416z" />
		</svg>
	),
	/**
	 * @see ./edit.js
	 */
	edit: Edit,
	/**
	 * @see ./save.js
	 */
	save: Save,
} );
