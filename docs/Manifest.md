# Web Manifest

Aero automatically generates a [web manifest](https://www.w3.org/TR/appmanifest/) on `/manifest.json` and includes a `link` tag on your website to reference it.

Web manifests allow you to narrow the gap between native and web applications. Some of the benefits on mobile devices are:

* You can specify how the website should be opened from the home screen:
	* Display mode (fullscreen, standalone, minimal-ui, browser)
	* Orientation (portrait, landscape)
* You get a beautiful splash screen while your website is loading.
* You can specify a different name and icon for your home screen shortcut.

## Configure

Aero apps use the following default configuration:

```js
{
	name: this.config.title,
	short_name: this.config.title,
	icons: this.icons,
	start_url: '/',
	display: 'standalone',
	lang: this.config.languages[0]
}
```

You can overwrite the default values and add new ones by specifying the `manifest` members in your `config.json`:

```json
"manifest": {
	"display": "fullscreen",
	"orientation": "landscape"
}
```