import { MapProvider } from './MapboxContext';
import { MapBox } from './index';

export function MapFrontend( { attributes } ): JSX.Element {
	return (
		<MapProvider>
			<MapBox attributes={ attributes } />
		</MapProvider>
	);
}
