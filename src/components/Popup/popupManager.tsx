import { createRoot } from '@wordpress/element';
import type mapboxgl from 'mapbox-gl';
import type { CoordinatesDef, MapBoxListing, MarkerProps } from '../../types';
import { PopupContent } from './PopupContent';
import { defaultMarkerSize } from '../Marker/defaults';

type ElementRoot = ReturnType< typeof createRoot >;

export type PopupOrigin = 'sidebar' | 'geocoder' | 'canvas' | 'custom';

export interface PopupOptions {
	returnFocusTarget?: HTMLElement | null;
	origin?: PopupOrigin;
}

export interface PopupResource {
	popup: mapboxgl.Popup;
	root: ElementRoot;
	element: HTMLDivElement;
	returnFocusTarget?: HTMLElement | null;
	origin?: PopupOrigin;
	destroy: () => void;
}

export interface PopupManager {
	add: ( resource: PopupResource ) => void;
	remove: ( resource: PopupResource ) => void;
	clear: () => void;
	destroy: () => void;
	readonly size: number;
}

/**
 * Creates an authoritative, locally owned PopupManager instance.
 */
export function createPopupManager(): PopupManager {
	const resources = new Set< PopupResource >();

	const manager: PopupManager = {
		add( resource: PopupResource ) {
			resources.add( resource );
		},
		remove( resource: PopupResource ) {
			resources.delete( resource );
		},
		clear() {
			const list = Array.from( resources );
			resources.clear();
			for ( const resource of list ) {
				resource.destroy();
			}
		},
		destroy() {
			this.clear();
		},
		get size() {
			return resources.size;
		},
	};

	return manager;
}

/**
 * Creates and registers a new managed Mapbox popup.
 *
 * @param mapbox   - The Mapbox GL runtime instance.
 * @param map      - The Mapbox map instance.
 * @param manager  - The local PopupManager owning this popup.
 * @param marker   - The listing data for the popup.
 * @param children - Optional custom JSX element to render inside the popup.
 * @param options  - Optional returnFocusTarget and origin information.
 */
export function createManagedPopup(
	mapbox: typeof mapboxgl,
	map: mapboxgl.Map,
	manager: PopupManager,
	marker: MapBoxListing,
	children?: JSX.Element,
	options?: PopupOptions
): PopupResource | null {
	if ( ! marker ) {
		return null;
	}

	const popupElement = document.createElement( 'div' );
	const root = createRoot( popupElement );

	root.render(
		children ?? <PopupContent { ...( marker.properties as MarkerProps ) } />
	);

	const offset = ( marker?.properties?.iconSize || defaultMarkerSize ) * 0.5;
	const popup = new mapbox.Popup( { offset } )
		.setLngLat( marker.geometry.coordinates as CoordinatesDef )
		.setDOMContent( popupElement )
		.addTo( map );

	let isDestroyed = false;

	const destroy = () => {
		if ( isDestroyed ) {
			return;
		}
		isDestroyed = true;

		// 1. Unbind close listener first to prevent recursive triggers when calling popup.remove()
		popup.off( 'close', onClose );

		// 2. Unmount React root
		try {
			root.unmount();
		} catch {
			// Ignore if already unmounted
		}

		// 3. Remove popup from Mapbox
		try {
			popup.remove();
		} catch {
			// Ignore if already removed
		}

		// 4. Remove from manager
		manager.remove( resource );
	};

	const onClose = () => {
		const returnTarget = resource.returnFocusTarget;
		const popupContainer =
			( typeof popup.getElement === 'function'
				? popup.getElement()
				: null ) || popupElement;
		const activeEl = document.activeElement;
		const focusWasInPopup =
			popupContainer &&
			activeEl &&
			( popupContainer === activeEl ||
				popupContainer.contains( activeEl ) );

		destroy();

		if ( returnTarget && returnTarget.isConnected ) {
			try {
				returnTarget.focus();
			} catch {
				// Ignore if focus restoration fails
			}
		} else if (
			focusWasInPopup &&
			map &&
			typeof map.getCanvas === 'function'
		) {
			try {
				map.getCanvas().focus();
			} catch {
				// Ignore
			}
		}
	};

	popup.on( 'close', onClose );

	const resource: PopupResource = {
		popup,
		root,
		element: popupElement,
		returnFocusTarget: options?.returnFocusTarget ?? null,
		origin: options?.origin ?? 'canvas',
		destroy,
	};

	manager.add( resource );
	return resource;
}
