import Mapbox from './Map';
import { MapboxSidebar } from './MapboxSidebar';

export default ( { attributes, mapContainer, map, defaults } ) => {
	return (
		<div className="map-wrapper">
			{ attributes.sidebarEnabled ? (
				<MapboxSidebar
					defaults={ defaults }
					map={ map }
					geocoderRef={ attributes.geocoderRef }
					mapboxOptions={ attributes.mapboxOptions }
				/>
			) : null }
			<div id="map-container">
				<Mapbox
					attributes={ attributes }
					mapContainer={ mapContainer }
				/>
			</div>
		</div>
	);
};
