# Events

Aero offers you a few events you can subscribe to.

```js
app.on('server started', () => console.log('We are online!'))

app.on('all pages loaded', () => console.log('Got all the page contents!'))
app.on('all styles loaded', () => console.log('Got all the compiled styles!'))
app.on('all scripts loaded', () => console.log('Got all the minified scripts!'))
app.on('all plugins loaded', () => console.log('Loaded all plugins!'))
app.on('all fonts loaded', () => console.log('Downloaded all font definitions!'))

app.on('config loaded', () => console.log('config.json loaded!'))
app.on('package loaded', () => console.log('package.json loaded!'))
app.on('certificate loaded', () => console.log('SSL certificate loaded!'))

app.on('page loaded', page => console.log(`Page ${page.id} has been loaded`))
app.on('script loaded', script => console.log(`Script ${script.id} has been loaded`))
app.on('style loaded', style => console.log(`Style ${style.id} has been loaded`))
app.on('plugin loaded', plugin => console.log(`Plugin ${plugin} has been loaded`))

app.on('config modified', () => console.log('Config modified! Restarting Aero.'))
app.on('page modified', pageId => console.log(`Page ${pageId} has been modified`))
app.on('script modified', scriptId => console.log(`Script ${scriptId} has been modified`))
app.on('style modified', styleId => console.log(`Style ${styleId} has been modified`))
```