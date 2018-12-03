function extend(obj) {

	var listenerId = 0;
	var fnCache = {};

	obj.prototype.listenTo = function(target, name, cb) {
		cb._listenerId = cb._listenerId || listenerId++;
		obj._listeners = obj._listeners || [];
		obj._listeners.push({target:target, name:name, cb:cb});
		fnCache[cb._listenerId] = cb.bind(this);
		target.addEventListener(name, fnCache[cb._listenerId]);
	}

	obj.prototype.stopListening = function(target, name, cb) {
		target.removeEventListener(name, fnCache[cb._listenerId]);
	}

	obj.prototype.stopListeningAll = function() {
		if(!this._listeners) return;
		var _this = this;
		this._listeners.forEach(function(o) {
			_this.stopListening(o.target, o.name, o.cb);
		})
	}

	obj.prototype.on = function(name, cb) {
		this.listeners = this.listeners|| {};
		this.listeners[name] = this.listeners[name] || [];
		this.listeners[name].push(cb);
	};

	obj.prototype.once = function(name, cb) {
		var _this = this;
		this.on(name, function() {
			_this.listeners[name].splice(_this.listeners[name].indexOf(cb), 1);
			cb(_this);
		})
	};

	obj.prototype.dispatch = function(name) {
		if(!this.listeners || !this.listeners[name]) return;
		for (var i = 0; i < this.listeners[name].length; i++) {
			setTimeout(this.listeners[name][i].bind(null, obj), 0);
		}
	};
}

module.exports = extend;
