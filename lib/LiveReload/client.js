function _watch() {
	var ws = new WebSocket('${protocol}://localhost:${port}/');

	ws.onmessage = function(e) {
		var message = JSON.parse(e.data);

		if(message.title === 'reload') {
			return location.reload();
		}

		if(message.title === 'route modified') {
			// Case 1: /profile updated when viewing /profile/UserName
			// Case 2: /profile/details updated when viewing /profile
			if(location.pathname.indexOf(message.url) === 0 || message.url.indexOf(location.pathname) === 0) {
				if(aero && aero.get)
					aero.get('/_' + location.pathname).then(aero.setContent);
				else
					location.reload();
			}
			return;
		}
	};

	ws.onclose = function() {
		console.log('LiveReload websocket closed');
		_watch();
	};
}

_watch();