import { Button, SelectControl, TextControl } from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { defaultColors, defaultMarkerSize } from '../Marker/defaults';
import {
	getNextId,
	paginateListings,
	searchListings,
	updateListingById,
} from '../../utils/dataset';
import type {
	CoordinatesDef,
	MapBoxListing,
	MapboxOptions,
	MarkerProps,
} from '../../types';
import { DealerEditor } from './DealerEditor';

const PAGE_SIZE = 25;

const defaultMarkerProps: MarkerProps = {
	name: '',
	description: '',
	phone: '',
	mobile: '',
	company: '',
	address: '',
	city: '',
	postalCode: '',
	country: '',
	countryCode: '',
	emailAddress: '',
	website: '',
	icon: 'default',
	iconSize: defaultMarkerSize,
	iconColor: defaultColors[ 0 ],
	itemTags: [],
	itemFilters: [],
	preferredArea: [],
	draggable: false,
};

function createDealer(
	id: number,
	coordinates: CoordinatesDef | null
): MapBoxListing {
	return {
		id,
		type: 'Feature',
		geometry: { type: 'Point', coordinates: coordinates || [ 0, 0 ] },
		properties: {
			...defaultMarkerProps,
			name: `${ __( 'New dealer', 'vsge-mapbox-block' ) } ${ id }`,
		},
	};
}

type DealerManagerProps = {
	options: MapboxOptions;
	pendingCoordinates: CoordinatesDef | null;
	selectedId?: number | null;
	onSelect?: ( id: number | null ) => void;
	onListingsChange: ( listings: MapBoxListing[] ) => void;
};

export function DealerManager( {
	options,
	pendingCoordinates,
	selectedId: controlledSelectedId,
	onSelect,
	onListingsChange,
}: DealerManagerProps ): JSX.Element {
	const [ selectedId, setSelectedId ] = useState< number | null >( null );
	const activeSelectedId =
		controlledSelectedId === undefined ? selectedId : controlledSelectedId;
	const [ search, setSearch ] = useState( '' );
	const [ country, setCountry ] = useState( '' );
	const [ page, setPage ] = useState( 1 );

	const countries = useMemo(
		() =>
			Array.from(
				new Set(
					options.listings
						.map( ( listing ) => listing.properties.country )
						.filter( ( value ): value is string =>
							Boolean( value )
						)
				)
			).sort(),
		[ options.listings ]
	);
	const filteredListings = useMemo(
		() => searchListings( options.listings, search, country ),
		[ options.listings, search, country ]
	);
	const totalPages = Math.max(
		1,
		Math.ceil( filteredListings.length / PAGE_SIZE )
	);
	const visibleListings = useMemo(
		() =>
			paginateListings(
				filteredListings,
				Math.min( page, totalPages ),
				PAGE_SIZE
			),
		[ filteredListings, page, totalPages ]
	);
	const selectedListing = options.listings.find(
		( listing ) => listing.id === activeSelectedId
	);

	useEffect( () => {
		setPage( 1 );
	}, [ search, country ] );
	useEffect( () => {
		if ( activeSelectedId !== null && ! selectedListing ) {
			setSelectedId( null );
			onSelect?.( null );
		}
	}, [ activeSelectedId, selectedListing, onSelect ] );
	function selectDealer( id: number | null ) {
		setSelectedId( id );
		onSelect?.( id );
	}

	function addDealer() {
		const dealer = createDealer(
			getNextId( options.listings ),
			pendingCoordinates
		);
		onListingsChange( [ ...options.listings, dealer ] );
		selectDealer( dealer.id );
	}

	return (
		<div className="vsge-mapbox-dealer-manager">
			<div className="vsge-mapbox-dealer-manager__heading">
				<h2>
					{ __( 'Dealers', 'vsge-mapbox-block' ) } (
					{ options.listings.length })
				</h2>
				<Button variant="primary" onClick={ addDealer }>
					{ __( 'Add dealer', 'vsge-mapbox-block' ) }
				</Button>
			</div>
			<TextControl
				label={ __( 'Search dealers', 'vsge-mapbox-block' ) }
				value={ search }
				onChange={ setSearch }
				help={ __(
					'Searches name, company, city, country, country code, and postal code.',
					'vsge-mapbox-block'
				) }
			/>
			<SelectControl
				label={ __( 'Country', 'vsge-mapbox-block' ) }
				value={ country }
				options={ [
					{
						value: '',
						label: __( 'All countries', 'vsge-mapbox-block' ),
					},
					...countries.map( ( value ) => ( {
						value,
						label: value,
					} ) ),
				] }
				onChange={ setCountry }
			/>
			<div
				className="vsge-mapbox-dealer-manager__list"
				role="listbox"
				aria-label={ __( 'Dealers', 'vsge-mapbox-block' ) }
			>
				{ visibleListings.map( ( listing ) => (
					<Button
						key={ listing.id }
						variant={
							listing.id === activeSelectedId
								? 'primary'
								: 'secondary'
						}
						className="vsge-mapbox-dealer-manager__row"
						role="option"
						aria-selected={ listing.id === activeSelectedId }
						onClick={ () => selectDealer( listing.id ) }
					>
						<strong>
							{ listing.properties.name ||
								__( 'Unnamed dealer', 'vsge-mapbox-block' ) }
						</strong>
						<span>
							{ [
								listing.properties.company,
								listing.properties.city,
								listing.properties.countryCode ||
									listing.properties.country,
							]
								.filter( Boolean )
								.join( ' · ' ) }
						</span>
					</Button>
				) ) }
			</div>
			{ filteredListings.length > PAGE_SIZE && (
				<div className="vsge-mapbox-dealer-manager__pagination">
					<Button
						variant="secondary"
						disabled={ page === 1 }
						onClick={ () => setPage( page - 1 ) }
					>
						{ __( 'Previous', 'vsge-mapbox-block' ) }
					</Button>
					<span>
						{ page } / { totalPages }
					</span>
					<Button
						variant="secondary"
						disabled={ page >= totalPages }
						onClick={ () => setPage( page + 1 ) }
					>
						{ __( 'Next', 'vsge-mapbox-block' ) }
					</Button>
				</div>
			) }
			{ selectedListing && (
				<DealerEditor
					listing={ selectedListing }
					tags={ options.tags }
					filters={ options.filters }
					icons={ options.icons }
					pendingCoordinates={ pendingCoordinates }
					onSave={ ( updatedListing ) =>
						onListingsChange(
							updateListingById(
								options.listings,
								updatedListing
							)
						)
					}
					onDelete={ ( id ) => {
						onListingsChange(
							options.listings.filter(
								( listing ) => listing.id !== id
							)
						);
						selectDealer( null );
					} }
				/>
			) }
		</div>
	);
}
