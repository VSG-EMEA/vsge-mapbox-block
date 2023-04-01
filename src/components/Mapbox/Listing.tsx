import React from 'react';

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
