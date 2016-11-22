module.exports = new function () {
	var config = {};

	function consoleLog(level, message) {
		console.log(new Date().toLocaleString() + ' apn-rest[' + process.pid + '] ' + level + ': ' + message);
	}

	this.setConfig = function(newConfig) {
		config = newConfig;
	};

	this.log = function(level, message) {
		if ('debug' == level && !config.debug) {
			return;
		}

		if ('object' == typeof message || 'array' == typeof message) {
			message = JSON.stringify(message);
		}

		consoleLog(level, message);
	};

	this.debug = function(message) {
		this.log('debug', message);
	};

	this.info = function(message) {
		this.log('info', message);
	};

	this.error = function(message) {
		this.log('error', message);
	};

	this.warn = function(message) {
		this.log('warn', message);
	};
};
