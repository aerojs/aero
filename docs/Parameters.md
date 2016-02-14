# URL parameters

The parsing of URL parameters is slightly different to usual servers.

For example, let's assume you have a page called `users` which is available by visiting `/users`. The same page and its controller will be called when you request `/users/MyName` or even `/users/MyName/profile`.

In all cases you can access `request.params` inside the users controller which gives you an array of parameters:

```js
// users
[]

// users/MyName
['MyName']

// users/MyName/profile
['MyName', 'profile']
```

## Query parameters

If you don't like the Aero way of passing parameters to a page you can still use the traditional way and access parameters via `request.query`:

```js
// users?userName=MyName&component=profile
{
	userName: 'MyName',
	component: 'profile'
}
```