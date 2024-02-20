/**
 * Renders an address line with optional country code and custom class name.
 *
 * @param {object=} props             - The props object
 * @param {string}  props.address     - The address to be displayed.
 * @param {string}  props.country     - The country name.
 * @param {string}  props.city        - The city name.
 * @param {string}  props.countryCode - The country code.
 * @param {string}  props.className   - The custom class name for styling.
 * @return {JSX.Element | null} The rendered address line or null if no address, city, or country is provided.
 */
export const AddressLine = ( {
	address = '',
	country = '',
	city = '',
	countryCode = '',
	className = 'address-line',
}: {
	address?: string;
	country?: string;
	city?: string;
	countryCode?: string;
	className?: string;
} ): JSX.Element | null => {
	if ( ! address && ! city && ! country ) return null;
	return (
		<p className={ 'mbb-address ' + className }>
			{ address ? address + <br /> : null }
			{ city } { country } { countryCode && `(${ countryCode })` }
		</p>
	);
};
