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
app.use(function*(request, response, next) {
	let start = new Date
	yield next()
	let ms = new Date - start

	console.log(request.url, ms + ' ms')
})
```

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

## Events

```js
app.on('server started', () => console.log('We are online!'))

app.on('all pages loaded', () => console.log('Got all the page contents!'))
app.on('all styles loaded', () => console.log('Got all the compiled styles!'))
app.on('all scripts loaded', () => console.log('Got all the minified scripts!'))
app.on('all fonts loaded', () => console.log('Downloaded all font definitions!'))

app.on('config loaded', () => console.log('config.json loaded!'))
app.on('package loaded', () => console.log('package.json loaded!'))
app.on('certificate loaded', () => console.log('SSL certificate loaded!'))

app.on('page loaded', page => console.log(`Page ${page.id} has been loaded`))
app.on('script loaded', script => console.log(`Script ${script.id} has been loaded`))
app.on('style loaded', style => console.log(`Style ${style.id} has been loaded`))

app.on('config modified', () => console.log('Config modified! Restarting Aero.'))
app.on('page modified', pageId => console.log(`Page ${pageId} has been modified`))
app.on('script modified', scriptId => console.log(`Script ${scriptId} has been modified`))
app.on('style modified', styleId => console.log(`Style ${styleId} has been modified`))
```

## Express compatibility

Aero aims to be as Express compatible as possible, however 100% API compatibility is not the goal.