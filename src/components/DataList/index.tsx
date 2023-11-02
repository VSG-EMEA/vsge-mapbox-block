import './style.scss';

/**
 * Extracts text from geocoder results.
 *
 * @param {Object[]} results - An array of geocoder results.
 * @return {string} - The extracted text joined by commas.
 */
function extractTextFromGeocoderResults(
	results: {
		[ key: string ]: string | number;
	}[]
): string {
	const texts: string[] = [];

	for ( const item of results ) {
		if ( item.text ) {
			texts.push( item.text.toString() );
		}
	}

	return texts.join( ', ' );
}

/**
 * Renders a data list component. can be used to display a list of data from the geocoder results context
 *
 * @param {Object} props           - The props object containing the className and dataset.
 *                                 - className {string} - The class name of the component.
 *                                 - dataset {object[]} - An array of objects representing the dataset.
 * @param          props.className
 * @param          props.dataset
 * @return {JSX.Element} The rendered data list component.
 */
export function DataList( props: {
	className: string;
	dataset: { [ key: string ]: string | number }[];
} ) {
	return (
		<div className={ props.className }>
			{ extractTextFromGeocoderResults( props.dataset ) }
		</div>
	);
}
