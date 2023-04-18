import { Feature } from '@turf/turf';
import { createPopUp, highlightListing, removePopup } from './popups';
import { pointerOffset } from '../constants';
import { flyToStore } from './view';
import { __ } from '@wordpress/i18n';
import mapboxgl from 'mapbox-gl';
import { getLinkType } from './index';

/**
 * This function enables a listing to be displayed on a map, with a popup and highlighted in a sidebar.
 *
 * @param {mapboxgl.Map|null} map            The mapboxgl map object on which the popup will be displayed.
 * @param {Feature}           clickedListing The clickedListing parameter is a Feature object that represents a
 *                                           point of interest on a map. It contains information about the location, such as its coordinates and
 *                                           properties like name, address, and other attributes. This function is designed to enable a listing
 *                                           by performing three actions: flying to the location on the map
 */
function enableListing( map, clickedListing: Feature ) {
	// 1. Fly to the point
	flyToStore( map, clickedListing );

	// 2. Close all other popups and display popup for clicked store
	createPopUp( map, clickedListing );

	// 3. Highlight listing in sidebar (and remove highlight for all other listings)
	highlightListing( clickedListing );
}

/**
 * The function initializes a Mapbox map with specified attributes and adds a terrain layer if
 * specified.
 *
 * @param {HTMLElement}       mapContainer The HTML element that will contain the map.
 * @param {Object}            attributes   An object containing various attributes for initializing the map, including
 *                                         latitude, longitude, pitch, bearing, mapZoom, mapStyle, and treeDimensionality.
 * @param {mapboxgl.Map|null} map          The `map` parameter is an optional parameter of type
 *                                         `mapboxgl.Map` or `null`. It represents the Mapbox map object that will be initialized or updated
 *                                         with the provided attributes. If it is not provided, a new map object will be created.
 * @return {mapboxgl.Map} a mapboxgl.Map object.
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

/**
 * This function adds markers to a map and creates popups when the markers are clicked.
 *
 * @param {Feature[]}         features - an array of GeoJSON features representing the markers to be added to
 *                                     the map
 * @param {mapboxgl.Map|null} map      - The map object is an instance of the Mapbox GL JS map that the markers will be added
 *                                     to.
 * @param {Object}            defaults - It is a variable that contains default values for the popup that will be displayed
 *                                     when a marker is clicked. It is used in the createPopUp function.
 * @return an array of markers that have been added to the map.
 */
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

/**
 * This function renders a list of map listings based on selected filters and data.
 *
 * @param {Object}      selectedFilter - The selectedFilter parameter is a filter that is applied to the data to
 *                                     display only the relevant listings. It can be an array of strings or an array of arrays, where each
 *                                     sub-array contains a string and a number. The string represents the company name and the number
 *                                     represents the count of listings for that
 * @param {Feature[]}   data           - The data parameter is an array of Feature objects that contain information
 *                                     about each listing.
 * @param {HTMLElement} listingEl      - The DOM element where the listings will be rendered.
 * @return Nothing is being returned, as this is a function that modifies the DOM by rendering a list
 * of listings based on the provided data and selected filter.
 */
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

/**
 * The function creates a new paragraph element with optional hyperlink based on the provided
 * properties.
 *
 * @param {Object} prop             The parameter `prop` is an object that contains the following properties:
 * @param {string} prop.textContent The text content of the paragraph
 * @param {string} prop.href        The `href` property of the paragraph
 * @param {string} prop.type        The `type` property of the paragraph
 * @return a newly created paragraph element with the text content specified in the `prop` parameter.
 * If the `prop` parameter also includes an `href` property, a link element is created within the
 * paragraph element with the specified `href` and `type` properties.
 */
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
