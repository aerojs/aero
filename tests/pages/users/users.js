module.exports = {
	init: function(page) {
		this.render = page.renderTemplate;
	},
	
	get: function(request, response) {
		response.writeHead(200, {
			"Content-Type": "text/html"
		});
		
		response.end(this.render({
			user: request.params[0],
			type: request.params[1]
		}));
	}
};