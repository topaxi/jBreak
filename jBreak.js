#!/usr/bin/env node

var express = require('express')
  , server  = express.createServer()
  , config  = {
  	'server': {
  		'listen':     8080,
  		'viewEngine': 'jade'
  	}
  }
  , fs            = require('fs')
  , jBreakVersion = fs.readFileSync('version.txt')
;

server.use(express.static(__dirname +'/public'));

server.set('view engine', config.server.viewEngine);
server.listen(config.server.listen);

console.log('jBreak Server listening on port %d', config.server.listen);
console.log('Open up http://localhost:%d/',       config.server.listen);

server.get('/', function(req, res){
	res.render('layout', {'locals': {
		'production': false,
		'version':    jBreakVersion
	}});
});

server.get('/level/:level', function(req, res){
	fs.readFile(__dirname + '/levels/' + req.params.level +'.json',
		function(err, level){
			if(err) throw err;

			res.send(JSON.stringify({'error':false, 'message':JSON.parse(level)}));
		}
	);
});
