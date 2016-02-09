# Scripts

You can place browser scripts in the `scripts` directory.
These will be global and therefore available on every page.

Optionally cou can define the loading order for global scripts in your `config.json`. If you have 3 files called `first.js`, `second.js` and `third.js` you can write:

```json
"scripts": [
	"first",
	"second",
	"third"
]
```

Files that have not been specified in the `scripts` array are loaded in undefined order at the end.

## Page-specific

To add a client-side script to a single page use a `.client.js` file inside the page directory, e.g. `hello.client.js` for the `hello` page.

Execution inside client-side scripts only starts after the DOM has been loaded. Therefore any code that waits for the DOMContentLoaded event is unnecessary.

**Warning:** Currently you need to write page-specific client scripts as if you are inside a function already. Therefore it's not possible to define a global function. This will fail:

```js
function hello() {
	console.log('Hello')
}
```

As a temporary workaround you can add your global functions to the `window` variable:

```js
window.hello = function() {
	console.log('Hello')
}
```

I realize that this is not an optimal solution and I am working on a fix to improve this behaviour.

## Modern ECMAScript

Scripts are transformed using Babel ES 2015 which means you can use modern ECMAScript without worrying about browser support.