/**
 * Renders a phone number with label as a link for calling.
 *
 * @param {object=} props           - The props object
 * @param {string}  props.phone     - The phone number to display
 * @param {string}  props.label     - The label for the phone number
 * @param {string}  props.className - Additional CSS class for styling
 * @return {JSX.Element | null} The JSX element for the phone number with label as a link, or null if phone is empty
 */
export const Phone = ( {
	phone,
	label,
	className,
}: {
	phone?: string;
	label?: string;
	className?: string;
} ): JSX.Element | null => {
	if ( ! phone ) {
		return null;
	}
	return (
		<p className={ 'mbb-phone ' + className }>
			{ label }: <a href={ 'tel:' + phone }>{ phone }</a>
		</p>
	);
};
