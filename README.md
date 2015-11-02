# Aero

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Dependencies][dependencies-image]][dependencies-url]

Aero is the fastest web framework on the node platform. It is ~~database~~ file based and git friendly.

![Aero vs. Express vs. Koa vs. Restify vs. Node](docs/benchmark.png "Shows requests per second. More is better. Tested with node 5.0.0 on ApacheBench.")

## Installation

```bash
echo "require('aero').run()" > index.js && npm install aero && node .
```

Visit [http://localhost:4000/](http://localhost:4000/) in your browser.

### Play around

Try to change the `home.jade` inside your `pages/home` directory. Aero notices the changes, recompiles the page and forces your browser to reload it automatically.

## Pages

Aero loads and watches the `pages` directory for changes. Instead of adding routes via code you just add a directory inside `pages`, e.g. `pages/home` which can then be tracked by git.

### Components

For a page to be loaded by Aero it needs a `.jade` template or a `.js` controller.

Page type                        | .jade | .js
-------------------------------- | ------|-----
Static page                      | ✓     |  
Dynamic page (full control, API) |       | ✓
Dynamic page (with template)     | ✓     | ✓

Adding a `.styl` file to the page will load the style sheet on this page only.

Adding a `.json` file will add all its data to your `.jade` template automatically.

For example the `helloworld` directory may contain:

* `helloworld.jade`
* `helloworld.styl`
* `helloworld.json`
* `helloworld.js`

### Subdirectories

Aero scans your pages directory recursively and therefore also adds routes for subpages automatically:

```
/api
/api/users
/api/users/uploads
```

### Change URL for a page

By default Aero will create a route based on the directory name. If you don't like the default behaviour you can overwrite the route with the `url` parameter in the `.json` file:

```json
{
	"url": "blog/categories"
}
```

For the frontpage you should use an empty string.

## Styles

Style sheets are written in Stylus format using the `.styl` file extension inside the `styles` directory.

Style loading order needs to be defined in your `config.json`. If you have 3 files called `first.styl`, `second.styl` and `third.styl`, specify the loading order in an array:

```json
{
	"styles": [
		"first",
		"second",
		"third"
	]
}
```

## Scripts

You can place browser scripts in the `scripts` directory.
These will be global and therefore available on every page.

If you want to add a browser script to a single page only you should use a `.browser.js` file inside the page directory (warning: **experimental** feature, use at your own risk). If your page is called `home`, the file name should be `home.browser.js`.

The loading order for global scripts needs to be defined in your `config.json`. If you have 3 files called `first.js`, `second.js` and `third.js`, specify the loading order in an array:

```json
{
	"scripts": [
		"first",
		"second",
		"third"
	]
}
```

## Controllers

A controller is a module that exports an object with either a `get` or a `render` method. Here is an example for a controller which outputs "Hello World":

```js
module.exports = {
	get: function(request, response) {
		response.end('Hello World')
	}
}
```

The above controller works as a standalone (without any templates or other files required). Here's a controller that requires a `.jade` template inside the same directory using the `render` method:

```js
module.exports = {
	render: function(request, render) {
		render({
			myJadeParameter: 'Hello World'
		})
	}
}
```

Controllers are **not required** to serve a static page. Only add a controller if you have dynamic data that you need to use inside your template.

## Live reload

Templates, controllers, scripts, styles and JSON files are reloaded when you save them in your editor and cause an automatic browser refresh. There is no need to restart Aero when editing your project, therefore boosting your productivity.

> **Note**: Aero currently does not support live reload for the main `config.json` file.
> This will be implemented in a future release.

## Express-like API

```js
aero.get('/hello', function(request, response) {
	response.end('Hello!')
})
```

```js
aero.use(function(request, response, next) {
	console.log(request.url) // Log every request
	next()
})
```

```js
aero.use(require('passport').initialize()) // passport.js works out-of-the-box
```

## Other

* [Goals](https://github.com/blitzprog/aero/blob/master/docs/goals.md)

## Similar software

Similar web servers:

* [Express](http://expressjs.com/)
* [Restify](http://mcavage.me/node-restify/)
* [Koa](http://koajs.com/)
* [Hapi](http://hapijs.com/)

Similar frameworks:

* [Sails](http://sailsjs.org/)
* [Keystone](http://keystonejs.com/)

## Websites using Aero

* [blitzprog.org](http://blitzprog.org) ([view source](https://github.com/blitzprog/blitzprog.org))
* [my.nihongo-center.com](http://my.nihongo-center.com) ([view source](https://github.com/blitzprog/nihongo-center.com))
* [increasedvoices.com](http://increasedvoices.com) ([view source](https://github.com/blitzprog/increasedvoices.com))
* [animereleasenotifier.com](https://animereleasenotifier.com) ([view source](https://github.com/blitzprog/animereleasenotifier.com))

[npm-image]: https://img.shields.io/npm/v/aero.svg
[npm-url]: https://npmjs.org/package/aero
[node-version-image]: https://img.shields.io/node/v/aero.svg
[node-version-url]: http://nodejs.org/download/
[travis-image]: https://img.shields.io/travis/blitzprog/aero/master.svg
[travis-url]: https://travis-ci.org/blitzprog/aero
[coveralls-image]: https://img.shields.io/coveralls/blitzprog/aero/master.svg
[coveralls-url]: https://coveralls.io/r/blitzprog/aero?branch=master
[downloads-image]: https://img.shields.io/npm/dm/aero.svg
[downloads-url]: https://npmjs.org/package/aero
[dependencies-image]: https://david-dm.org/blitzprog/aero.svg
[dependencies-url]: https://david-dm.org/blitzprog/aero