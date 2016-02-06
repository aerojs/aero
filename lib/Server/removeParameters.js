module.exports = function(url, request) {
	let paramsPosition = url.indexOf('?', 1)

	if(paramsPosition === -1) {
		return url.substring(1)
	} else {
		request.query = querystring.parse(url.substring(paramsPosition + 1))
		return url.substring(1, paramsPosition)
	}
}