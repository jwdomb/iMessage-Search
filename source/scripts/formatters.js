var formatters = module.exports = {};

formatters.dateformat = function(date) {
	return (new Date(date)).toISOString().replace('T',' ').substr(0,16);
}

formatters.escapeHTML = function(unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
