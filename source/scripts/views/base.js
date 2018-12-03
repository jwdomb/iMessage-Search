var api = require('../api.js');
var searchTemplate = require('../../templates/search.pug');
var messagesTemplate = require('../../templates/messages.pug');
var formatters = require('../formatters.js');

function BaseView() {
	qs('#searchbar').innerHTML = searchTemplate();
	this.$elem = qs('#base.view');
	this.$searchform = qs('#searchform');
	this.$query = qs('#query');
	this.$results = qs('#results');
	window.$on(this.$searchform, 'submit', this.onSearch.bind(this));
	window.$delegate(this.$results, '.filter', 'click', this.onPersonFilter.bind(this));
	window.$delegate(this.$results, '.conversation', 'click', this.onConversationClick.bind(this));
}

BaseView.prototype.show = function(res) {
	this.$elem.style.display = 'block';
}

BaseView.prototype.onSearch = function(e) {
	e.preventDefault();
	this.query = this.$query.value;
	if(this.query !== '') {
		api.search({query:this.query}, this.onResults.bind(this));
	}
}

BaseView.prototype.onResults = function(res) {
	res.fn = formatters;
	this.$results.innerHTML = messagesTemplate(res);
}

BaseView.prototype.onPersonFilter = function(e, matchedElement) {
	var id = matchedElement.attributes['data-handle-id'] && matchedElement.attributes['data-handle-id'].value;
	api.search({ query: this.query, handle_id: id }, this.onResults.bind(this));
}

BaseView.prototype.onConversationClick = function(e, matchedElement) {
	this.id = matchedElement.attributes['data-handle-id'].value;
	var rank = Number(matchedElement.attributes['data-rank'].value);
	history.pushState({}, "Conversation with "+this.id, "/conversation/"+this.id+'/'+rank);
}

module.exports = BaseView;
