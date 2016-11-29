# Configuration

Aero requires a `config.json` file in your root directory.

```json
{
	"title": "My Awesome Site!"
}
```

Your configuration is incremental. This means you only need to include the settings that you changed. The settings that have not been specified will be loaded from the [default configuration](https://github.com/aerojs/aero/blob/nodejs/default/config.js).

## Members

### title

Your public website title. Usually used in layout files and in the [manifest](Manifest.md).

```json
{
	"title": "My Awesome Site!"
}
```

### domain

The website domain you are using in production.

```json
{
	"domain": "example.com"
}
```

### fonts

A list of [Google Fonts](https://www.google.com/fonts). You can also add `:bold` and `:italic` to load additional variants of the font.

```json
{
	"fonts": [
		"Open Sans",
		"Open Sans:bold"
	]
}
```

### icons

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

### languages

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

### redirect

A map of routes that should be redirected to another route (permanently via 301 status code). This is especially useful for SEO to make outdated backlinks behave correctly.

```json
{
	"redirect": {
		"en/frontpage.html": "/",
		"weblog": "/blog"
	}
}
```

The target URL is directly used as a parameter for the HTTP redirect so it should always be prefixed by a `/`.

## Production vs. Development

Always set the environment variable `NODE_ENV` to `production` on your production systems as it will disable LiveReload and improve performance. You can do this by editing `/etc/environment` or adding the following line to your `.profile` or `.bashrc` file:

```bash
export NODE_ENV=production
```
