/**
 * Creates a link to the specified website URI with the given text and optional class name.
 *
 * @param {string} websiteUri - The URI of the website to link to.
 * @param {string} text - The text to display for the link.
 * @param {string} className - An optional class name for styling the link.
 * @return {JSX.Element | null} The link element or null if the website URI is not provided.
 */
export const LinkTo = ( {
	websiteUri,
	text,
	className,
}: {
	websiteUri?: string;
	text?: string;
	className?: string;
} ): JSX.Element | null => {
	if ( ! websiteUri ) return null;
	return (
		<p className={ 'mbb-link ' + className }>
			<a href={ '//' + websiteUri }>{ text }</a>
		</p>
	);
};
