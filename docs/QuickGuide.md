# Aero in 30 seconds

Instead of routing `/hello` via code you simply create a `hello` directory inside `pages`.

A page can have a [template](Templates.md), [style sheet](Styles.md), a [controller](Controllers.md), a [client script](Scripts.md) and a JSON file:

* `hello/hello.jade`
* `hello/hello.styl`
* `hello/hello.js`
* `hello/hello.client.js`
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
app.get('/', (req, res) => res.end('Hello World'))
```