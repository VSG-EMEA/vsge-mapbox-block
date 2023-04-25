import { Feature } from '@turf/turf';
import { __ } from '@wordpress/i18n';
import { highlightListing, MapPopup, MarkerPopup, removePopup } from './Popup';
import { flyToStore } from '../../utils/view';
import mapboxgl from 'mapbox-gl';

/**
 * This function renders a list of map listings based on selected filters and data.
 *
 * @param {Object}      selectedFilter The selectedFilter parameter is a filter that is applied to the data to
 *                                     display only the relevant listings. It can be an array of strings or an array of arrays, where each
 *                                     sub-array contains a string and a number. The string represents the company name and the number
 *                                     represents the count of listings for that
 * @param {Feature[]}   data           The data parameter is an array of Feature objects that contain information
 *                                     about each listing.
 * @param {HTMLElement} listingEl      The DOM element where the listings will be rendered.
 * @return Nothing is being returned, as this is a function that modifies the DOM by rendering a list
 * of listings based on the provided data and selected filter.
 */
export function renderListings( selectedFilter, data: Feature[] ) {
	if ( data?.length ) {
		data.map( ( feature: Feature ) => {
			<Listing props={ feature } />;
		} );
	} else if ( data ) {
		return <p>{ __( 'No results' ) }</p>;
	}
}

export const ListingTag = ( props ) => {
	const { tag, value } = props;
	return (
		<span className={ value } title={ value }>
			{ tag }
		</span>
	);
};

export const Listing = ( props, i ) => {
	const {
		name,
		id,
		mapboxOptions: { listings, tags, filters },
	} = props;

	return (
		<div className={ 'map-item listing' + props.id }>
			<img
				src="./src/images/grey-marker.png"
				className="gray-marker"
				alt={ '' }
			/>
			<p className={ 'partnership' }>{ tags.join() }</p>
			<a href={ '#' } className={ 'title' } data-position={ i }>
				{ name }
			</a>
		</div>
	);
};

/*
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

  if ( props.company && selectedFilter !== '' ) {
    const companiesParagraph = details.appendChild(
      document.createElement( 'span' ) as HTMLSpanElement
    );
    companiesParagraph.className = 'tags';
    let tagString = '';

    Object.entries( companyTags ).forEach( function (
      value
    ) {
      if ( value[ 1 ] !== 0 ) {
        const tag = getTag(
          selectedFilter,
          value[ 0 ]
        );
        tagString += (
          <MapListingTag
            tag={ tag[ 1 ] }
            value={ value[ 0 ] }
          />
        );
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
      enableListing( clickedListing, position );
    }
  } );
}*/

export function addMarkers( storesEl, map ) {
	removePopup();

	const markers = [];

	// removes all markers
	for ( let i = markers.length - 1; i >= 0; i-- ) {
		markers[ i ].remove();
	}

	/* For each feature in the GeoJSON object above: */
	storesEl.features.forEach( function ( marker, i ) {
		// Create an img element for the marker
		const el = document.createElement( 'div' );
		el.id = 'marker-' + i;
		el.className = 'marker';

		console.log( marker );

		if ( marker?.geometry ) {
			// Add markers to the map at all points
			const thismarker = new mapboxgl.Marker( el, { offset: [ 0, -23 ] } )
				.setLngLat( marker.geometry.coordinates )
				.addTo( map );

			markers.push( thismarker );
		}

		el.addEventListener( 'click', function ( e ) {
			e.stopPropagation();

			// 1. Fly to the point
			flyToStore( map, marker );

			// 2. Close all other popups and display popup for clicked store
			MarkerPopup( marker );

			// 3. Highlight listing in sidebar (and remove highlight for all other listings)
			highlightListing( marker );
		} );
	} );
}
