import type mapboxgl from 'mapbox-gl';

declare global {
	interface Window {
		vsgeMapboxGL?: typeof mapboxgl;
		vsgeLoadMapbox?: () => Promise< typeof mapboxgl >;
	}
}

let mapboxPromise: Promise< typeof mapboxgl > | null = null;

// Expose realm-local Mapbox loader under the plugin-owned namespace in this window realm.
if ( typeof window !== 'undefined' ) {
	window.vsgeLoadMapbox = () => {
		if ( window.vsgeMapboxGL ) {
			return Promise.resolve( window.vsgeMapboxGL );
		}

		if ( ! mapboxPromise ) {
			mapboxPromise = import(
				/* webpackChunkName: "mapbox" */ 'mapbox-gl'
			)
				.then( ( module ) => {
					const mb = ( module.default ?? module ) as typeof mapboxgl;
					window.vsgeMapboxGL = mb;
					return mb;
				} )
				.catch( ( error ) => {
					mapboxPromise = null;
					throw error;
				} );
		}

		return mapboxPromise;
	};
}

export {};
