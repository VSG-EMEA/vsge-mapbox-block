/* This is a functional component called `Map` that takes in two props: `attributes` and
`mapContainer`. It returns a JSX element that contains a `div` with class `map-topbar` and three
optional elements based on the values of `fitView`, `tagsEnabled`, and `filtersEnabled` properties
of the `attributes` object. It also contains a `div` with class `map` and a `ref` to the
`mapContainer` prop. The component is exported for use in other parts of the codebase. */
import { MountedMapsContextValue } from '../../types';
import { useMapboxContext } from './MapboxContext';

export function Map(): JSX.Element {
	const { mapRef }: MountedMapsContextValue = useMapboxContext();
	return <div className={ 'map' } ref={ mapRef } />;
}
