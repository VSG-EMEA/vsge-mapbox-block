import { MapFilter } from '../../types';

/**
 * This is a TypeScript React component that renders a tag item with a specific ID and value.
 *
 * @param props     - props is an object that contains a single property called "tag". This property is of
 *                  type MapFilter.
 * @param props.tag
 * @return The `TagItem` component is being returned, which renders a `span` element with a class name
 * based on the `id` of the `MapFilter` object passed as a prop, and displays the `value` of the
 * `MapFilter` object as its content.
 */
export const TagItem = ( props: { tag: MapFilter } ) => {
	const { id, value } = props.tag;
	return (
		<span className={ 'tag-' + id } title={ value }>
			{ value }
		</span>
	);
};

/* This code exports a React functional component called `TagList` that takes in an object `props` with
a property `tags` that is an array of `MapFilter` objects or `undefined`. The component returns a
JSX element that maps over the `tags` array (if it exists) and renders a `TagItem` component for
each `MapFilter` object in the array. The `key` prop is set to the `index` of each item in the
array. The `TagList` component is exported so it can be used in other parts of the codebase. */
export function TagList( props: {
	tags: MapFilter[] | undefined;
  className?: string
} ): JSX.Element | null {
	const { tags, className } = props;
	return (
		<span className={ className ?? 'tag-list' }>
			{ tags?.map( ( tag, index: number ) => (
				<TagItem tag={ tag } key={ index } />
			) ) }
		</span>
	);
}
