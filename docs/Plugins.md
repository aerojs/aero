# Plugins

## Using a plugin

Add the plugin you want to your `dependencies` in `package.json`, e.g. if you need the [aero-ajax](https://github.com/aerojs/aero-ajax) plugin:

```json
"dependencies": {
	"aero": "*",
	"aero-ajax": "*"
}
```

## Making your own plugin
A plugin is just an npm package with the name prefix `aero-` which defines a simple API. The following 3 methods can be used to define a plugin:

### As a function
```js
module.exports = app => console.log('My awesome plugin got loaded!')
```

### List of scripts
```js
exports.scripts = ['lib/jquery'] // lib/jquery.js
```

### List of styles
```js
exports.styles = ['html-reset'] // html-reset.styl
```

## Available plugins

Official plugins are hosted on the [Aero organization](https://github.com/aerojs) page.

## Highly recommended plugins

These plugins are a must-have for any modern site and they synergize well with Aero:

* [aero-reset](https://github.com/aerojs/aero-reset)
* [aero-ajax](https://github.com/aerojs/aero-ajax)

Including the ajax plugin will also change the behaviour of LiveReload to reload your pages via AJAX calls instead of a full browser reload.