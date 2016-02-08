module.exports = function(server, obj) {
	if(!obj)
		obj = server
	
	obj.sockets = {}

	server.on('connection', (socket) => {
		// Disable Nagle algorithm: Sends data immediately when calling socket.write
		socket.setNoDelay(true)

		let key = socket.remoteAddress + ':' + socket.remotePort
		obj.sockets[key] = socket

		socket.on('close', function() {
			delete obj.sockets[key]
		})
	})

	server.closeSockets = () => {
		for(let key in obj.sockets)
			obj.sockets[key].destroy()
	}
}