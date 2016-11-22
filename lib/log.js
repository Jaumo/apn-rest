module.exports = new function () {
	var logToConsole = true;
	var syslog = null;
	var config = {};

	this.setConfig = function(newConfig) {
		config = newConfig;
		if (config.syslog && config.syslog.enable) {
			var SysLogger = require('ain2');
			syslog = new SysLogger({tag: config.syslog.tag, facility: config.syslog.facility, hostname: config.syslog.host, port: config.syslog.port});
		}
		else {
			syslog = null;
		}
	};

	this.logToConsole = function(state) {
		logToConsole = state;
	};

	this.log = function(level, message) {
		if ('debug' == level && !config.debug) {
			return;
		}

		if ('object' == typeof message || 'array' == typeof message) {
			message = JSON.stringify(message);
		}

		if (syslog) {
			switch (level) {
				case 'debug':
					syslog.debug(message);
					break;
				case 'info':
					syslog.info(message);
					break;
				case 'error':
					syslog.error(message);
					break;
				case 'warn':
					syslog.warn(message);
					break;
			}
		}

		if (logToConsole) {
			console.log(new Date().toLocaleString() + ' apn-rest[' + process.pid + '] ' + level + ': ' + message);
		}
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
