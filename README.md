# Mapbox Gutenberg Block for WordPress

The Mapbox Gutenberg Block is a powerful WordPress block that allows you to easily integrate Mapbox maps into your content with extensive customization options. You can create interactive maps with features like custom markers, popups, filters, and more.

![image](https://github.com/VSG-EMEA/vsge-mapbox-block/assets/8550908/c315dbf8-81cf-4c48-98de-898bde9ee6ca)

## Features

- **Interactive Maps**: Display beautiful Mapbox maps on your WordPress site.
- **Custom Markers**: Add custom markers with icons and colors of your choice.
- **Popup Listings**: Clicking on a marker shows a popup with listing data.
- **Filtering**: Add custom tags and terms to each marker listing and filter the map items by those tags or terms.
- **Geocoder**: Easily locate places using the geocoding feature.
- **Camera Control**: Fine-tune camera settings, including Latitude, Longitude, Pitch, Bearing, Zoom, and more.
- **3D Rotation**: Rotate the map for a 3D perspective.
- **Zoom Control**: Zoom in and out with the mouse wheel.
- **Map Styles**: Choose from various map styles.
- **Map Projection**: Select the projection type.
- **Map Height**: Customize the height of the map.
- **Non blocking plugin load**: This block takes advantage of webpack's dynamic loading to minimise the impact of mapbox plugin loading times on the pages of your site

## Installation

1. Clone or download this repository.
2. Upload the plugin folder to the `wp-content/plugins/` directory of your WordPress site.
3. `npm install` and `npm build` the plugin
4. Activate the plugin from the WordPress admin panel.

## Usage

1. Create or edit a post or page in the WordPress block editor.
2. Add a new block and search for "Mapbox Map" or similar.
3. Configure the map settings, including markers, filters, camera settings, and more.
4. Publish or update your post/page to display the interactive map.

## Obtaining a Mapbox Token

To use Mapbox GL in your project, you'll need a Mapbox Token. Mapbox offers a pay-as-you-go plan that allows you to use Mapbox for free up to a certain limit (please refer to the price page of mapbox).

Here's how to get your Mapbox Token:

1. Create a Mapbox Account: If you don't already have one, you can create a free Mapbox account by visiting Mapbox Account Creation Page. Sign up and log in [here](https://account.mapbox.com/auth/signup/).
2. Access Token Management: After logging in, you'll be directed to your Mapbox Account Landing Page. Here, you'll find options for managing your Mapbox tokens.
3. Create a New Token or Use Default Public Token: You can either create a new token by following the on-screen instructions or use your Default Public Token. Remember to keep your token safe and confidential.

## Configuration

You can configure the Mapbox Gutenberg Block via the block settings panel in the WordPress block editor. Customize the map's appearance, add markers, set camera settings, and manage filters from within the block.

## Dev (wp-env)

You can use wp-env to develop with mapbox-block, all you have to do is create a .wp-env file and add this (remember to add your key)
```
{
  "plugins": ["."],
  "core": null,
  "config": {
    "MAPBOX_TOKEN": "MYKEY-MYKEY1MYKEY2MYKEY3MYKEY4MYKEY5MYKEY6"
  }
}
```

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- This Gutenberg block is powered by Mapbox, an amazing mapping platform.
- Special thanks to the WordPress community for their support and contributions.

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

# Screenshots
![image](https://github.com/VSG-EMEA/vsge-mapbox-block/assets/8550908/57c6dda4-5aae-498c-b0dd-79e8a272df39)
![image](https://github.com/VSG-EMEA/vsge-mapbox-block/assets/8550908/bf279618-850e-4aa7-b4c5-846d6a0fcbd3)


## Support

If you have any questions or need assistance, please open an issue in this repository, and we'll be happy to help.


