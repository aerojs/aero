# API

## Creating an app
```js
let aero = require('aero')
let app = aero()
```

## Routing
```js
app.get('/hello', (request, response) => {
	response.end('Hello!')
})
```

## Regex routing
```js
app.get(/^\+(.*)$/, (request, response) => {
	response.end('Google+ style routing')
})
```

## Middleware
```js
app.use(function(request, response, next) {
	console.log(request.url)
	next()
})
```

## Async middleware

```js
app.use(function*(request, response, next) {
	let start = new Date
	yield next()
	let ms = new Date - start

	console.log(request.url, ms + ' ms')
})
```

Not supported yet.

## Multiple 'use' with one call
```js
app.use(
	session(options),
	passport.initialize(),
	passport.session()
)
```

## Ready

`app.run()` returns `app.ready` which is a promise that gets resolved when the server loaded all pages and started the server.

```js
app.run().then(() => {
    console.log('We are online!')
})
```

```js
app.ready.then(() => {
    console.log('We are online!')
})
```

## Redirect
```js
app.redirect('/index.html', '/')
```

## Pre-Routing
```js
app.rewrite((request, response) => {
	// Handle /+MyName requests as /user/MyName internally
	if(request.url.startsWith('/+')) {
		request.url = '/user/' + request.url.substring('/+'.length)
		return
	}

	// Also rewrite ajax routes for the aero-ajax plugin
	if(request.url.startsWith('/_/+')) {
		request.url = '/_/user/' + request.url.substring('/_/+'.length)
		return
	}
})
```

## Redirect domains
```js
app.rewrite((request, response) => {
	if(request.headers.host.indexOf('old-domain.com') !== -1) {
		response.redirect('https://new-domain.com' + request.url)

		// By returning true we stop the call chain.
		// Therefore routing will not happen.
		return true
	}
})
```

## Root directory

```js
app.root
```

## Accessing HTTP server

You can retrieve the http server object using:

```js
app.server.http
```

## Accessing all routes

```js
Object.keys(app.server.routes)     // ['GET', 'POST']
Object.keys(app.server.routes.GET) // ['', 'blog', 'contact']
```

## Response

### Send a JSON object or JSON string

```js
response.json({
	example: 'JSON data'
})
```

### Redirect to another URL

```js
response.redirect('https://google.com')
```

### Send a file

```js
response.sendFile('data.txt')
```

### Status code

```js
response.statusCode = 404
```

## Express compatibility

Aero aims to be as Express compatible as possible, however 100% API compatibility is not the goal.