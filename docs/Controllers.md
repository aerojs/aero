# Controllers

A controller is a module that exports an object with either a `get` or a `render` method. Here is an example for a controller which outputs "Hello World":

```js
exports.get = (request, response) => {
	response.end('Hello World')
}
```

The above controller works as a standalone (without any templates or other files required). Here's a controller that requires a `.pug` template inside the same directory when you use the `render` method of the response object:

```js
exports.get = (request, response) => {
	response.render({
		myJadeParameter: 'Hello World'
	})
}
```

Controllers are **not required** to serve a static page. Only add a controller if you have dynamic data that you need to use inside your template.

Other request handlers, e.g. `POST` and `DELETE`, can be added to the same controller:

```js
module.exports = {
	get: (request, response) => {
		response.end('get it')
	},

	post: (request, response) => {
		response.end('post it')
	},

	delete: (request, response) => { // DRAFT: Not supported yet
		response.end('delete it')
	}
}
```

## Async controllers

If a controller method is defined as a `function*` generator it will be automatically converted to a coroutine.

### Yield promises

Define `get` to wait for a single async request to finish (Promise):

```js
exports.get = function*(request, response) {
	let users = yield database.getAll('Users')

	response.render({
		users
	})
}
```

### Yield arrays

Wait for multiple parallel async requests to finish:

```js
exports.get = function*(request, response) {
	yield [
		database.set('Key 1', 'Data 1'),
		database.set('Key 2', 'Data 2'),
		database.set('Key 3', 'Data 3')
	]

	response.end('Finished')
}
```

### Yield objects

Wait for multiple parallel async requests to finish:

```js
exports.get = function*(request, response) {
	let data = yield {
		key1: database.get('Key 1'),
		key2: database.get('Key 2'),
		key3: database.get('Key 3')
	}

	response.render(data)
}
```

### Async / Await

Not available yet. Will be added once node.js officially supports it.