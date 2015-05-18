module.exports = {
	get: function(request, response) {
		response.writeHead(200, {
			"Content-Type": "text/html"
		});
		
		for(let param of request.params) {
			response.write(param + "<br>");
		}
		
		response.write("Hello");
		
		response.end();
	}
};