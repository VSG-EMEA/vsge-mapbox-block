import { Button, SelectControl, TextControl } from '@wordpress/components';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import type { PointerEvent } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import classNames from 'classnames';
import { defaultColors, defaultMarkerSize } from '../Marker/defaults';
import {
	getNextId,
	reorderListingsById,
	searchListings,
	updateListingById,
} from '../../utils/dataset';
import { dragHandle, Icon } from '@wordpress/icons';
import type {
	CoordinatesDef,
	MapBoxListing,
	MapboxOptions,
	MarkerProps,
} from '../../types';
import { DealerEditor } from './DealerEditor';

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
			name: sprintf(
				/* translators: %s: dealer ID */
				__( 'New dealer %s', 'vsge-mapbox-block' ),
				String( id )
			),
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
	const [ draggedDealerId, setDraggedDealerId ] = useState< number | null >(
		null
	);
	const [ dragOverDealerId, setDragOverDealerId ] = useState< number | null >(
		null
	);
	const listRef = useRef< HTMLDivElement >( null );
	const draggedSourceIdRef = useRef< number | null >( null );

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
	const selectedListing = options.listings.find(
		( listing ) => listing.id === activeSelectedId
	);

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

	function handleReorderDealer( sourceId: number, targetId: number ) {
		onListingsChange(
			reorderListingsById( options.listings, sourceId, targetId )
		);
	}

	function getDealerIdFromPoint(
		clientX: number,
		clientY: number
	): number | null {
		if ( ! listRef.current ) {
			return null;
		}
		const doc = listRef.current.ownerDocument;
		const targetEl = doc.elementFromPoint( clientX, clientY );
		if ( ! targetEl ) {
			return null;
		}
		const rowEl = targetEl.closest( '[data-dealer-id]' );
		if ( ! rowEl || ! listRef.current.contains( rowEl ) ) {
			return null;
		}
		const dealerIdAttr = rowEl.getAttribute( 'data-dealer-id' );
		if ( ! dealerIdAttr ) {
			return null;
		}
		const parsedId = Number( dealerIdAttr );
		return isNaN( parsedId ) ? null : parsedId;
	}

	function handlePointerDown(
		e: PointerEvent< HTMLSpanElement >,
		dealerId: number
	) {
		if ( e.button !== 0 ) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		draggedSourceIdRef.current = dealerId;
		setDraggedDealerId( dealerId );
		setDragOverDealerId( dealerId );
		try {
			e.currentTarget.setPointerCapture( e.pointerId );
		} catch {
			// Ignore potential pointer capture error
		}
	}

	function handlePointerMove( e: PointerEvent< HTMLSpanElement > ) {
		if ( draggedSourceIdRef.current === null ) {
			return;
		}
		e.stopPropagation();
		const targetId = getDealerIdFromPoint( e.clientX, e.clientY );
		if ( targetId !== null && targetId !== dragOverDealerId ) {
			setDragOverDealerId( targetId );
		}
	}

	function handlePointerUp( e: PointerEvent< HTMLSpanElement > ) {
		const sourceId = draggedSourceIdRef.current;
		if ( sourceId !== null ) {
			e.stopPropagation();
			const targetId = getDealerIdFromPoint( e.clientX, e.clientY );
			if ( targetId !== null && sourceId !== targetId ) {
				handleReorderDealer( sourceId, targetId );
			}
		}
		if ( e.currentTarget.hasPointerCapture( e.pointerId ) ) {
			try {
				e.currentTarget.releasePointerCapture( e.pointerId );
			} catch {
				// Ignore capture release error
			}
		}
		draggedSourceIdRef.current = null;
		setDraggedDealerId( null );
		setDragOverDealerId( null );
	}

	function handlePointerCancel( e: PointerEvent< HTMLSpanElement > ) {
		e.stopPropagation();
		if ( e.currentTarget.hasPointerCapture( e.pointerId ) ) {
			try {
				e.currentTarget.releasePointerCapture( e.pointerId );
			} catch {
				// Ignore capture release error
			}
		}
		draggedSourceIdRef.current = null;
		setDraggedDealerId( null );
		setDragOverDealerId( null );
	}

	return (
		<div className="vsge-mapbox-dealer-manager">
			{ selectedListing ? (
				<div className="vsge-mapbox-dealer-manager__edit-pane">
					<div className="vsge-mapbox-dealer-manager__back-bar">
						<Button
							variant="tertiary"
							className="vsge-mapbox-dealer-manager__back-button"
							onClick={ () => selectDealer( null ) }
						>
							{ __( '← Back to dealers', 'vsge-mapbox-block' ) }
						</Button>
					</div>
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
				</div>
			) : (
				<div className="vsge-mapbox-dealer-manager__list-pane">
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
								label: __(
									'All countries',
									'vsge-mapbox-block'
								),
							},
							...countries.map( ( value ) => ( {
								value,
								label: value,
							} ) ),
						] }
						onChange={ setCountry }
					/>
					<div
						ref={ listRef }
						className="vsge-mapbox-dealer-manager__list"
						aria-label={ __( 'Dealers', 'vsge-mapbox-block' ) }
					>
						{ filteredListings.map( ( listing ) => (
							<div
								key={ listing.id }
								data-dealer-id={ listing.id }
								className={ classNames(
									'vsge-mapbox-dealer-manager__item',
									{
										'is-dragged':
											draggedDealerId === listing.id,
										'is-drag-over':
											dragOverDealerId === listing.id,
									}
								) }
							>
								<span
									role="button"
									tabIndex={ 0 }
									className="vsge-mapbox-dealer-manager__drag-handle"
									title={ __(
										'Drag to reorder',
										'vsge-mapbox-block'
									) }
									aria-label={ __(
										'Drag to reorder',
										'vsge-mapbox-block'
									) }
									onClick={ ( e ) => e.stopPropagation() }
									onKeyDown={ ( e ) => {
										if (
											e.key === 'Enter' ||
											e.key === ' '
										) {
											e.preventDefault();
										}
									} }
									onPointerDown={ ( e ) =>
										handlePointerDown( e, listing.id )
									}
									onPointerMove={ handlePointerMove }
									onPointerUp={ handlePointerUp }
									onPointerCancel={ handlePointerCancel }
								>
									<Icon icon={ dragHandle } size={ 18 } />
								</span>
								<Button
									variant={
										listing.id === activeSelectedId
											? 'primary'
											: 'secondary'
									}
									className="vsge-mapbox-dealer-manager__row"
									role="button"
									aria-pressed={
										listing.id === activeSelectedId
									}
									onClick={ () => selectDealer( listing.id ) }
								>
									<strong className="vsge-mapbox-dealer-manager__name">
										{ listing.properties.name ||
											__(
												'Unnamed dealer',
												'vsge-mapbox-block'
											) }
									</strong>
									<span className="vsge-mapbox-dealer-manager__location">
										{ [
											listing.properties.city,
											listing.properties.countryCode ||
												listing.properties.country,
										]
											.filter( Boolean )
											.join( ' · ' ) }
									</span>
								</Button>
							</div>
						) ) }
					</div>
				</div>
			) }
		</div>
	);
}
