export const Website = ( {
	websiteUri,
	text,
	className,
}: {
	websiteUri?: string;
	text?: string;
	className?: string;
} ) => {
	if ( ! websiteUri ) return null;
	return (
		<p className={ className }>
			<a href={ '//' + websiteUri }>{ text }</a>
		</p>
	);
};
