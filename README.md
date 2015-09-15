# Aero

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/freezingwind/aero)
[![Build Status](https://travis-ci.org/freezingwind/aero.svg?branch=master)](https://travis-ci.org/freezingwind/aero)
[![Coverage Status](https://coveralls.io/repos/freezingwind/aero/badge.svg)](https://coveralls.io/r/freezingwind/aero)
[![Dependencies](https://david-dm.org/freezingwind/aero.svg)](https://david-dm.org/freezingwind/aero)

Aero is the fastest web framework on the node platform. It is based on [Jade](http://jade-lang.com/) and [Stylus](https://learnboost.github.io/stylus/). The goals are:

* [Performance](#performance)
* [Productivity](#productivity)
* [Simplicity](#simplicity)

## Performance

Aero is optimized for website loading speed and content delivery performance.

* On HTTP 1 it inlines resources like CSS and JavaScript for the initial request and never loads them again.
* On HTTP 2 it pushes those resources to the client via the new push method.

A [Page Speed](https://developers.google.com/speed/pagespeed/insights/) rank of [100 / 100](https://developers.google.com/speed/pagespeed/insights/?url=blitzprog.org) is easily possible.

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
var aero = require("aero");
aero.run();
```

Install Aero:

```bash
npm install aero --save
```

Run it:

```bash
iojs --harmony index.js
```

Visit [http://localhost:4000/](http://localhost:4000/) in your browser.

## Pages

Aero page components are *grouped by feature, not by file type* like most VC frameworks. For example the `helloworld` page can contain a `helloworld.jade`, `helloworld.styl`, `helloworld.json` and a `helloworld.js` controller in the same directory.

Now try to change the `helloworld.jade` inside your `pages` directory. Aero notices the changes, recompiles the page and forces your browser to reload it automatically.

## Documentation

> Please do not use Aero in production yet, it is still in active development.
> Documentation will be available once the Aero API is stable.

## Similar software

Aero includes both a framework for building websites and a server. Other notable frameworks are:

* [Express](http://expressjs.com/)
* [Restify](http://mcavage.me/node-restify/)
* [Koa](http://koajs.com/)
* [Keystone](http://keystonejs.com/)

## Websites using Aero

* [blitzprog.org](http://blitzprog.org/) ([view source](https://github.com/blitzprog/blitzprog.org))
* [my.nihongo-center.com](http://my.nihongo-center.com/) ([view source](https://github.com/blitzprog/nihongo-center.com))