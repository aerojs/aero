function startLiveReload() {
	var ws = new WebSocket('${protocol}://localhost:${port}/');

	ws.onmessage = function(e) {
		if(e.data === location.pathname)
			location.reload();
	};

	ws.onclose = function() {
		console.log('LiveReload websocket closed');
		startLiveReload();
	};
}

startLiveReload();