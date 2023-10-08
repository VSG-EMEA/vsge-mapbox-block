import { TagArray } from '../../types';

/**
 * This is a TypeScript React component that renders a tag item with a specific ID and value.
 *
 * @param props       - props is an object that contains a single property called "tag". This property is of
 *                    type MapFilter.
 * @param props.tag
 * @param props.key
 * @param props.index
 * @return The `TagItem` component is being returned, which renders a `span` element with a class name
 * based on the `id` of the `MapFilter` object passed as a prop, and displays the `value` of the
 * `MapFilter` object as its content.
 */
export const TagItem = ( props: { index: number; tag: string } ) => {
	return (
		<span className={ 'tag-' + String( props.index ) } title={ props.tag }>
			{ props.tag }
		</span>
	);
};

/* This code exports a React functional component called `TagList` that takes in an object `props` with
a property `tags` that is an array of `MapFilter` objects or `undefined`. The component returns a
JSX element that maps over the `tags` array (if it exists) and renders a `TagItem` component for
each `MapFilter` object in the array. The `key` prop is set to the `index` of each item in the
array. The `TagList` component is exported so it can be used in other parts of the codebase. */
export function TagList( props: {
	tags: TagArray[] | undefined;
	className?: string;
} ): JSX.Element | null {
	const { tags, className } = props;
	return tags?.length ? (
		<span className={ className ?? 'tag-list' }>
			{ tags?.map( ( tag, index: number ) => (
				<TagItem tag={ tag } key={ index } index={ index } />
			) ) }
		</span>
	) : null;
}

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
function DataList( props: {
	className: string;
	dataset: { [ key: string ]: string | number }[];
} ) {
	return (
		<div className={ props.className }>
			{ extractTextFromGeocoderResults( props.dataset ) }
		</div>
	);
}
