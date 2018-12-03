(function (window) {
	'use strict';

	var _pushState = history.pushState;
	history.pushState = function() {
		_pushState.apply(history, arguments);
		var e = new Event('pushstate');
		e.args = Array.prototype.slice.call(arguments);
		window.dispatchEvent(e);
	}

	window.makeNode = function(HTML) {
		var template = document.createElement('template');
		HTML = HTML.trim(); // Never return a text node of whitespace as the result
		template.innerHTML = HTML;
		return template.content.firstChild;
	}

	// Sending and receiving data in JSON format using POST method
	window.getJson = function(url, cb) {
		cb = cb || function() {};
		var xhr = new XMLHttpRequest();
		// var url = "url";
		xhr.open("GET", url);
		// xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if(xhr.status === 200) {
					var json = JSON.parse(xhr.responseText);
					cb(json);
				} else {
					// cb();
				}
			}
		};
		xhr.send(null);
	}

	// Sending and receiving data in JSON format using POST method
	window.postJson = function(url, data, cb) {
		cb = cb || function() {};
		var xhr = new XMLHttpRequest();
		// var url = "url";
		xhr.open("POST", url);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var json = JSON.parse(xhr.responseText);
				cb(json);
			} else {
				cb();
			}
		};

		xhr.send(JSON.stringify(data));
	}

	// Sending and receiving data in JSON format using POST method
	window.patchJson = function(url, data, cb) {
		cb = cb || function() {};
		var xhr = new XMLHttpRequest();
		// var url = "url";
		xhr.open("PATCH", url);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var json = JSON.parse(xhr.responseText);
				cb(json);
			} else {
				cb();
			}
		};
		xhr.send(JSON.stringify(data));
	}

	window.deleteReq = function(url, cb) {
		cb = cb || function() {};
		var xhr = new XMLHttpRequest();
		xhr.open('DELETE', url);
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var json = JSON.parse(xhr.responseText);
				cb(json);
			} else if (xhr.status >= 400 || xhr.status === 0) {
				cb(new Error(xhr.status));
			} else {
				cb();
			}
		};
		xhr.send();
	}
	// Get element(s) by CSS selector:
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};
	window.$hide = function(selector, scope) {
		qsa(selector, scope).forEach(function(e) {
			e.style.display = 'none';
		});
	}

	// addEventListener wrapper:
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	window.$off = function (target, type, callback, useCapture) {
		target.removeEventListener(type, callback, !!useCapture);
	};

	function findAncestor(node, selector, end) {
		if(!node.parentElement || node === end) {
			return;
		}
		if(node.matches(selector)) {
			return node;
		} else {
			return findAncestor(node.parentElement, selector, end);
		}
	}

	// Attach a handler to event for all elements that match the selector,
	// now or in the future, based on a root element
	window.$delegate = function (target, selector, type, handler) {
		function dispatchEvent(event) {
			var targetElement = event.target;
			// var potentialElements = window.qsa(selector, target);
			// var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;
			var match = findAncestor(targetElement, selector, target);
			if (match) {
				// element.closest(selectors)
				handler.call(match, event, match);
			}
		}

		// https://developer.mozilla.org/en-US/docs/Web/Events/blur
		var useCapture = type === 'blur' || type === 'focus';

		window.$on(target, type, dispatchEvent, useCapture);
	};

	// Find the element's parent with the given tag name:
	// $parent(qs('a'), 'div');
	window.$parent = function (element, tagName) {
		if (!element.parentNode) {
			return;
		}
		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
			return element.parentNode;
		}
		return window.$parent(element.parentNode, tagName);
	};

	// Allow for looping on nodes by chaining:
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;
})(window);
