# apn-rest

A simple rest interface to node-apn (https://github.com/node-apn/node-apn)
It's intention is to build a microservice for sending APNS pushes without dealing with implementation details in the client application.

## Installation

	npm install apn-rest

## Example configuration

```javascript
module.exports = {
	pidfile: '/tmp/apn-rest.pid',
	http: {
		host: 0,
		port: 8089,
	},
	log: {
		debug: true,
		syslog: {
			enable: true,
			tag: 'apn-rest',
			facility: 'LOG_DAEMON',
		},
	},
	apn: {
		key: "/path/to/key.p8",
		keyId: "T0K3NK3Y1D",
		teamId: "T34M1D",
	}
}

```

## Usage

### In foreground

	apn-rest -c /path/to/configuration

### As daemon

apn-rest can be run as daemon. It can be used as an init script and supports the following commands

	start, restart, stop, status

If you want to run apn-rest without config arguement, the configuration must be placed in /etc/apn-rest.conf.

The following command starts apn-rest as a daemon with config file located in /etc/apn-rest/node1.conf

	apn-rest start -c /etc/apn-rest/node1.conf

To stop it, use the following command

	apn-rest stop -c /etc/apn-rest/node1.conf

### Logging

By default, apn-rest is logging to stdout if it's not started as a daemon.
In daemon mode it's logging to syslog, if enabled. If syslog is not enabled,
and apn-rest is running as daemon, it's logging to /dev/null.

### REST Interface

There are 3 routes:

``GET /ping``

Will answer with a 200 OK, used to check for service health

``POST /send``

Send an APNS message.

	curl http://127.0.0.1:8089/send -d '{"deviceToken":"8e08678bb5f10ddce5e7295a474558f6bc69c7d039a3b120e59aedfce0b697fc","notification":{"topic": "your-app-bundle-id", "alert": "Some message"}}'

A notification is a JSON object accepting the following fields:
- expiry (default: 0)
- badge: Badge counter (default: empty)
- sound: Played sound (default: empty)
- alert: Alert message (default: empty)
- payload: Custom payload (default: {})
- topic: APNS topic, required

``POST /send/sandbox``

Same as /send, but uses sandbox environment
