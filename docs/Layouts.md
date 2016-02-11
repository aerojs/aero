# Layout

Aero is designed to work with single-layout websites that can be easily ajaxified.
If you need multiple layouts you can create multiple Aero apps with different root directories in one node instance.

The default `layout.jade` is as simple as this:

```jade
doctype html
html
	head
		title= app.config.title

	body
		main#content!= content
```

You can add this file to your `layout` directory and Aero will instantly load the changes.

## Globals

In the example above `app` refers to the app instance and `app.config` refers to your `config.json` file. Therefore `app.config.title` returns the title defined in your [configuration](Configuration.md).

`content` is defined by Aero to insert the page contents. We're not using Jade blocks because they don't work well when you need to ajaxify your site.

The difference between Jade's `=` and `!=` is that the former escapes the string while the latter will just directly insert it. Since `content` includes the rendered HTML of the page you need to use `!=` for the page contents.

## Controller

Layout controllers are very similar to [page controllers](Controllers.md), the only difference is the function signature:

```js
exports.render = function(request, render) {
	render({
		custom: 'Hello World'
	})
}
```

It doesn't make sense to define `get` or `post` methods for layout controllers which is why the exported function needs to be have the generic name `render`. The `response` parameter is also dropped and replaced by a special `render` function as the 2nd parameter.

Layout components follow the same naming convention as pages. If your directory is called `layout` then it can include the following files:

* `layout.jade`
* `layout.styl`
* `layout.json`
* `layout.js`