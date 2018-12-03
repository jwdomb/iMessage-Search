var api = {};

api.baseURL = 'http://localhost:8891/api/';

api.search = function (params, cb) {
	var queryString = Object.keys(params).map(function(key) {
		return params[key] === undefined ? '' : key + '=' + params[key]
	}).join('&');
	window.getJson(api.baseURL + 'search?' + queryString, cb);
}

api.conversation = function (params, cb) {
	var queryString = Object.keys(params).map(function(key) {
		return params[key] === undefined ? '' : key + '=' + params[key];
	}).join('&');
	window.getJson(api.baseURL + 'conversation?' + queryString, cb);
}

module.exports = api;
