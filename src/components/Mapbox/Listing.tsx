import React from 'react';

/**
 * This is a TypeScript React component that renders a listing based on the type of property passed in.
 *
 * @param {Object} Props
 * @param {Object} Props.properties The `Listing` function takes in an object with two properties: `properties` and `type`.
 * @param {Object} Props.type       properties` is of type `any` and is used to store the properties of a feature. `type` is also of
 *                                  type `any` and is used to determine if the feature is of
 * @return A React component that renders a listing of properties if the type is 'Feature', and
 * returns null otherwise. The listing includes the name, phone, and address of the property.
 */
export const Listing = ( {
	properties,
	type,
}: {
	properties: any;
	type: any;
} ) => {
	return type === 'Feature' ? (
		<div
			style={ {
				borderRadius: '2px',
				border: '1px solid #ccc',
				padding: '4px',
				margin: '2px 2px 8px',
			} }
		>
			<p>
				<b>{ properties.name }</b>
			</p>
			<p>{ properties.phone }</p>
			<p>{ properties.address }</p>
		</div>
	) : null;
};
