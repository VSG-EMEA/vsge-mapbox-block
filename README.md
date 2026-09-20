# Mapbox Gutenberg Block for WordPress

A high-performance WordPress block for displaying interactive Mapbox maps and dealer locators in the block editor and frontend.

## Features

- **Interactive Maps**: Display high-performance Mapbox GL maps with customizable styles, projections, pitch, bearing, and zoom.
- **GPU-Accelerated Markers**: Dealers render via a single GeoJSON source and WebGL symbol layers with SDF icons, eliminating HTML DOM marker overhead.
- **Keyboard-Accessible Sidebar**: Dealer selection via native button controls, semantic `aria-current` state, non-color visual indicators, and symmetrical popup focus restoration.
- **Safe Link Normalization**: Dealer websites are safely validated and normalized to HTTPS/HTTP; malicious schemes (such as `javascript:`) are rejected.
- **Viewport-Aware Lazy Loading**: Below-the-fold maps defer heavy Mapbox runtime assets until approaching the viewport, preserving pre-hydration layout space.
- **Multi-Map Isolation**: Multiple map blocks on the same page operate with isolated state and lifecycle management.
- **Comprehensive Internationalization**: Standard WordPress gettext localization across PHP and JavaScript, with canonical ISO 639-1 locale normalization for Mapbox and Geocoder services.
- **Editor Canvas Realm Safety**: Mapbox runs in the Gutenberg editor canvas iframe realm without cross-realm DOM initialization errors.

## Requirements

- **WordPress**: 6.3 or higher (Block API v3 / iframe editor realm)
- **PHP**: 7.4 or higher (supported runtime minimum)

## Installation

1. Upload the plugin folder to the `wp-content/plugins/` directory of your WordPress site.
2. Activate the plugin from the WordPress **Plugins** admin screen.
3. Configure your Mapbox Access Token.

## Obtaining a Mapbox Access Token

To use Mapbox GL, you need a Mapbox Access Token:
1. Create a Mapbox account at [account.mapbox.com](https://account.mapbox.com/auth/signup/).
2. Obtain your default public access token or generate a scoped token.

## Configuration

Configure the public access token in **Settings → VSGE Mapbox**, or define the `MAPBOX_TOKEN` constant in `wp-config.php`:

```php
define( 'MAPBOX_TOKEN', 'pk.eyJ1Ijo...' );
```

The constant takes precedence over the database option.

## Development and Testing

```bash
# Build production runtime assets
npm run build

# Start development watcher
npm start

# Run unit tests
npm test

# Run end-to-end browser tests (Playwright)
npm run test:e2e

# Run linters and typechecks
npm run typecheck
npm run lint:js
npm run lint:css
npm run lint:pkg
```

## License

This plugin is licensed under the GNU General Public License v3.0 only (`GPL-3.0-only`).
See [LICENSE.md](LICENSE.md) for the full license text.

## Third-Party Software Notices

This plugin includes third-party software components subject to separate license terms. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for complete details.

> **Mapbox Terms Notice**: Mapbox GL JS 3.x is licensed under the Mapbox Web SDK terms and requires an active Mapbox account in accordance with Mapbox Terms of Service (https://www.mapbox.com/legal/tos/).
