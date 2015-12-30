function startLiveReload() {
	var ws = new WebSocket('${protocol}://localhost:${port}/');

	ws.onmessage = function(e) {
		// Case 1: /profile updated when viewing /profile/UserName
		// Case 2: /profile/details updated when viewing /profile
		if(location.pathname.indexOf(e.data) === 0 || e.data.indexOf(location.pathname) === 0)
			location.reload();
	};

	ws.onclose = function() {
		console.log('LiveReload websocket closed');
		startLiveReload();
	};
}

startLiveReload();