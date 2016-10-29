# Pages

Aero loads and watches the `pages` directory for changes. Instead of adding routes via code you just add a directory inside `pages`, e.g. `pages/home` which can then be tracked by git.

## Contents

For a page to be loaded by Aero it needs a template or a `.js` controller.

Page type                        | .pug | .js
-------------------------------- | ----- | ---
Static page                      | ✓     |
Dynamic page (full control, API) |       | ✓
Dynamic page (with template)     | ✓     | ✓

Static pages can also be written in Markdown using the file extension `.md`.

Adding a `.styl` file to the page will load the style sheet on this page only.

Adding a `.json` file will add all its data to your `.pug` template automatically.

For example the `hello` directory may contain:

* `hello.pug` (template)
* `hello.styl` (style sheet)
* `hello.js` (controller)
* `hello.client.js` (client script)
* `hello.md` (markdown)
* `hello.json` (data)
* `hello.jsonld` ([linked data](http://json-ld.org/))

## Subdirectories

Aero scans your pages directory recursively and therefore also adds routes for subpages automatically:

```
/api
/api/users
/api/users/uploads
```

## Change URL for a page

By default Aero will create a route based on the directory name. If you don't like the default behaviour you can overwrite the route with the `url` parameter in the `.json` file:

```json
{
	"url": "blog/categories"
}
```

For the frontpage you should use an empty string.