export const AddressLine = ( {
	address,
	country,
	city,
	countryCode,
	className,
}: {
	address?: string;
	country?: string;
	city?: string;
	countryCode?: string;
	label: string;
	className: string;
} ) => {
	if ( ! address ) return null;
	return (
		<p className={ className }>
			{ address }
			<br />
			{ city } { country } { countryCode && '(' + countryCode + ')' }
		</p>
	);
};
