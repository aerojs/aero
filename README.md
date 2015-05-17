# Aero
Web framework based on [Node](https://nodejs.org/), [Express](http://expressjs.com/), [Jade](http://jade-lang.com/) and [Stylus](https://learnboost.github.io/stylus/). The goals are:

* Performance ([Page Speed](https://developers.google.com/speed/pagespeed/insights/) rank of **100 / 100**)
* Productivity
* Simplicity

## Performance

We care about __website loading speed__ and **web server performance**.
Usually websites generate a lot of HTTP requests, leading to very slow loading times in high latency environments. Aero inlines a lot of the resources in the initial request and never loads them again.

## Productivity

Aero uses a dependency graph to find the resources that need to be recompiled when something changes. Controllers, templates, styles and configuration files are automatically reloaded when you save them in your editor.

## Simplicity

> Write programs that do one thing and do it well.

Aero is very lightweight and doesn't include any database drivers.
It is a very high-level framework, you can decide what you're going to use under the hood.

## Usage

You can install aero via npm:

```bash
npm install aero --save
```

Load the module and start it:

```node
let aero = require("aero");
aero.run();
```

That's all you need for your index.js file. Run it using:

```bash
node index.js
```

## Hello World

Create your main file `index.js` if it doesn't exist yet:

```node
let aero = require("aero");
aero.run();
```

You can also specify a config file path by passing it to `aero.start(configFile)` which defaults to `config.json`.

Create a file called `config.json` in your root directory:

```json
{
	"siteName": "Hello World",
	"pages": [
		"helloworld"
	],
	"port": 4000
}
```

Add a main layout file `layout.jade` in your root directory:

```jade
doctype html
html
	head
		title= siteName
		style!= css

	body
		#content!= content
		script!= js
```

`siteName` is the title you set up in your config before. The variables `css`, `js` and `content` are set by Aero.

Install Aero:

```bash
npm install aero --save
```

Now run it using:

```bash
node index.js
```

This should automatically create the `pages/helloworld/helloworld.jade` file and start your server on port 4000. Navigate your browser to [http://localhost:4000/helloworld](http://localhost:4000/helloworld) to see the "helloworld" from your automatically created page rendered into your layout.

Aero page components are **grouped by feature**, not by file type like most MVC frameworks. For example the `helloworld` page can contain a `helloworld.jade`, `helloworld.styl`, `helloworld.json` and a `helloworld.js` file all in the same directory. We believe that grouping by feature eases the maintenance of any kind of project.

Now try to change the `helloworld.jade` inside your `pages` directory. Aero notices the changes and recompiles the file automatically.

## Documentation

You've barely scratched the surface of what Aero can do with the Hello World example.

	TODO: Tutorial

## Websites using Aero

* [blitzprog.org](http://blitzprog.org/) ([Source](https://github.com/blitzprog/blitzprog.org))

## Status

Aero is an ambitious project that is looking for contributors. It is currently in early alpha stage and if you're interested in creating a system that is tailored for performance and productivity, get in touch!