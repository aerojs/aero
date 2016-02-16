# Configuration

Aero requires a `config.json` file in your root directory.

```json
{
	"title": "My Awesome Site!"
}
```

Your configuration is incremental. This means you only need to include the settings that you changed. The settings that have not been specified will be loaded from the [default configuration](https://github.com/aerojs/aero/blob/master/default/config.js).

## Members

### config.title

Your public website title. Usually used in layout files and in the [manifest](Manifest.md).

```json
{
	"title": "My Awesome Site!"
}
```

### config.fonts

A list of [Google Fonts](https://www.google.com/fonts). You can also add `:bold` and `:italic` to load additional variants of the font.

```json
{
	"fonts": [
		"Open Sans",
		"Open Sans:bold"
	]
}
```

### config.icons

A list of relative paths to icons you would like to use for your [manifest](Manifest.md). In the future this list will also be used to select your favicon.

```json
{
	"icons": [
		"images/icons/small.png",
		"images/icons/medium.png",
		"images/icons/large.png"
	]
}
```

### config.languages

A list of language codes for your website. The first entry is your main language and is also used in the [manifest](Manifest.md).

```json
{
	"languages": [
		"en",
		"ja",
		"de"
	]
}
```