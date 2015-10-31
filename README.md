# Aero

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/blitzprog/aero)
[![Build Status](https://travis-ci.org/blitzprog/aero.svg?branch=master)](https://travis-ci.org/blitzprog/aero)
[![Coverage Status](https://coveralls.io/repos/blitzprog/aero/badge.svg?branch=master&service=github)](https://coveralls.io/github/blitzprog/aero?branch=master)
[![Dependencies](https://david-dm.org/blitzprog/aero.svg)](https://david-dm.org/blitzprog/aero)

Aero is the fastest web framework on the node platform. It is based on [Jade](http://jade-lang.com/) and [Stylus](https://learnboost.github.io/stylus/). The goals are:

* [Performance](#performance)
* [Productivity](#productivity)
* [Simplicity](#simplicity)

## Performance

Aero is optimized for website loading speed and content delivery performance.

Thanks to automatic optimizations a [Page Speed rank of 100 / 100](https://developers.google.com/speed/pagespeed/insights/?url=blitzprog.org) is easily possible.

### Inlining

Aero inlines resources like style sheets and scripts for the initial request and never loads them again if the `kaze` plugin is used.

### Minification

The following resources are automatically minified:

* Markup (HTML)
* Styles (CSS)
* Scripts (JS)

When you save a source file in your editor the minified version will be recompiled and your browser refreshes the page.

### HTTP/2

Aero comes with HTTP/2 support included. In order to use HTTP/2 you need an SSL certificate.

In the future we will automatically push resources like scripts and styles to the client via the new push method as an alternative to traditional inlining. Note that pushing is not included in Aero yet.

### AJAX

If you use the included `kaze` plugin your website will be ajaxified. Permalinks will still work nicely with search engines, therefore ensuring the best possible experience for both humans and search engines. This is possible due to the HTML 5 History API. A full page reload is no longer needed, therefore improving the rendering speed which is  especially noticeable on mobile browsers.

## Productivity

### No restarts
Controllers, templates, styles and configuration files are recompiled whenever you save them in your editor. Your changes are instantly visible. Routes are dynamic and you never really need to restart Aero.

### Live reload
You don't need to press the refresh button in your browser anymore because when you save the file in your editor all of your browser tabs using that page will be automagically reloaded. This requires **no plugins** and works in **all browsers** as long as they support HTML 5.

## Simplicity

> Write programs that do one thing and do it well.

Aero is very lightweight and doesn't include any database drivers.
It is a very high-level framework, you can decide what you're going to use under the hood. At the time of writing this Aero doesn't allow you to use alternatives to Jade and Stylus but this will be changed in a future release.

## Hello World

Create a file called `index.js`:

```node
'use strict'

let aero = require('aero')
aero.run()
```

Install Aero:

```bash
npm install aero
```

Run it:

```bash
node .
```

Visit [http://localhost:4000/](http://localhost:4000/) in your browser.

## Pages

Aero page components are *grouped by feature, not by file type* like most VC frameworks. For example the `helloworld` page can contain

* `helloworld.jade`
* `helloworld.styl`
* `helloworld.json`
* `helloworld.js`

in the same directory.

For a page to be recognized by Aero it needs a `.jade` template or a `.js` controller.

* If you want a static page then a `.jade` template is all you need.
* If you want a dynamic page with full control over the output a `.js` controller is enough.
* If you want a dynamic page in combination with a template then you need to include both `.js` and `.jade`.

Adding a `.styl` file to the page will load the style sheet on this page only.

Adding a `.json` file will add all its data to your `.jade` template automatically.

## Play around

Try to change the `helloworld.jade` inside your `pages/helloworld` directory. Aero notices the changes, recompiles the page and forces your browser to reload it automatically.

## Documentation

Please do not use Aero in production yet, it is still in active development.

Documentation will be available once the Aero API is stable.

## Benchmarks

> TODO

## Similar software

Aero includes both a framework for building websites and an optimized web server.

Similar projects:

* [Express](http://expressjs.com/)
* [Restify](http://mcavage.me/node-restify/)
* [Koa](http://koajs.com/)
* [Keystone](http://keystonejs.com/)

## Websites using Aero

* [blitzprog.org](http://blitzprog.org) ([view source](https://github.com/blitzprog/blitzprog.org))
* [my.nihongo-center.com](http://my.nihongo-center.com) ([view source](https://github.com/blitzprog/nihongo-center.com))
* [increasedvoices.com](http://increasedvoices.com) ([view source](https://github.com/blitzprog/increasedvoices.com))
* [animereleasenotifier.com](https://animereleasenotifier.com) ([view source](https://github.com/blitzprog/animereleasenotifier.com))