# Templates

Templates are written using [Jade](http://jade-lang.com/) for any page type or [Markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) for static pages.

Jade example:

```jade
h1 Title
p Content.
```

Markdown example:

```markdown
# Title
Content.
```

## Standalone markdown

You do not need a Jade template if your page only uses Markdown.

## Jade: Render page markdown

```jade
!= app.markdown(page.markdown)
```

The above Jade template allows you to render your markdown code and apply additional formatting around it.

## Globals

Every Jade template has access to the `app` variable. Page templates can additionally access their own page data via the `page` variable.

## app.markdown

The `app.markdown` function expects the markdown code as the first parameter and returns the rendered HTML. For details check out  [remarkable](https://github.com/jonschlinkert/remarkable).