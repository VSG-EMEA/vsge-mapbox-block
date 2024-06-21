import { ChangeEvent } from 'react';

/**
 * A React component for a select control with options and onChange handler.
 *
 * @param {Object}                                  props
 * @param {string}                                  props.className - the class name for styling
 * @param {string}                                  props.value     - the selected value
 * @param {Array<{ label: string; value: string }>} props.options   - the list of options with label and value
 * @param {Function}                                props.onChange  - the handler for the change event
 * @return {JSX.Element} the select control with options
 */
export const MapSelectControl = ( props: {
	className: string;
	value: string;
	options: { label: string; value: string }[];
	onChange( event: ChangeEvent< HTMLSelectElement > ): void;
} ): JSX.Element => {
	const { className, value, options, onChange } = props;

	return (
		<select
			onChange={ onChange }
			value={ value }
			className={ 'components-select-control ' + className }
		>
			{ options.map( ( option ) => {
				return (
					<option key={ option.value } value={ option.value }>
						{ option.label }
					</option>
				);
			} ) }
		</select>
	);
};
