import { Feature } from '@turf/turf';
import { createPopUp, highlightListing, removePopup } from './popups';
import { pointerOffset } from '../constants';
import { flyToStore } from './view';
import { __ } from '@wordpress/i18n';
import mapboxgl from 'mapbox-gl';

/**
 * Initialize the mapbox map.
 *
 * @param {HTMLElement}       mapContainer - the div that will contain the map
 * @param {Object}            attributes   - the attributes for the map
 * @param {mapboxgl.Map|null} map          - the mapbox map object
 * @return {mapboxgl.Map} the mapbox map object
 */
export function initMap( mapContainer, attributes, map?: mapboxgl.Map | null ) {
	const { latitude, longitude, pitch, bearing, mapZoom, mapStyle } =
		attributes;

	map = new mapboxgl.Map( {
		container: mapContainer,
		style: 'mapbox://styles/mapbox/' + mapStyle,
		center: [ longitude, latitude ],
		zoom: mapZoom,
		bearing,
		pitch,
	} );

	if ( attributes.treeDimensionality ) {
		if ( ! map.getSource( 'mapbox-dem' ) ) {
			map.addSource( 'mapbox-dem', {
				type: 'raster-dem',
				url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
				tileSize: 512,
				maxzoom: 14,
			} );
		}
		// add the DEM source as a terrain layer with exaggerated height
		map.setTerrain( {
			source: 'mapbox-dem',
			exaggeration: 1.5,
		} );
	} else if (
		! attributes.treeDimensionality &&
		map.getSource( 'mapbox-dem' )
	) {
		map.removeSource( 'mapbox-dem' );
	}

	return map;
}

export function addMarkers( features: Feature[], map, defaults ) {
	removePopup();

	const markers = [];

	/* For each feature in the GeoJSON object above: */
	features.forEach( ( marker: Feature, i: number ) => {
		if ( typeof marker?.geometry?.coordinates !== 'object' ) {
			console.log( 'marker.geometry missing in ', marker );
			return;
		}

		// Create an img element for the marker
		const el = document.createElement( 'div' );
		el.id = 'marker-' + i;
		el.className = 'marker';

		// Add markers to the map at all points
		const newMarker = new mapboxgl.Marker( el, pointerOffset )
			.setLngLat( marker.geometry.coordinates )
			.addTo( map );

		markers.push( newMarker );

		el.addEventListener( 'click', function ( e ) {
			e.stopPropagation();

			// 1. Fly to the point
			flyToStore( map, marker.geometry.coordinates );

			// 2. Close all other popups and display popup for clicked store
			createPopUp( map, marker.geometry.coordinates, defaults );

			// 3. Highlight listing in sidebar (and remove highlight for all other listings)
			highlightListing( marker );
		} );
	} );

	return markers;
}

export function renderListings( selectedFilter, data: Feature[], listingEl ) {
	if ( data && data.length ) {
		// Clear any existing listings
		listingEl.innerHTML = '';

		for ( let i = 0; i < data.length; i++ ) {
			const currentFeature = data[ i ];

			if ( currentFeature.type === 'Feature' ) {
				const props = currentFeature.properties;
				const companyTags = currentFeature.properties.company;
				let listing = document.createElement( 'div' );

				if ( props.name ) {
					listing = listing.appendChild(
						document.createElement( 'div' )
					);
					listing.innerHTML +=
						'<img src="./src/images/grey-marker.png" class="gray-marker"/>';

					if ( props.partnership ) {
						listing.innerHTML +=
							'<p class="partnership">' +
							props.partnership.join() +
							'</p>';
					}

					listing.className = 'map-item';
					listing.id = 'listing-' + props.id;

					// the title (company name)
					const link: HTMLAnchorElement = listing.appendChild(
						document.createElement( 'a' )
					);
					link.href = '#';
					link.className = 'title';
					link.dataset.position = i.toString();
					link.innerHTML = props.name;

					// the company details
					const details = listing.appendChild(
						document.createElement( 'div' )
					);

					const paragraph1 = details.appendChild(
						document.createElement( 'p' )
					) as HTMLParagraphElement;

					// address
					if ( props.address ) {
						paragraph1.innerHTML += props.address;
					}

					const paragraph2 = details.appendChild(
						document.createElement( 'p' )
					);

					if ( props.city ) {
						paragraph2.innerHTML += props.city + ', ';
					}
					if ( props.postalCode ) {
						paragraph2.innerHTML += props.postalCode;
					}
					if ( props.country ) {
						paragraph2.innerHTML += ' ' + props.country;
					}
					if ( props.state ) {
						paragraph2.innerHTML += ` (${ props.state })`;
					}

					// phone
					if ( props.phone )
						details.appendChild(
							addParagraph( {
								href: props.phone,
								type: 'phone',
								textContent: 'Phone: ',
							} )
						);

					// email
					if ( props.emailAddress )
						details.appendChild(
							addParagraph( {
								href: props.emailAddress,
								type: 'email',
								textContent: '',
							} )
						);

					// website
					if ( props.website )
						details.appendChild(
							addParagraph( {
								href: props.website,
								type: 'website',
								textContent: '',
							} )
						);

					if ( props.company ) {
						const companiesParagraph = details.appendChild(
							document.createElement( 'span' ) as HTMLSpanElement
						);
						companiesParagraph.className = 'tags';
						let tagString = '';

						Object.entries( companyTags ).forEach( function (
							value
						) {
							if ( value[ 1 ] !== 0 ) {
								const tag = Array.isArray( selectedFilter )
									? selectedFilter.filter( function (
											element
									  ) {
											return element[ 0 ] === value[ 0 ];
									  } )[ 0 ]
									: selectedFilter.find(
											( element: string[] ) => {
												return (
													element[ 0 ] === value[ 0 ]
												);
											}
									  );
								tagString += `<span class="tag ${
									value[ 0 ]
								}" title="${ value[ 0 ] }">${ [
									tag[ 1 ],
								] }</span>`;
							}
						} );

						companiesParagraph.innerHTML += tagString;
						paragraph2.innerHTML += companiesParagraph;
					}

					// click on sidebar store
					function enableListing( clickedListing: Feature ) {
						// 1. Fly to the point
						flyToStore( clickedListing );

						// 2. Close all other popups and display popup for clicked store
						createPopUp( clickedListing );

						// 3. Highlight listing in sidebar (and remove highlight for all other listings)
						highlightListing( clickedListing );
					}

					link.addEventListener( 'click', function ( e ) {
						// Update the currentFeature to the store associated with the clicked link
						const target = e.currentTarget as HTMLElement;
						const position = target.dataset.position ?? false;
						if ( position ) {
							const clickedListing =
								data[ parseInt( position, 10 ) ];
							enableListing( clickedListing );
						}
					} );
				}
			}
		}
	} else if ( data ) {
		const empty = document.createElement( 'p' );
		empty.textContent = __( 'No results' );
		data.appendChild( empty );
	}
}

export function addParagraph( prop: {
	textContent: string;
	href: string;
	type: string;
} ) {
	const newParagraph = document.createElement( 'p' );
	newParagraph.innerHTML += prop.textContent;
	if ( prop.href ) {
		const websiteLink = newParagraph.appendChild(
			document.createElement( 'a' )
		);
		const linktype = getLinkType( prop.type );
		websiteLink.href = linktype + prop.href;
		websiteLink.className = prop.type + '-link';
		websiteLink.innerHTML = prop.href;
	}
	return newParagraph;
}
