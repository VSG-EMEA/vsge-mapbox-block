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
} ) => {
	if ( ! address ) return null;
	return (
		<p className={ className }>
			{ address ? address + <br /> : null }
			{ city } { country } { countryCode && `(${ countryCode })` }
		</p>
	);
};
