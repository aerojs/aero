# Aero

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Dependencies][dependencies-image]][dependencies-url]

<!--
[![Coverage Status][coveralls-image]][coveralls-url]
[![Linux Build Status][travis-image]][travis-url]
[![windows Build Status][appveyor-image]][appveyor-url]
-->

Aero is the fastest web framework on the node platform. It is git friendly and works with Express middleware.

[![Aero vs. Express vs. Koa vs. Restify vs. Node](docs/images/benchmark.png "Shows requests per second. More is better. Tested with node 5.6.0 on ApacheBench.")](https://github.com/blitzprog/webserver-benchmarks)

## Installation

```bash
echo "require('aero')().run()" > index.js && npm i aero --production && node --use_strict .
```

[![Aero Installation & Live Reload](docs/images/aero-installation.png)](https://youtu.be/rcyO3C_cRB4)

Visit [http://localhost:4000/](http://localhost:4000/) in your browser.

## Quick Guide

Read [Aero in 30 seconds](docs/QuickGuide.md).

## Documentation

* [Configuration](docs/Configuration.md)
* [Pages](docs/Pages.md)
* [Templates](docs/Templates.md)
* [Controllers](docs/Controllers.md)
* [Styles](docs/Styles.md)
* [Scripts](docs/Scripts.md)
* [Layouts](docs/Layouts.md)
* [Plugins](docs/Plugins.md)
* [Parameters](docs/Parameters.md)
* [HTTP/2](docs/HTTP2.md)
* [Web Manifest](docs/Manifest.md)
* [API](docs/API.md)

## Colored output

![Windows output (cmder)](docs/images/colored-windows.png)

## Live reload

Templates, controllers, scripts, styles and JSON files are reloaded when you save them in your editor and cause an automatic page refresh. There is no need to restart Aero when editing your project, therefore boosting your productivity.

## Ajaxification

If you like you can use the [aero-ajax](https://github.com/aerojs/aero-ajax) plugin to switch from a standard website to an AJAX-powered website with minimal effort.

## Modern ES

Aero code uses the latest ES features present in node 4.x and 5.x. Additionally your client scripts are transformed using Babel ES 2015 which enables you to utilize next-generation ES without worrying about browser compatibilities.

## GitHub hook

You can set up your GitHub project to call https://mydomain.com/git/pull if you want instant updates for your remote server on every `git push`.

## Valid HTML 5

All of your HTML and JSON output is automatically checked on every change.
HTML5 is linted via `html5-lint` which uses https://html5.validator.nu/.

## IPv6 support

Aero automatically handles both IPv4 and IPv6 requests.

## Similar frameworks

* [Harp](http://harpjs.com/)
* [Express](http://expressjs.com/)
* [Koa](http://koajs.com/)
* [Restify](http://mcavage.me/node-restify/)
* [Hapi](http://hapijs.com/)

## Websites using Aero

URL                                                                | Source | [PageSpeed](https://developers.google.com/speed/pagespeed/insights/)
------------------------------------------------------------------ | ------ | ---------
[blitzprog.org](https://blitzprog.org)                             | [view source](https://github.com/blitzprog/blitzprog.org)                 | 100/100
[notify.moe](https://notify.moe)                                   | [view source](https://github.com/animenotifier/notify.moe)                | 100/100
[nihongo-center.com](https://nihongo-center.com)                   | [view source](https://github.com/nihongocenter/nihongo-center.com)        | 100/100
[my.nihongo-center.com](http://my.nihongo-center.com)              | [view source](https://github.com/nihongocenter/my.nihongo-center.com)     | 98/100
[increasedvoices.com](http://increasedvoices.com)                  | [view source](https://github.com/mysticalnight/increasedvoices.com)       | 98/100

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