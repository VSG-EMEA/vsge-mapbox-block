import { __ } from '@wordpress/i18n';

/**
 * Renders an email address with an optional label and CSS class.
 *
 *
 * @param {object=} props              - The props object
 * @param {string=} props.emailAddress - The email address to be displayed
 * @param {string=} props.label        - The optional label for the email address
 * @param {string=} props.className    - The optional CSS class for styling
 * @return {JSX.Element|null} The paragraph element displaying the email address with optional label and link
 */
export const EmailAddr = ( {
	emailAddress,
	label,
	className,
}: {
	emailAddress?: string;
	label?: string;
	className?: string;
} ): JSX.Element | null => {
	if ( ! emailAddress ) {
		return null;
	}
	return (
		<p className={ 'mbb-email-address ' + className }>
			<b>{ label }: </b>
			<a
				href={ 'mailto:' + emailAddress }
				target={ '_blank' }
				title={ __( 'Email ', 'vsge-mapbox-block' ) + emailAddress }
				rel="noreferrer noopener"
			>
				{ emailAddress }
			</a>
		</p>
	);
};
