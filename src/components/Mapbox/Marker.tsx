import { Button, Icon } from '@wordpress/components';
import { enableListing } from '../../utils/dataset';
import { safeSlug } from '../../utils';

export const defaultMarkerStyle: {
	icon: JSX.Element;
	iconSize: number;
	iconColor: string;
} = {
	// eslint-disable-next-line prettier/prettier
	icon: ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 94 128"><path fill="#c64242" fillOpacity=".99" d="M46.98 126.64c-.29-.68-6.17-6.43-10.38-11.66-24.94-33.12-52.76-63.9-20.28-101.3C30.7-.22 48.43-1 66.66 5.48c51.33 29.7 14.17 78.15-10.23 110l-9.45 11.16zm15.44-50.77C96.65 51.4 70.19 4.24 32.57 19.91c-10.98 5.86-16.44 16.05-16.63 28.07-.52 11.7 5.69 21.47 15.53 27.46 7.06 3.84 10.16 4.54 18.15 4.06 5.17-.3 8.16-1.15 12.8-3.63z"/><path fill="#c64242" fillOpacity=".99" d="M37.16 87.56a44.99 43.92 0 1 1 1.13.22"/><path fill="none" d="M44.28 69.13a26.01 21 0 1 1 .64.1" opacity=".34"/><path fill="none" d="M32.54 114.28a16.66 11.75 0 1 1 .41.06"/><path fill="#b72c2c" d="M40.1 81.38a33.43 34.45 0 1 1 .84.17"/><path fill="#fff" d="M42.02 69.42a22.1 22.59 0 1 1 .55.12"/></svg> ),
	iconSize: 48,
	iconColor: 'red',
};

export function Marker( { feature, map } ): JSX.Element {
	return (
		<Button
			onClick={ ( e ) => {
				e.preventDefault();
				enableListing( map, feature );
			} }
			className={ 'marker marker-' + safeSlug( feature.properties.name ) }
			id={ 'marker-' + feature.id || 'temp' }
			data-id={ feature.id ?? 'temp' }
			data-marker-type={ feature.type }
			data-marker-name={ safeSlug( feature.properties.name ) }
		>
			<Icon
				icon={ feature.properties.icon || defaultMarkerStyle.icon }
				size={
					feature.properties.iconSize || defaultMarkerStyle.iconSize
				}
				style={ {
					fill:
						feature.properties.iconColor ||
						defaultMarkerStyle.iconColor,
				} }
			/>
		</Button>
	);
}
