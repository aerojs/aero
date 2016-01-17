function startLiveReload() {
	var ws = new WebSocket('${protocol}://localhost:${port}/');

	ws.onmessage = function(e) {
		var message = JSON.parse(e.data);

		switch(message.title) {
			case 'reload':
				location.reload();
				break;

			case 'route modified':
				// Case 1: /profile updated when viewing /profile/UserName
				// Case 2: /profile/details updated when viewing /profile
				if(location.pathname.indexOf(message.url) === 0 || message.url.indexOf(location.pathname) === 0) {
					if(kaze)
						kaze.get('/_' + location.pathname).then(kaze.setContent);
					else
						location.reload();
				}
				break;
		}
	};

	ws.onclose = function() {
		console.log('LiveReload websocket closed');
		startLiveReload();
	};
}

startLiveReload();