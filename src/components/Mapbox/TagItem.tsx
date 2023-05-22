import { MapFilter } from '../../types';

export const TagItem = ( props: { tag: MapFilter } ) => {
	const { id, value } = props.tag;
	return (
		<span className={ 'tag-' + id } title={ value }>
			{ value }
		</span>
	);
};

export function TagList( props: {
	tags: MapFilter[] | undefined;
} ): JSX.Element | null {
	const { tags } = props;
	return (
		<>
			{ tags?.map( ( tag, index: number ) => (
				<TagItem tag={ tag } key={ index } />
			) ) }
		</>
	);
}
