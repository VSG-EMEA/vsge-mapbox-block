export const EmailAddr = ( {
	emailAddress,
	label,
	className,
}: {
	emailAddress?: string;
	label?: string;
	className?: string;
} ) => {
	if ( ! emailAddress ) return null;
	return (
		<p className={ className }>
			{ label }: <a href={ 'mailto:' + emailAddress }>{ emailAddress }</a>
		</p>
	);
};
