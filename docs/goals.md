# Goals

* [Performance](#performance)
* [Productivity](#productivity)
* [Simplicity](#simplicity)

# Performance

Aero is optimized for website loading speed and content delivery performance.

Thanks to automatic optimizations a [Page Speed rank of 100 / 100](https://developers.google.com/speed/pagespeed/insights/?url=blitzprog.org) is easily possible.

## Inlining

Aero inlines resources like style sheets and scripts for the initial request and never loads them again if the `kaze` plugin is used.

## Minification

The following resources are automatically minified:

* Markup (HTML)
* Styles (CSS)
* Scripts (JS)

When you save a source file in your editor the minified version will be recompiled and your browser refreshes the page.

## HTTP/2

Aero comes with HTTP/2 support included. In order to use HTTP/2 you need an SSL certificate.

In the future we will automatically push resources like scripts and styles to the client via the new push method as an alternative to traditional inlining. Note that pushing is not included in Aero yet.

## AJAX

If you use the included `kaze` plugin your website will be ajaxified. Permalinks will still work nicely with search engines, therefore ensuring the best possible experience for both humans and search engines. This is possible due to the HTML 5 History API. A full page reload is no longer needed, therefore improving the rendering speed which is  especially noticeable on mobile browsers.

# Productivity

## No restarts
Controllers, templates, styles and configuration files are recompiled whenever you save them in your editor. Your changes are instantly visible. Routes are dynamic and you never really need to restart Aero.

## Live reload
You don't need to press the refresh button in your browser anymore because when you save the file in your editor all of your browser tabs using that page will be automagically reloaded. This requires **no plugins** and works in **all browsers** as long as they support HTML 5.

# Simplicity

> Write programs that do one thing and do it well.

Aero is very lightweight and doesn't include any database drivers.
It is a very high-level framework, you can decide what you're going to use under the hood. At the time of writing this Aero doesn't allow you to use alternatives to Jade and Stylus but this will be changed in a future release.