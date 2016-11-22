module.exports = new function () {
	var http = require('http');
	var url = require('url');
	var apn = require('apn');

	var log = null;
	var server = null;
	var apnsProduction = null;
	var apnsSandbox = null;

	this.setLog = function (mylog) {
		log = mylog;
	};

	this.setApnsProductionProvider = function (provider) {
		apnsProduction = provider;
	};

	this.setApnsSandboxProvider = function (provider) {
		apnsSandbox = provider;
	};

	this.listen = function (config) {
		server = http.createServer(processRequest);
		try {
			server.listen(config.port, config.host, function () {
				log.info('HTTP server bound to ' + config.host + ':' + config.port);
			});
		}
		catch (e) {
			log.error('Could not bind HTTP server to ' + config.host + ':' + config.port);
		}
	};

	function handlePush(req, res, data, apnsProvider) {
		if (!data.deviceToken) {
			sendResponse(res, 400, {'result': 'ERROR', message: '"deviceToken" is missing'});
			return;
		}

		if (!data.notification) {
			sendResponse(res, 400, {'result': 'ERROR', message: '"notification" is missing'});
			return;
		}

		if (!data.notification.topic) {
			sendResponse(res, 400, {'result': 'ERROR', message: '"notification.topic" is missing'});
			return;
		}

		var note = new apn.Notification();

		for (key in data.notification) {
			if (data.notification.hasOwnProperty(key)) {
				note[key] = data.notification[key];
			}
		}

		apnsProvider.send(note, data.deviceToken).then(function(result) {
			log.info(result);
			sendResponse(res, 200, {'result': result});
			/**
			 * @see https://github.com/node-apn/node-apn/issues/463
			 */
			if (result.failed) {
				for (i in result.failed) {
					var item = result.failed[i];
					if (item.status == 500) {
						log.error("Retrieved " + item.status + " for device " + item.device + ": " + item.response.reason);
						server.close(function() {
							log.error("Exit process");
							require('process').exit()
						});
					}
				}
			}
		});
	}

	function processRequest(req, res) {
		var path = url.parse(req.url).pathname;

		log.debug('processing ' + req.method + ' request, path: ' + path);

		if (req.method == 'GET') {
			switch (path) {
				case '/ping':
					sendResponse(res, 200, {'result': 'pong'});
					break;
				default:
					log.debug('404 Path Not Found: ' + path);
					sendResponse(res, 404, {'error': 'Not Found'});
			}
		}
		else if (req.method == 'POST') {
			switch (path) {
				case '/send':
					handlePost(req, res, function (data) {
						handlePush(req, res, data, apnsProduction)
					});
					break;
				case '/send/sandbox':
					handlePost(req, res, function (data) {
						handlePush(req, res, data, apnsSandbox)
					});
					break;
				case '/ping':
					sendResponse(res, 200, {'result': 'pong'});
					break;
				default:
					log.debug('404 Path Not Found: ' + path);
					sendResponse(res, 404, {'error': 'Not Found'});
			}
		}
		else {
			log.debug('405 Method Not Allowed: ' + req.method + " " + path);
			sendResponse(res, 405, {'error': 'Method Not Allowed'});
		}
	}

	function sendResponse(res, code, body) {
		var responseBody = JSON.stringify(body);
		res.writeHead(code, {
			'Content-Type': 'application/json',
			'Content-Length': responseBody.length
		});
		res.write(responseBody, 'utf8');
		res.end();
	}

	function handlePost(req, res, callback) {
		req.setEncoding('utf8');

		var body = '';
		req.on('data', function (data) {
			body += data;
		});
		req.on('end', function () {
			try {
				var data = JSON.parse(body.toString());
				log.debug(data);
			}
			catch (e) {
				var error = 'Not A JSON Body: ' + body;
				log.error(error);
				sendResponse(res, 400, {'error': error});
				return;
			}
			callback(data);
		});
	}
};
