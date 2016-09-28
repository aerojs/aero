function _watch() {
	let ws = new WebSocket('${protocol}://localhost:${port}/');

	ws.onmessage = function(e) {
		let message = JSON.parse(e.data);

		if(message.title === 'reload') {
			return location.reload();
		}

		if(message.title === 'route modified') {
			// Case 1: /profile updated when viewing /profile/UserName
			// Case 2: /profile/details updated when viewing /profile
			if(location.pathname.indexOf(message.url) === 0 || message.url.indexOf(location.pathname) === 0) {
				if(window.aero && window.aero.get) {
					window.aero.get('/_' + location.pathname).then(window.aero.setContent);
				} else {
					location.reload();
				}
			}
			return;
		}
	};

	ws.onclose = function() {
		setTimeout(_watch, 500)
	};
}

_watch();