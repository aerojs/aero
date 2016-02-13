## Styles

Style sheets are written in [Stylus](https://github.com/stylus/stylus) format using the `.styl` file extension inside the `styles` directory.

```stylus
body
	color white
	background-color black
```

Optionally you can define the loading order in your `config.json`. If you have 3 files called `first.styl`, `second.styl` and `third.styl` you can write:

```json
"styles": [
	"first",
	"second",
	"third"
]
```

Files that have not been specified in the `styles` array are loaded in undefined order at the end.

### Global `config.styl`

You can add a global `config.styl` inside the `styles` directory which will be included before every single style you load. Make sure it only contains variable definitions (like colors) which have no impact on file size.