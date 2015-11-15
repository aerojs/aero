# Aero

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Linux Build Status][travis-image]][travis-url]
[![windows Build Status][appveyor-image]][appveyor-url]
[![Dependencies][dependencies-image]][dependencies-url]

Aero is the fastest web framework on the node platform. It is ~~database~~ file based and git friendly.

![Aero vs. Express vs. Koa vs. Restify vs. Node](docs/images/benchmark.png "Shows requests per second. More is better. Tested with node 5.0.0 on ApacheBench.")

## Installation

```bash
echo "require('aero').run()" > index.js && npm i aero --production && node .
```

Visit [http://localhost:4000/](http://localhost:4000/) in your browser.

[![Aero Installation & Live Reload](docs/images/aero-installation.png)](https://youtu.be/rcyO3C_cRB4)

![TL;DR](docs/images/tldr.png)

## Aero in 30 seconds

Instead of routing `/hello` via code you just create a `hello` directory inside `pages`.

A page can have a [template](#templates), [style sheet](#styles), a [controller](#controllers) and a JSON file:

* `hello/hello.jade`
* `hello/hello.styl`
* `hello/hello.js`
* `hello/hello.json`

A controller is just an object that defines `get` or `post` methods. Or whatever you need.

```js
exports.get = (request, response) => response.end('Hello')
```

To feed dynamic data from a controller to a template just pass it to `response.render`.

```js
response.render({ message: 'You requested ' + request.url })
```

```jade
h1= message
```

Static pages only require a template file, e.g. `hello.jade`.

REST API pages only require a controller, e.g. `hello.js`.

Aero is powered by its own blazingly fast web server which has [Express-like API](#express-like-api).

```js
aero.get('/', (req, res) => res.end('Hello World'))
```

## Configuration

Your configuration is stored in `config.json` and the data is incremental. This means you only need to include the settings that you changed.

This is a valid `config.json` file:

```json
{
	"siteName": "My Awesome Site!"
}
```

The settings that have not been specified will be loaded from the [default configuration](https://github.com/aerojs/aero/blob/master/default/config.js).

## Pages

Aero loads and watches the `pages` directory for changes. Instead of adding routes via code you just add a directory inside `pages`, e.g. `pages/home` which can then be tracked by git.

### Components

For a page to be loaded by Aero it needs a `.jade` template or a `.js` controller.

Page type                        | .jade | .js
-------------------------------- | ----- | ---
Static page                      | ✓    |
Dynamic page (full control, API) |       | ✓
Dynamic page (with template)     | ✓    | ✓

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

## Templates

Templates are written using [Jade](http://jade-lang.com/) syntax.

```jade
h1 Page title
p My page content.
```

## Styles

Style sheets are written in [Stylus](https://github.com/stylus/stylus) format using the `.styl` file extension inside the `styles` directory.

```stylus
body
	color white
	background-color black
```

Style loading order needs to be defined in your `config.json`. If you have 3 files called `first.styl`, `second.styl` and `third.styl`, specify the loading order in an array:

```json
"styles": [
	"first",
	"second",
	"third"
]
```

## Scripts

You can place browser scripts in the `scripts` directory.
These will be global and therefore available on every page.

The loading order for global scripts needs to be defined in your `config.json`. If you have 3 files called `first.js`, `second.js` and `third.js`, specify the loading order in an array:

```json
"scripts": [
	"first",
	"second",
	"third"
]
```

If you want to add a browser script to a single page only you should use a `.browser.js` file inside the page directory (warning: **experimental** feature, use at your own risk). If your page is called `home`, the file name should be `home.browser.js`.

## Controllers

A controller is a module that exports an object with either a `get` or a `render` method. Here is an example for a controller which outputs "Hello World":

```js
exports.get = function(request, response) {
	response.end('Hello World')
}
```

The above controller works as a standalone (without any templates or other files required). Here's a controller that requires a `.jade` template inside the same directory when you use the `render` method of the response object:

```js
exports.get = function(request, response) {
	response.render({
		myJadeParameter: 'Hello World'
	})
}
```

Controllers are **not required** to serve a static page. Only add a controller if you have dynamic data that you need to use inside your template.

Other request handlers, e.g. `POST` and `DELETE`, can be added to the same controller:

```js
module.exports = {
	get: function(request, response) {
		response.end('get it')
	},

	post: function(request, response) {
		response.end('post it')
	},

	delete: function(request, response) { // DRAFT: Not supported yet
		response.end('delete it')
	}
}
```

## Express-like API

### Routing
```js
aero.get('/hello', function(request, response) {
	response.end('Hello!')
})
```

### Regex routing
```js
aero.get(/^\+(.*)$/, function(request, response) {
	response.end('Google+ style routing')
})
```

### Middleware
```js
aero.use(function(request, response, next) {
	console.log(request.url) // Log every request
	next()                   // Continue the call chain
})
```

#### Passport.js works out-of-the-box
```js
aero.use(require('passport').initialize())
```

#### Multiple 'use' with one call
```js
aero.use(
	session(options),
	passport.initialize(),
	passport.session()
)
```

### Express compatibility

Aero aims to be as Express compatible as possible, however 100% API compatibility is not the goal.

### Events

```js
aero.on('server started', () => console.log('We are online!'))

aero.on('all pages loaded', () => console.log('We have all the page contents!'))
aero.on('all styles loaded', () => console.log('We have all the compiled styles!'))
aero.on('all scripts loaded', () => console.log('We have all the minified scripts!'))

aero.on('config loaded', () => console.log('Config loaded!'))
aero.on('page loaded', page => console.log(`Page ${page.id} has been loaded`))
aero.on('script loaded', script => console.log(`Script ${script.id} has been loaded`))
aero.on('style loaded', style => console.log(`Style ${style.id} has been loaded`))

aero.on('config modified', () => console.log('Config modified! Restarting Aero.'))
aero.on('page modified', pageId => console.log(`Page ${pageId} has been modified`))
aero.on('script modified', scriptId => console.log(`Script ${scriptId} has been modified`))
aero.on('style modified', styleId => console.log(`Style ${styleId} has been modified`))
```

## Colored output

![Windows output (cmder)](docs/images/colored-windows.png)

## Live reload

Templates, controllers, scripts, styles and JSON files are reloaded when you save them in your editor and cause an automatic browser refresh. There is no need to restart Aero when editing your project, therefore boosting your productivity.

## Valid HTML 5

All of your HTML and JSON output is automatically checked on every change.
HTML5 is linted via `html5-lint` which uses https://html5.validator.nu/.

## Written in ES 6

Aero uses the latest ES 6 features present in node 4.x and 5.x. However if performance turns out to be an issue, the ES 5 way should be prioritized in the code.

## Other

* [Goals](https://github.com/blitzprog/aero/blob/master/docs/goals.md)

## Similar software

Similar web servers:

* [Express](http://expressjs.com/)
* [Restify](http://mcavage.me/node-restify/)
* [Koa](http://koajs.com/)
* [Hapi](http://hapijs.com/)

More or less similar frameworks:

* [Sails](http://sailsjs.org/)
* [Keystone](http://keystonejs.com/)
* [Meteor](https://www.meteor.com/)
* [Total](https://www.totaljs.com/)

## Websites using Aero

URL                                                                | Source
------------------------------------------------------------------ | ------
[blitzprog.org](http://blitzprog.org)                              | [view source](https://github.com/blitzprog/blitzprog.org)
[my.nihongo-center.com](http://my.nihongo-center.com)              | [view source](https://github.com/blitzprog/nihongo-center.com)
[increasedvoices.com](http://increasedvoices.com)                  | [view source](https://github.com/blitzprog/increasedvoices.com)
[animereleasenotifier.com](https://animereleasenotifier.com)       | [view source](https://github.com/blitzprog/animereleasenotifier.com)

[npm-image]: https://img.shields.io/npm/v/aero.svg
[npm-url]: https://npmjs.org/package/aero
[travis-image]: https://img.shields.io/travis/aerojs/aero/master.svg?label=linux
[travis-url]: https://travis-ci.org/aerojs/aero
[appveyor-image]: https://img.shields.io/appveyor/ci/blitzprog/aero.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/blitzprog/aero
[coveralls-image]: https://img.shields.io/coveralls/aerojs/aero/master.svg
[coveralls-url]: https://coveralls.io/r/aerojs/aero?branch=master
[downloads-image]: https://img.shields.io/npm/dm/aero.svg
[downloads-url]: https://npmjs.org/package/aero
[dependencies-image]: https://david-dm.org/aerojs/aero.svg
[dependencies-url]: https://david-dm.org/aerojs/aero