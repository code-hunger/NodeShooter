var app = require('express')()
  , server = require('http').createServer(app)
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({server: server});

global.classes = require('./classes.js');
global.cm = require('./connectionManager.js')
global.pm = require('./packetManager.js');

var cm = global.cm;
var pm = global.pm;
var classes = global.classes;

var port = Number(process.env.PORT || 5000);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });

app.get('/', function (req, res)
{
	res.sendfile(__dirname + '/userFiles/index.html');
});

var userFiles = ['client.js', 'game.js', 'styles.css', 'simulation.js'];
userFiles.map(function (file)
{
	app.get('/userFiles/' + file, function (req, res)
	{
		res.sendfile(__dirname + '/userFiles/' + file);
	});
});

global.users = {};
global.walls = {};
global.bullets = {};
global.frame = 0;

var users = global.users;
var walls = global.walls;
var bullets = global.bullets;
var frame = global.frame;

var nextID = 0;
function generateID()
{
	return nextID ++;
}
global.generateID = generateID;

wss.on('connection', function (socket)
{
	var cu; // current user

	var authRequest = new Uint8Array(1);
	socket.send(authRequest.buffer);

	socket.on('message', function(rawData, flags)
	{
		var data = new Uint8Array(rawData);
		if(data[0] == 0)
		{
			if(typeof(cu) != 'undefined' && typeof(cu.name) == 'string')
				return; // This user already has a name

			if(data.length > 12+1 || data.length <= 1) // Invalid name
			{
				var authRequest = new Uint8Array(1);
				socket.send(authRequest.buffer);
				return;
			}

			var name = "";
			for(var i = 0;i < data.length-1;++ i)
				name += String.fromCharCode(data[i+1]);

			// Check if there's already a user with that name
			for(var i in global.users)
			{
				if(global.users[i].name == name)
				{
					var authRequest = new Uint8Array(1);
					socket.send(authRequest.buffer);
					return;
				}
			}

			cu = new classes.User(socket, name, generateID());
			users[cu.id] = cu;
			socket.ownerID = cu.id;

			cm.broadcastNewUser(cu);
			cm.sendUsers(cu);
			cm.sendMap(cu);
			cm.initGame(cu);

			cm.broadcastMessage('Player %s joined.', cu.name);
		}
		if(data[0] == 1 && typeof(cu) != 'undefined')
		{
			if(!cu.dead && (new Date()).getTime() - cu.lastEvent.shoot > 120)
			{
				var id = generateID();
				bullets[id] = new classes.Bullet(cu.player.pos.x, cu.player.pos.y, cu.player.rotation, cu.id, 20);
				cm.sendBullet(id);
				cu.lastEvent.shoot = (new Date()).getTime();
			}
		}
	});
	socket.on('close', function (rawData, flags)
	{
		if(typeof(socket.ownerID) !== 'undefined')
		{

			// TODO
 			// sendToAll("addMessage", {message: ("Player " + cp.name + " disconnected.") });
 			// sendToAll("removeUser", {sid: socket.vars.sid }, false);
			delete users[socket.ownerID];
		}
	});
// 	socket.on("move", function (data)
// 	{
// 		if(mysid != undefined) // Нужно е за да съм сигурен, че cp и mysid съществуват
// 		{
// 			if(data.direction == "up" && (new Date()).getTime() - cp.lastEvent.move > 50)
// 			{
// 				cp.lastEvent.move = (new Date()).getTime();
// 				cp.speed += 0.6;
// 			}
//
// 			if(data.direction == "down")
// 			{
// 				cp.speed *= 0.8;
// 			}
//
// 			if(data.direction == "left")
// 			{
// 				cp.rotation -= 0.2;
// 				sendToAll("updatePlayerInformation", {sid: mysid, rotation: cp.rotation});
// 			}
// 			if(data.direction == "right")
// 			{
// 				cp.rotation += 0.2;
// 				sendToAll("updatePlayerInformation", {sid: mysid, rotation: cp.rotation});
// 			}
// 		}
// 	});
});

// Last file, because it calls functions written here
var simulation = require("./simulation.js");
