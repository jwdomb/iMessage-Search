var api = require('../api.js');
var conversationTemplate = require('../../templates/conversation.pug');
var statsTemplate = require('../../templates/stats.pug');
var events = require('../events.js');
var formatters = require('../formatters.js');

function ConversationView(handle_id, rank, query) {
	rank = Number(rank) || 0
	this.$elem = qs('#conversation');
	this.$messages = qs('#messages');
	this.$stats = qs('#stats');
	this.from = Math.max(0, rank - 100);
	this.rank = rank;
	this.to = this.expectedEnd = rank + 100;
	this.id = handle_id;
	this.query = query;
	this.$stats.innerHTML = '';
	this.$messages.innerHTML = '';
	this.listenTo(qs('.back'), 'click', this.onBack);
	this.fetchingData = true;
	api.conversation({ handle_id: this.id, from: this.from, to:this.to }, this.onFirstConversationResults.bind(this));
}

events(ConversationView);

function getDistFromBottom () {
	var scrollPosition = window.pageYOffset;
	var windowSize = window.innerHeight;
	var bodyHeight = document.body.offsetHeight;
	return Math.max(bodyHeight - (scrollPosition + windowSize), 0);
}

ConversationView.prototype.show = function(res) {
	this.$elem.style.display = 'block';
}

ConversationView.prototype.onBack = function(e) {
	e.preventDefault();
	history.pushState({}, '', '/');
	this.stopListeningAll();
};

ConversationView.prototype.destroy = function(res) {
	this.stopListening(document, 'scroll', this.onScroll);
	this.stopListening(qs('.back'), 'click', this.onBack);
};

ConversationView.prototype.onFirstConversationResults = function(res) {
	this.onConversationResults(res, true);
	this.listenTo(document, 'scroll', this.onScroll);
}

ConversationView.prototype.onConversationResults = function(res, first) {
	res.query = this.query;
	res.fn = formatters;
	this.fetchingData = false;
	this.$stats.innerHTML = statsTemplate(res);

	var dd = 0;
	var element = '[data-rank="'+Math.max(0, this.rank-2)+'"]';

	if(!first) {
		dd = qs(element).getBoundingClientRect().top;
	}

	this.$messages.innerHTML = this.from > res.messages[0].rank ? conversationTemplate(res) + this.$messages.innerHTML : this.$messages.innerHTML + conversationTemplate(res);

	dd = qs(element).getBoundingClientRect().top - (first ? 0 : dd);

	window.scrollTo(0, dd + window.pageYOffset || document.documentElement.scrollTop);

	this.from = Math.min(this.from, res.messages[0].rank);
	this.to = Math.max(this.to, res.messages[res.messages.length-1].rank);
}

ConversationView.prototype.onScroll = function() {
	var distToBottom = getDistFromBottom();
	if (!this.fetchingData && distToBottom < 1000 && this.to === this.expectedEnd) {
		this.expectedEnd = this.to+200;
		api.conversation({ handle_id: this.id, from: this.to, to:this.to+200 }, this.onConversationResults.bind(this));
	}
	else if (!this.fetchingData && window.pageYOffset < 1000 && this.from > 0) {
		this.fetchingData = true;
		api.conversation({ handle_id: this.id, from: Math.max(0, this.from - 200), to: this.from }, this.onConversationResults.bind(this));
	}
}

module.exports = ConversationView;
