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

## Redirect
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

## Express compatibility

Aero aims to be as Express compatible as possible, however 100% API compatibility is not the goal.