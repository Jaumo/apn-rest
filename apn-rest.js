#!/usr/bin/env node

var log = require('./lib/log.js'),
		http = require('./lib/http.js'),
		fs = require('fs'),
		path = require('path'),
		apn = require('apn');

var config = {};

// parse options
var options = require("nomnom").options({
	config: {
		abbr: 'c',
		metavar: 'FILE',
		default: '/etc/apn-rest.conf',
		help: 'Config file to use'
	}
}).parseArgs();

// check config file
if (!fs.existsSync(options.config)) {
	log.error('invalid config file ' + options.config);
	process.exit(1);
}
config = require(path.resolve(__dirname, options.config));

log.setConfig(config.log);
log.info("Starting apn-rest with config file " + options.config);

http.setLog(log);
http.setApnsProductionProvider(new apn.Provider({
	token: config.apn,
	production: true
}));
http.setApnsSandboxProvider(new apn.Provider({
	token: config.apn,
	production: false
}));
http.listen(config.http);
