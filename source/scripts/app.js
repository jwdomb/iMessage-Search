require('./functions.js');

var BaseView = require('./views/base.js');
var ConversationView = require('./views/conversation.js');

(function () {
	'use strict';

	var baseView, conversationView;

	function setView(e) {
		var path = document.location.pathname;
		var matches;
		$hide('.view');
		conversationView && conversationView.destroy();
		if((matches = path.match(/\/conversation\/(\d+)(?:\/(\d+))?/))) {
			conversationView = new ConversationView(matches[1], matches[2], baseView && baseView.query);
			conversationView.show();
		}
		else if(path === '/') {
			baseView = baseView || new BaseView();
			baseView.show();
		}
	}

	$on(window, 'load', setView);
	$on(window, 'popstate', setView);
	$on(window, 'pushstate', setView);

})();
