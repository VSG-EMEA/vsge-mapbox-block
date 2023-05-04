import { Map } from './Map';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useEffect, useContext } from '@wordpress/element';
import { MapboxContext } from './MapboxContext';
import { initMap } from './utils/initMap';
import mapboxgl, {
	MapboxGeoJSONFeature,
	MapMouseEvent,
	Point,
} from 'mapbox-gl';
import { pin } from '@wordpress/icons';
import { initGeocoder } from './utils/geocoder';
import { MapAttributes, MountedMapsContextValue } from '../../types';
import { addMarker, addMarkers } from './Markers';
import { addPopup, removePopup } from './Popup';

export function tempMarker( id: number = 0, coordinates = [ 0, 0 ] ) {
	return {
		type: 'Feature',
		id,
		properties: {
			name: 'temp',
			icon: pin,
			color: 'green',
		},
		geometry: {
			type: 'Point',
			coordinates,
		},
	};
}

function removeMarkerById(
	id: number,
	markersList: MapboxGeoJSONFeature[]
): MapboxGeoJSONFeature[] {
	return markersList.filter( ( marker ) => marker.id !== id );
}

function getMarkerData(
	id: number,
	markersList: mapboxgl.MapboxGeoJSONFeature[]
) {
	return markersList.find( ( marker ) => marker.id === id );
}

export function MapBox( {
	attributes,
}: {
	attributes: MapAttributes;
} ): JSX.Element {
	const {
		map,
		setMap,
		setGeoCoder,
		defaults,
		mapRef,
		geocoderRef,
		setLngLat,
		setMarkers,
		markers,
	}: MountedMapsContextValue = useContext( MapboxContext );

	function removeTempMarkers(
		mapRef: React.RefObject< HTMLDivElement > | undefined
	) {
		if ( mapRef?.current ) {
			mapRef?.current
				.querySelectorAll( '.marker-temp' )
				.forEach( ( marker ) => marker.remove() );
		}
	}

	function listenForClick( map: mapboxgl.Map ) {
		if ( map ) {
			map.on( 'click', ( e: MapMouseEvent ) => {
				// store the last clicked position
				setLngLat( e.lngLat );

				const bbox = [
					[ e.point.x - 0.0005, e.point.y - 0.0005 ],
					[ e.point.x + 0.0005, e.point.y + 0.0005 ],
				];
				// Find features intersecting the bounding box.
				// const selectedFeatures = map.queryRenderedFeatures( bbox );
				const clickedEl = e.originalEvent.target.parentElement;

				if ( markers && clickedEl?.nodeName === 'BUTTON' ) {
					if ( clickedEl.dataset?.markerName === 'temp' ) {
						return addPopup( map, {} );
					}
					const thisMarker = getMarkerData(
						Number( clickedEl.dataset?.id ),
						markers
					);

					return addPopup( map, thisMarker );
				}

				removeTempMarkers( mapRef );

				addMarker(
					tempMarker( markers?.length, [
						e.lngLat.lng,
						e.lngLat.lat,
					] ),
					map
				);
			} );
		}
	}

	useEffect( () => {
		if ( defaults?.accessToken && mapRef?.current ) {
			// Provide access token
			mapboxgl.accessToken = defaults.accessToken;

			// Initialize map and store the map instance
			setMap( initMap( mapRef.current, attributes, defaults ) );

			// Add the stored listings to the markers list
			setMarkers( attributes.mapboxOptions.listings );
		} else {
			console.log( 'No access token' );
		}
	}, [ mapRef ] );

	useEffect( () => {
		if ( map ) {
			map.on( 'load', () => {
				// Add geocoder
				if ( attributes.sidebarEnabled && attributes.geocoderEnabled ) {
					setGeoCoder(
						initGeocoder( geocoderRef, map, attributes, defaults )
					);
				}
			} );
		}
	}, [ map ] );

	useEffect( () => {
		if ( map && markers?.length ) {
			map.on( 'load', () => {
				// add markers to the map
				addMarkers( markers, map );

				// highlight the first listing
				listenForClick( map );
			} );
		}
	}, [ markers ] );

	return (
		<div
			className={ 'map-wrapper' }
			style={ { minHeight: attributes.mapHeight } }
		>
			{ attributes.sidebarEnabled ? (
				<Sidebar attributes={ attributes } />
			) : null }
			<div className={ 'map-container' }>
				<TopBar { ...attributes } />
				<Map mapRef={ mapRef } />
			</div>
		</div>
	);
}
