module.exports = {
	init: function(page) {
		this.page = page;
	},
	
	get: function(request, response) {
		response.writeHead(200, {
			"Content-Type": "text/html"
		});
		
		response.end(this.page.render({
			user: request.params[0],
			type: request.params[1]
		}));
	}
};