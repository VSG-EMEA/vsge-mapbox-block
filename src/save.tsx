import './style/style.scss';

import { useBlockProps } from '@wordpress/block-editor';
import { BlockAttributes } from '@wordpress/blocks';
import MapBox from './components/Mapbox';
import { MapboxSidebar } from './components/Mapbox/MapboxSidebar';
import { Map } from './components/Mapbox/Map';
import { getDefaults } from './utils';
import GeoCoder from './components/Mapbox/Geocoder';
import { Listing } from './components/Mapbox/Listing';

/**
 * The save function defines the way in which the different attributes should be combined into the final markup, which is then serialized into post_content.
 *
 * @param    props
 * @param    props.attributes - the block attributes
 * @param    props.map
 * @function Object() { [native code] }
 */
function Save( { attributes, map }: BlockAttributes ): JSX.Element {
	const blockProps = useBlockProps.save( {
		className: 'block-mapbox map-wrapper',
	} );

	const defaults = getDefaults();

	return (
		<div
			{ ...blockProps }
			data-mapbox-options={ JSON.stringify( attributes ) }
		>
			{ attributes.sidebarEnabled ? (
				<div className={ 'map-sidebar' }>
					{ attributes.geocoderEnabled === true && defaults ? (
						<div id="geocoder" className="geocoder"></div>
					) : null }
					<div className="feature-listing">
						{ attributes.mapboxOptions.listings.map(
							( data: any, index: number ) => (
								<Listing { ...data } key={ index } />
							)
						) }
					</div>
				</div>
			) : null }
			<div className={ 'map-container' }>
				<Map attributes={ attributes } mapContainer={ null } />
			</div>
		</div>
	);
}
export default Save;
