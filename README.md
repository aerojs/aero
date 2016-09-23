# Aero

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Linux Build Status][travis-image]][travis-url]
[![windows Build Status][appveyor-image]][appveyor-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Dependencies][dependencies-image]][dependencies-url]

Aero is the fastest web framework on the node platform. It makes web development efficient and easy.

[![Aero vs. Express vs. Koa vs. Restify vs. Node](docs/images/benchmark.png "Shows requests per second. More is better. Tested with node 6.5.0 on ApacheBench.")](https://github.com/blitzprog/webserver-benchmarks)

## Installation

```bash
echo "require('aero')().run()" > index.js && npm i aero --production && node .
```

[![Aero Installation & Live Reload](docs/images/aero-installation.png)](https://youtu.be/rcyO3C_cRB4)

Visit [http://localhost:4000/](http://localhost:4000/) in your browser.

## Features

* Optimized for high latency environments
* Extremely fast router
* Instantly see changes while developing
* ES 6 support for client scripts
* HTML 5 linter runs after every change
* Follows DRY like it's the bible
* Can update your live server on every git commit
* Similar to: [Harp](http://harpjs.com/), [Express](http://expressjs.com/), [Koa](http://koajs.com/), [Restify](http://mcavage.me/node-restify/), [Hapi](http://hapijs.com/)
* Has all the good stuff: HTTP/2, IPv6, Web Manifest

## Colored

![Windows output (cmder)](docs/images/colored-windows.png)

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
* [Startup](docs/Startup.md)
* [Parameters](docs/Parameters.md)
* [Events](docs/Events.md)
* [HTTP/2](docs/HTTP2.md)
* [Web Manifest](docs/Manifest.md)
* [API](docs/API.md)

## Examples

URL                                                                | Source | Size | Speed
------------------------------------------------------------------ | ------ | ---------
[blitzprog.org](https://blitzprog.org)                             | [view source](https://github.com/blitzprog/blitzprog.org)                 | 12 KB | [100 / 100](https://developers.google.com/speed/pagespeed/insights/?url=https://blitzprog.org&tab=desktop)
[notify.moe](https://notify.moe)                                   | [view source](https://github.com/animenotifier/notify.moe)                | 15 KB | [100 / 100](https://developers.google.com/speed/pagespeed/insights/?url=https://notify.moe&tab=desktop)
[nihongo-center.com](https://nihongo-center.com)                   | [view source](https://github.com/nihongocenter/nihongo-center.com)        | 13 KB | [99 / 100](https://developers.google.com/speed/pagespeed/insights/?url=https://nihongo-center.com&tab=desktop)
[increasedvoices.com](http://increasedvoices.com)                  | [view source](https://github.com/mysticalnight/increasedvoices.com)       |  5 KB | [98 / 100](https://developers.google.com/speed/pagespeed/insights/?url=http://increasedvoices.com&tab=desktop)

**Size**: Includes **HTML**, **CSS** and **JS** of the frontpage. Excludes external videos and images.  
**Speed**: Measured by **Google PageSpeed**. Does not represent real-world loading speed.

---

[![By Eduard Urbach](http://forthebadge.com/images/badges/built-with-love.svg)](https://github.com/blitzprog)

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
