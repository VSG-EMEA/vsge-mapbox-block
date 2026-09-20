/**
 * Normalizes and validates external website URLs for dealer links.
 *
 * Supported formats:
 * - bare domain: "example.com" -> "https://example.com/"
 * - with subdomains/paths/query/hash: "www.example.com/path?foo=bar#section"
 * - explicit https: "https://example.com/path" -> "https://example.com/path"
 * - explicit http: "http://example.com" -> "http://example.com/"
 * - protocol-relative: "//example.com" -> "https://example.com/"
 *
 * Unsafe or invalid inputs (javascript:, data:, file:, whitespace, malformed strings)
 * return null.
 *
 * @param url Raw input URL string.
 * @return Normalized HTTP(S) URL string, or null if invalid/unsupported.
 */
export function normalizeExternalUrl( url?: string | null ): string | null {
	if ( ! url || typeof url !== 'string' ) {
		return null;
	}

	const trimmed = url.trim();
	if ( ! trimmed ) {
		return null;
	}

	// Explicitly reject dangerous or non-web schemes before any processing
	if ( /^(javascript|data|file|vbscript|blob|about):/i.test( trimmed ) ) {
		return null;
	}

	let candidate = trimmed;
	if ( candidate.startsWith( '//' ) ) {
		candidate = 'https:' + candidate;
	} else if ( ! /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test( candidate ) ) {
		// If there is an unsupported scheme (e.g. "ftp://", "mailto:"), reject
		if ( /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test( candidate ) ) {
			return null;
		}
		// No scheme present: prepend https://
		candidate = 'https://' + candidate;
	}

	try {
		const parsed = new URL( candidate );
		if ( parsed.protocol !== 'https:' && parsed.protocol !== 'http:' ) {
			return null;
		}

		// Ensure there is a valid non-empty hostname with at least a dot or localhost
		const hostname = parsed.hostname;
		if (
			! hostname ||
			( ! hostname.includes( '.' ) && hostname !== 'localhost' )
		) {
			return null;
		}

		return parsed.href;
	} catch {
		return null;
	}
}
