export const Phone = ( {
	phone,
	label,
	className,
}: {
	phone?: string;
	label?: string;
	className?: string;
} ) => {
	if ( ! phone ) {
		return null;
	}
	return (
		<p className={ className }>
			{ label }: <a href={ 'tel:' + phone }>{ phone }</a>
		</p>
	);
};
