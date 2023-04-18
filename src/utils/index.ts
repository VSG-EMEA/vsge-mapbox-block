export const getDefaults = () => {
	if ( mapboxBlockData )
		return {
			accessToken: mapboxBlockData.accessToken,
			siteurl: mapboxBlockData.siteurl,
			language: mapboxBlockData.language,
		};
};

export const getUserLanguage = () => {
	// @ts-ignore
	return navigator.language || navigator.userLanguage;
};

function safeSlug( string: string ) {
	return encodeURIComponent( string )
		.toLowerCase()
		.replace( /\.|%[0-9a-zA-Z]{2}/gi, '' );
}

export function getLinkType( linkType: string ) {
	if ( linkType === 'phone' ) {
		return 'tel:';
	} else if ( linkType === 'email' ) {
		return 'mailto:';
	}
	return '//';
}

// normalize string for comparator
export function normalize( string: string ) {
	if ( string ) {
		return string.trim().toLowerCase();
	}
	return '';
}
