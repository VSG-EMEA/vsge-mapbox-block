import { useBlockProps } from '@wordpress/block-editor';
import { BlockSaveProps } from '@wordpress/blocks';
import { Map } from './components/Mapbox/Map';
import { getDefaults } from './utils';
import { Listing } from './components/Mapbox/Listing';
import { __ } from '@wordpress/i18n';
import classNames from 'classnames';
import { MapAttributes } from './types';

/**
 * The save function defines the way in which the different attributes should be combined into the final markup, which is then serialized into post_content.
 *
 * @param {BlockSaveProps} props
 * @param {MapAttributes}  props.attributes - the block attributes
 */
function Save( { attributes }: BlockSaveProps< MapAttributes > ): JSX.Element {
	const blockProps = useBlockProps.save( {
		className: classNames( 'wp-block-vsge-mapbox', 'block-mapbox' ),
	} );

	const defaults = getDefaults();

	return (
		<div
			{ ...blockProps }
			data-mapbox-attributes={ JSON.stringify( attributes ) }
			data-mapbox-listings={ JSON.stringify(
				attributes.mapboxOptions.listings
			) }
			data-mapbox-tags={ JSON.stringify( attributes.mapboxOptions.tags ) }
			data-mapbox-filters={ JSON.stringify(
				attributes.mapboxOptions.filters
			) }
		>
			{ attributes.sidebarEnabled ? (
				<div className={ 'map-sidebar' }>
					{ attributes.geocoderEnabled && defaults ? (
						<div id="geocoder" className="geocoder"></div>
					) : null }
					<div className="feature-listing">
						{ attributes.mapboxOptions.listings.map(
							( data: any, index: number ) => (
								<Listing
									jsonFeature={ data }
                  key={ index }
                  map={ null }
                />
							)
						) }
					</div>
				</div>
			) : null }
			<div className={ 'map-container' }>
				<div className={ 'map-topbar' }>
					{ attributes.fitView ? (
						<button
							className={
								'button button-secondary outlined has-white-background-color fit-view'
							}
						>
							fit-view
						</button>
					) : null }

					{ attributes.tagsEnabled ? (
						<select className={ 'filter-by-partnership' }>
							<option value="" selected key={ 0 }>
								{ __( 'Filters' ) }
							</option>
							{ attributes.mapboxOptions.filters.map(
								( option: any, index: number ) => (
									<option
										value={ option.value }
										key={ option.id }
									>
										{ option.value }
									</option>
								)
							) }
						</select>
					) : null }

					{ attributes.filtersEnabled ? (
						<select className={ 'filter-by-tag' }>
							<option value="" selected key={ 0 }>
								{ __( 'Tags' ) }
							</option>
							{ attributes.mapboxOptions.tags.map(
								( option: any, index: number ) => (
									<option
										value={ option.value }
										key={ option.id }
									>
										{ option.value }
									</option>
								)
							) }
						</select>
					) : null }
					<Map mapRef={ null } />
				</div>
			</div>
		</div>
	);
}
export default Save;
