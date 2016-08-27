# Startup

All `.js` files inside the `startup` directory are loaded as node modules when your app runs. It is appropriate to add app configuration and middleware via separate modules inside `startup` instead of configuring everything inside one file only. Try to keep your `index.js` as clean as possible.