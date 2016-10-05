Aero Web Framework
------------------
Thank you for taking your time looking at the source code
for the Aero framework. It is a project that I made mostly
for myself because I wanted a server that was flexible enough
to support dynamic routes - a feature that Express was (or still is?) [lacking](https://github.com/expressjs/express/issues/2596).
Performance was not my original motivation to write this framework.
It just accidentally turned out to be very fast, doing things efficiently
and always adhering to DRY rules.

Source Code Guide
-----------------
`index.js` is the main file which forces all Aero-related packages to
run in strict mode. We need strict mode to use ES6 features like `let`.
Aero is written in object-oriented style and is composed of 6 main classes:

* App
* Layout
* Linter
* LiveReload
* Page
* Server

Each class's source code can be found in a subdirectory under `lib` and the class entry point is `index.js`. The module `loadClass.js` loads all files in a class directory and appends the exported functions as methods to the prototype of the class (except for `index.js` itself). Therefore if you want to add a new method to the class you only need to add a new file in the class directory and export a function. Generator functions are automatically converted to coroutines.