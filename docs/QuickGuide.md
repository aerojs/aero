# Aero in 30 seconds

## Routing
Instead of routing `/hello` via code you simply create a `hello` directory inside `pages`.

## Pages
A page can have a [template](Templates.md), [style sheet](Styles.md), a [controller](Controllers.md), a [client script](Scripts.md) and a JSON file:

* `hello/hello.jade`
* `hello/hello.styl`
* `hello/hello.js`
* `hello/hello.client.js`
* `hello/hello.json`

## Controllers
A controller is just an object that defines `get` or `post` methods. Or whatever you need.

```js
exports.get = (request, response) => response.end('Hello')
```

To feed dynamic data from a controller to a template we pass it to `response.render`:

```js
response.render({
	message: 'You requested ' + request.url
})
```

In the template:
```jade
h1= message
```