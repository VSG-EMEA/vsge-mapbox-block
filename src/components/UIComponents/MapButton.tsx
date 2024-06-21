/**
 * Create a map button component.
 *
 * @param {Object}               props           - The props for the MapButton component
 * @param {() => JSX.Element}    props.icon      - The icon to display
 * @param {boolean}              props.hidden    - Whether the button should be hidden
 * @param {string}               props.className - The class name for the button
 * @param {() => void}           props.onClick   - The function to call when the button is clicked
 * @param {JSX.Element | string} props.children  - The children to display
 *
 * @return {JSX.Element} The map button component
 */
export const MapButton = ( props: {
	icon: () => JSX.Element;
	hidden?: boolean;
	className?: string;
	onClick: () => void;
	children: JSX.Element | string;
} ): JSX.Element => {
	const { icon, hidden, className, onClick, children } = props;

	return (
		<button
			onClick={ onClick }
			className={ 'map-button ' + className }
			hidden={ hidden }
		>
			{ icon() }
			{ children }
		</button>
	);
};
