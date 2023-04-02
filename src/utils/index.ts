import { distance, Coord, Feature, Units } from '@turf/turf';
import mapboxgl, { LngLatBoundsLike } from 'mapbox-gl';
import {
	CoordinatesDef,
	ExtraProperties,
	MapItem,
	PartnershipDef,
} from '../types';
import { pointerOffset } from '../constants';
import { __ } from '@wordpress/i18n';

export const getDefaults = () => {
	if ( mapboxBlockData )
		return {
			accessToken: mapboxBlockData.accessToken,
			siteurl: mapboxBlockData.siteurl,
			language: mapboxBlockData.language,
		};
};

export const getUserLanguage = () => {
	// @ts-ignore
	return navigator.language || navigator.userLanguage;
};

export const prepareStores = ( initialData ) => ( {
	type: 'geojson',
	stores: initialData.features.map( ( store: Feature, i: number ) => {
		return ( store.id = i );
	} ),
} );

function safeSlug( string: string ) {
	return encodeURIComponent( string )
		.toLowerCase()
		.replace( /\.|%[0-9a-zA-Z]{2}/gi, '' );
}

export function createSelectOptions(
	mapFilters: FilterDef[],
	mapTags: FilterDef[]
) {
	const selectType = document.getElementById( 'filter-by-tag' );

	for ( let i = 0; i < mapFilters.length; i++ ) {
		const el = document.createElement( 'option' );
		el.value = safeSlug( mapFilters[ i ].value );
		el.text = mapFilters[ i ].value;
		selectType?.append( el );
	}

	const selectPartnership = document.getElementById(
		'filter-by-partnership'
	);

	for ( let i = 0; i < mapTags.length; i++ ) {
		const el = document.createElement( 'option' );
		el.value = safeSlug( mapTags[ i ].value );
		el.text = mapTags[ i ].value;
		selectPartnership?.append( el );
	}
}

// Reset view button function (was placed in the topbar but removed)
export function resetView( map ) {
	return map.flyTo( {
		center: [ 7.0, 50.0 ],
		zoom: 5,
	} );
}

export function flyToStore( map, selectedFeature: Feature ) {
	return map.flyTo( {
		center: selectedFeature.geometry.coordinates,
		zoom: 8,
	} );
}

export function fitView() {
	const bounds = new mapboxgl.LngLatBounds();
	const mapContainer = document.getElementById( 'map-container' );
	if ( mapContainer ) {
		const padding = mapContainer.offsetWidth * 0.1;

		console.log( bounds );

		if ( filteredStores.length !== 0 ) {
			filteredStores.forEach( ( point: Feature ) => {
				bounds.extend( point.geometry.coordinates );
			} );

			if (
				bounds.sw.lat === bounds.ne.lat &&
				bounds.sw.lng === bounds.ne.lng
			) {
				const lat = parseFloat( bounds.sw.lat );
				const lng = parseFloat( bounds.sw.lng );
				bounds.sw.lat = lat + 0.5;
				bounds.ne.lat = lat - 0.5;
				bounds.sw.lng = lng + 0.5;
				bounds.ne.lng = lng - 0.5;
			}
			map.fitBounds( bounds, { padding } );
		}

		map.resize();
	}
}

export function createPopUp(
	currentFeature: MapItem,
	options: { siteurl: string }
) {
	removePopup();

	let { state, city, country, partnership, name, address, postalCode } =
		currentFeature.properties as ExtraProperties;

	if ( name ) {
		address = address ? address : '';
		city = city ? city + ' ' : '';
		postalCode = postalCode ? postalCode + ' ' : '';
		country = country ? country + ' ' : '';
		state = state ? ' (' + state + ')' : '';

		const mapPopup = new mapboxgl.Popup( { closeOnClick: false } )
			.setLngLat( currentFeature.geometry.coordinates as CoordinatesDef )
			.setHTML(
				`<img src="${
					options.siteurl
				}/wp-content/themes/brb/assets/images/elements/grey-marker.png" class="gray-marker" /><h3>${ getPartnership(
					partnership
				) }<br/>${ name }</h3><h4>${ address }</h4><p>${ city }${ postalCode }${ country }${ state }</p>`
			)
			.addTo( map );

		mapPopup.on( 'close', function () {
			document
				.getElementById( 'feature-listing' )
				?.classList.remove( 'filtered' );
		} );
	}
}

export function highlightListing( item: Feature ) {
	document.getElementById( 'feature-listing' )?.classList.add( 'filtered' );

	const activeItem = document.getElementsByClassName( 'active-store' );
	if ( activeItem[ 0 ] ) {
		activeItem[ 0 ].classList.remove( 'active-store' );
	}

	if ( item.properties ) {
		const listing = document.getElementById(
			'listing-' + item.properties.id
		);
		listing?.classList.add( 'active-store' );
	}
}

export function removePopup() {
	// removes the active popup
	const popUps = document.getElementsByClassName( 'mapboxgl-popup' );
	if ( popUps[ 0 ] ) popUps[ 0 ].remove();
}

export function addMarkers( storesEl: Feature[] ) {
	removePopup();

	// removes all markers
	for ( let i = markers.length - 1; i >= 0; i-- ) {
		markers[ i ].remove();
	}

	/* For each feature in the GeoJSON object above: */
	storesEl.forEach( ( marker: Feature, i: number ) => {
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
			flyToStore( marker );

			// 2. Close all other popups and display popup for clicked store
			createPopUp( marker, mapboxOptions );

			// 3. Highlight listing in sidebar (and remove highlight for all other listings)
			highlightListing( marker );
		} );
	} );
}

export function getPartnership( partnerships: PartnershipDef ) {
	const partnerTxt = [];
	partnerTxt = partnerships.forEach( ( partner ) => partner || partner.key );
	return partnerTxt;
}

export function getLinkType( linkType: string ) {
	if ( linkType === 'phone' ) {
		return 'tel:';
	} else if ( linkType === 'email' ) {
		return 'mailto:';
	}
	return '//';
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

export function renderListings( data: Feature[] ) {
	if ( data && data.length ) {
		// Clear any existing listings
		data.innerHTML = '';

		for ( let i = 0; i < data.length; i++ ) {
			const currentFeature = data[ i ];
			const prop = currentFeature.properties;
			const companyTags = currentFeature.properties.company;
			let listing = document.createElement( 'div' );

			if ( prop.name ) {
				listing = listing.appendChild(
					document.createElement( 'div' )
				);
				listing.innerHTML +=
					'<img src="assets/images/elements/grey-marker.png" class="gray-marker"/>';

				if ( prop.partnership ) {
					listing.innerHTML +=
						'<p class="partnership">' +
						prop.partnership.join() +
						'</p>';
				}

				listing.className = 'map-item';
				listing.id = 'listing-' + prop.id;

				// the title (company name)
				const link: HTMLAnchorElement = listing.appendChild(
					document.createElement( 'a' )
				);
				link.href = '#';
				link.className = 'title';
				link.dataset.position = i.toString();
				link.innerHTML = prop.name;

				// the company details
				const details = listing.appendChild(
					document.createElement( 'div' )
				);

				const paragraph1 = details.appendChild(
					document.createElement( 'p' )
				) as HTMLParagraphElement;

				// address
				if ( prop.address ) {
					paragraph1.innerHTML += prop.address;
				}

				const paragraph2 = details.appendChild(
					document.createElement( 'p' )
				);

				if ( prop.city ) {
					paragraph2.innerHTML += prop.city + ', ';
				}
				if ( prop.postalCode ) {
					paragraph2.innerHTML += prop.postalCode;
				}
				if ( prop.country ) {
					paragraph2.innerHTML += ' ' + prop.country;
				}
				if ( prop.state ) {
					paragraph2.innerHTML += ` (${ prop.state })`;
				}

				// phone
				if ( prop.phone )
					details.appendChild(
						addParagraph( {
							href: prop.phone,
							type: 'phone',
							textContent: 'Phone: ',
						} )
					);

				// email
				if ( prop.emailAddress )
					details.appendChild(
						addParagraph( {
							href: prop.emailAddress,
							type: 'email',
							textContent: '',
						} )
					);

				// website
				if ( prop.website )
					details.appendChild(
						addParagraph( {
							href: prop.website,
							type: 'website',
							textContent: '',
						} )
					);

				if ( prop.company ) {
					const companiesParagraph = details.appendChild(
						document.createElement( 'span' ) as HTMLSpanElement
					);
					companiesParagraph.className = 'tags';
					let tagString = '';

					Object.entries( companyTags ).forEach( function ( value ) {
						if ( value[ 1 ] !== 0 ) {
							const tag = Array.isArray( companyFilter )
								? companyFilter.filter( function ( element ) {
										return element[ 0 ] === value[ 0 ];
								  } )[ 0 ]
								: companyFilter.find( ( element: string[] ) => {
										return element[ 0 ] === value[ 0 ];
								  } );
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
					createPopUp( clickedListing as MapItem );

					// 3. Highlight listing in sidebar (and remove highlight for all other listings)
					highlightListing( clickedListing );
				}

				link.addEventListener( 'click', function ( e ) {
					// Update the currentFeature to the store associated with the clicked link
					const target = e.currentTarget as HTMLElement;
					const position = target.dataset.position ?? false;
					if ( position ) {
						const clickedListing = data[ parseInt( position, 10 ) ];
						enableListing( clickedListing );
					}
				} );
			}
		}
	} else if ( data ) {
		const empty = document.createElement( 'p' );
		empty.textContent = __( 'No results' );
		data.appendChild( empty );
	}
}

// normalize string for comparator
export function normalize( string: string ) {
	if ( string ) {
		return string.trim().toLowerCase();
	}
	return '';
}

export function getBbox(
	sortedStores: Feature[],
	storeIdentifier: any,
	results: Coord
) {
	console.log( sortedStores[ storeIdentifier ].geometry );

	const lats = [
		sortedStores[ storeIdentifier ].geometry.coordinates[ 1 ],
		results.coordinates[ 1 ],
	];

	const lons = [
		sortedStores[ storeIdentifier ].geometry.coordinates[ 0 ],
		results.coordinates[ 0 ],
	];

	const sortedLons = lons.sort( function ( a, b ) {
		if ( a > b ) {
			return 1;
		}
		if ( a.distance < b.distance ) {
			return -1;
		}
		return 0;
	} );
	const sortedLats = lats.sort( function ( a, b ) {
		if ( a > b ) {
			return 1;
		}
		if ( a.distance < b.distance ) {
			return -1;
		}
		return 0;
	} );
	return [
		[ sortedLons[ 0 ], sortedLats[ 0 ] ],
		[ sortedLons[ 1 ], sortedLats[ 1 ] ],
	];
}

export function locateNearestStore( result: Coord, storesArray: MapItem[] ) {
	const options: { units: Units | undefined } = { units: 'kilometers' };

	storesArray.forEach( function ( store ) {
		store.distance = {
			value: distance( result, store.geometry as Coord, options ),
			writable: true,
			enumerable: true,
			configurable: true,
		};
	} );

	storesArray.sort( ( a, b ) => {
		if ( a.distance > b.distance ) {
			return 1;
		}
		if ( a.distance < b.distance ) {
			return -1;
		}
		return 0; // a must be equal to b
	} );

	return storesArray;
}

// Filter the type of reseller with the select in the top bar
export function filterStores( stores ) {
	const selectBoxType = document.getElementById(
		'filter-by-tag'
	) as HTMLSelectElement | null;
	if ( selectBoxType ) {
		const selectedType =
			selectBoxType.options[ selectBoxType.selectedIndex ].value !== ''
				? selectBoxType.options[ selectBoxType.selectedIndex ].value
				: '';

		const selectBoxPartner = document.getElementById(
			'filter-by-partnership'
		) as HTMLSelectElement | null;
		const selectedPartner =
			selectBoxPartner?.options[ selectBoxPartner.selectedIndex ]
				.value !== ''
				? selectBoxPartner?.options[ selectBoxPartner.selectedIndex ]
						.value
				: '';

		let filtered;

		if ( selectedType || selectedPartner ) {
			// Filter visible features that don't match the input value.
			filtered = stores.filter(
				( feature ) =>
					( feature.properties.company[ selectedType ] > 0 ||
						selectedType === '' ) &&
					( feature.properties.partnership[ selectedPartner ] > 0 ||
						selectedPartner === '' )
			);

			filteredStores = filtered;
		} else {
			filteredStores = stores;
		}

		if ( searchResult ) {
			filteredStores = locateNearestStore( searchResult, filteredStores );

			const listings = document.getElementById( 'feature-listing' );
			while ( listings?.firstChild ) {
				listings.removeChild( listings.firstChild );
			}

			// Populate the sidebar with filtered results
			renderListings( filteredStores );
			addMarkers( filteredStores );
			/* Open a popup for the closest store. */
			createPopUp( filteredStores[ 0 ] );

			/** Highlight the listing for the closest store. */
			document
				.getElementById( 'feature-listing' )
				?.classList.remove( 'filtered' );
			const activeListing = document.getElementById(
				'listing-' + filteredStores[ 0 ].id
			);
			activeListing?.classList.add( 'active-store' );

			/**
			 * Adjust the map camera:
			 * Get a bbox that contains both the geocoder result and
			 * the closest store. Fit the bounds to that bbox.
			 */
			const bbox = getBbox(
				filteredStores,
				0,
				searchResult
			) as LngLatBoundsLike;

			map.fitBounds( bbox, {
				padding: 100,
			} );
		}

		return;
	}

	removePopup();

	// Populate the sidebar with filtered results
	renderListings( filteredStores );
	addMarkers( filteredStores );
	document
		.getElementById( 'feature-listing' )
		?.classList.remove( 'filtered' );

	fitView();
}
