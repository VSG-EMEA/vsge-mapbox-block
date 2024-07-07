import { regions } from 'iso3166-helper/lib/data/regions';
import { __ } from '@wordpress/i18n';

/**
 * Formats the address based on the provided street, city, state, zip code, country, and country code.
 *
 * @param {string} street - The street of the address.
 * @param {string} city - The city of the address.
 * @param {string} zipCode - The zip code of the address.
 * @param {string=} country - The country of the address (optional).
 * @param {string=} countryCode - The country code of the address (optional).
 * @return {string} The formatted address based on the input parameters.
 */
function formatAddress(
	street: string,
	city: string,
	zipCode: string,
	country: string,
	countryCode?: string
): string {
	let formattedAddress = '';

	// Add street
	if ( street ) {
		formattedAddress += street;
	}

	// Add city, state/region, and zip code
	let secondLine = [ city, zipCode ].filter( Boolean ).join( ', ' );
	if ( secondLine ) {
		if ( formattedAddress ) formattedAddress += '\n';
		formattedAddress += secondLine;
	}

	// Add country and country code
	if ( country ) {
		if ( formattedAddress ) formattedAddress += '\n';
		formattedAddress += country;
		if ( countryCode ) {
			formattedAddress += ` (${ countryCode })`;
		}
	}

	return formattedAddress;
}

/**
 * Renders an address line with optional country code and custom class name.
 *
 * @param {object} props             - The props object
 * @return {JSX.Element | null} The rendered address line or null if no address, city, or country is provided.
 */
export const AddressLine = ( props: {
	label?: string;
	address?: string;
	country?: string;
	city?: string;
	countryCode?: string;
	postalCode?: string;
	className?: string;
} ): JSX.Element | null => {
	const {
		label = '',
		address = '',
		country = '',
		city = '',
		countryCode = '',
		postalCode = '',
		className = 'address-line',
	} = props;

	const formattedAddress = formatAddress(
		address,
		city,
		postalCode,
		country,
		countryCode
	);

	if ( ! formattedAddress ) {
		return null;
	}

	return (
		<p className={ `mbb-address ${ className }` }>
			<b>{ label } </b>
			{ formattedAddress }
		</p>
	);
};
