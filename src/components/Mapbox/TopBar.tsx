import { Button, SelectControl } from '@wordpress/components';

export const TopBar = ( attributes ) => {
	const { fitView, tagsEnabled, filtersEnabled, mapboxOptions } = attributes;

	return (
		<div className={ 'map-topbar' }>
			{ fitView ? (
				<Button
					icon={ 'align-center' }
					className={
						'button button-secondary outlined has-white-background-color fit-view'
					}
				>
					fit-view
				</Button>
			) : null }

			{ tagsEnabled ? (
				<SelectControl
					className={ 'filter-by-partnership' }
					value={ mapboxOptions.filters[ 0 ] }
					options={ mapboxOptions.filters }
          onChange={ () => {} }
				/>
			) : null }

			{ filtersEnabled ? (
				<SelectControl
					className={ 'filter-by-tag' }
					value={ mapboxOptions.tags[ 0 ] }
					options={ mapboxOptions.tags }
					onChange={ () => {} }
				/>
			) : null }
		</div>
	);
};
