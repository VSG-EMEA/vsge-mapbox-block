import { TagArray } from '../../types';
import { safeSlug } from '../../utils';
import './style.scss';

/**
 * This is a TypeScript React component that renders a tag item with a specific ID and value.
 *
 * @param props            - props is an object that contains a single property called "tag". This property is of
 *                         type MapFilter.
 * @param props.key        - The `key` property is a number that represents the ID of the `MapFilter` object.
 * @param props.attributes - The `attributes` property is an object that contains a single property called "tag".
 * @param props.tag
 * @return The `TagItem` component is being returned, which renders a `span` element with a class name
 * based on the `id` of the `MapFilter` object passed as a prop, and displays the `value` of the
 * `MapFilter` object as its content.
 */
export const TagItem = ( props: { tag: string } ) => {
	return (
		<span
			className={ 'item item-' + safeSlug( props.tag ) }
			title={ props.tag }
		>
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
	tags: TagArray;
	className?: string;
} ): JSX.Element | null {
	const { tags, className } = props;
	return tags?.length ? (
		<span className={ className ?? 'tag-list' }>
			{ tags?.map( ( tag, index: number ) => (
				<TagItem tag={ tag } key={ index } />
			) ) }
		</span>
	) : null;
}
