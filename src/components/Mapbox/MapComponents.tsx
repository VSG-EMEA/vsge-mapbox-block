export const ListingTag = ( props ) => {
	const { tag, value } = props;
	return (
		<span className={ value } title={ value }>
			{ tag }
		</span>
	);
};
