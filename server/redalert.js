var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var request = require('request');
var port = 3020;


app.use(bodyParser());


app.get('/',function(req,res){
	
	res.end('nothing to see');

})

io.set('transports', ['polling']);

var connections = 0;

io.sockets.on('connection', function (socket) {

	connections = connections+1;
	console.log(connections);
	console.log('connected client');

	if(connections > 2000) {
		console.log('killed connected client');
		socket.disconnect();

	}

 	//console.log('connected client');

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// update list of users in chat, client-side
		//io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		console.log('disconnected connected client');
		connections = connections - 1;
		socket.leave(socket.room);
		socket.disconnect();

	});
});



app.post('/780e73490dcce9516fd7e344d6d12c04', function(req,res) {

	var key = req.body.key;
	var alert = req.body.alert;
	if(key == 'e5ce3ce848c179b1f09517ffbc369437') {
		res.end('Broadcasted');
		broadCastMessage(req.body.alert);

	} else {
		res.end('Go away');

	}

});

function broadCastMessage(alertbody) {

    console.log(alertbody);
	var alert = JSON.parse(alertbody);
	io.sockets.emit('alert',alert);
	console.log('emitted new alert: '+alertbody);

}

app.get('/connected',function(req,res) {

	res.jsonp(io.sockets.sockets.length);

})

app.get('/testalert', function(req,res) {

	

	request('http://api.rocketalert.me/alerts/latest', function (error, responsediff, body) {

		console.log(body);
		console.log(error);

		var alert = JSON.parse(body);

		io.sockets.emit('alert',alert);
		console.log('emitted new alert');
		
	
		//res.jsonp(alert);

	});


	res.end('Emitted test');
	

});


http.listen(port);

console.log("Listening on port " + port);