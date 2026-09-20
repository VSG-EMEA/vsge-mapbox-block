import { normalizeExternalUrl } from '../../utils/url';

/**
 * Creates a link to the specified website URI with the given text and optional class name.
 *
 * @param {Object}  props
 * @param {string}  props.websiteUri - The URI of the website to link to.
 * @param {string=} props.text       - The text to display for the link.
 * @param {string=} props.className  - An optional class name for styling the link.
 * @return {JSX.Element | null} The link element or null if the text is not provided.
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
	if ( ! text ) {
		return null;
	}

	const safeUrl = normalizeExternalUrl( websiteUri );

	return (
		<b className={ 'mbb-link ' + ( className || '' ) }>
			{ safeUrl ? (
				<a
					href={ safeUrl }
					title={ text }
					target="_blank"
					rel="noreferrer noopener"
				>
					{ text }
				</a>
			) : (
				text
			) }
		</b>
	);
};
