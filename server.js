var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var io = require('socket.io').listen(app);
var app = express();

app.use(express.static(path.join(__dirname, './client')));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

require('./server/config/mongoose.js');
// require('./server/config/routes.js')(app);
// app.get('/', function(req, res) {
// 	res.redirect("/game.html");
// });
server = app.listen(8000, function(){
	console.log('DojoHunt listening port 8000.....');
});

var starts = [[600,1],[1950,1],[13,2],[36,2],[649,3],[1949,3],[2462,0],[2488,0]];
	var players = [];
	mapArr = [0,0,0,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,1,1,0,1,0,0,1,0,1,0,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,0,0,0,1,0,0,1,0,1,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,1,1,0,0,0,0,0,1,0,1,1,0,1,1,0,0,1,0,1,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,0,0,0,0,1,0,1,0,1,1,0,1,0,0,0,1,0,0,0,0,0,1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,1,0,0,1,0,1,0,1,1,0,0,0,0,0,1,0,1,1,0,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1,0,0,0,0,1,1,1,0,1,1,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,0,0,1,0,1,0,0,1,1,1,0,0,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1,0,1,0,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,0,1,1,1,0,1,0,1,0,1,1,1,1,0,1,1,0,1,1,1,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,0,0,1,0,1,1,1,0,0,1,0,0,0,1,0,1,0,1,1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0,1,1,1,0,0,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,0,0,1,0,1,0,0,0,1,0,0,1,1,1,0,0,0,1,1,1,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1,0,1,1,0,1,1,1,0,1,0,0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1,1,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1,1,0,1,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,1,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,1,0,1,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,0,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,1,0,1,1,1,1,0,1,0,1,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,1,0,1,1,1,0,1,0,0,0,0,1,1,1,0,0,0,1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,0,0,0,1,0,0,0,0,0,0,0,1,1,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,1,0,1,0,1,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,0,0,1,0,0,0,1,1,1,1,0,1,0,1,1,0,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,0,0,0,0,1,0,1,1,0,1,1,1,0,1,0,1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,0,0,1,0,0,0,0,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,0,0,1,0,1,0,0,1,1,0,1,1,0,1,1,0,0,0,1,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,1,1,1,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,0,0,0,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,0,0,0,1,0,1,0,1,0,1,1,1,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,1,1,0,1,1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,0,1,0,1,0,1,1,0,1,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,1,1,1,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1,0,1,1,0,0,0,0,0];

function findPlayer(socketID){
	for (var i = 0; i < players.length; i++){
		if (players[i].id == socketID){
			return i;
		}
	}
}

function damage(target_ndx, type, shooter){
	players[target_ndx].health = players[target_ndx].health - 1;
	console.log('health', players[target_ndx].health)
	io.emit('successful_attack', {'ndex': target_ndx, 'damage': 1, 'shooter': shooter});
}

function PlayerConstructor(socketID){
	var player = {};
	player.id = socketID;
	var start_pt = [];
	var safe = false;
	start_ndx = Math.floor(Math.random()*starts.length);
	while (!safe){
		if (mapArr[starts[start_ndx][0]] == 0) {
			safe = true;
		} else {
			start_ndx < starts.length-1 ? start_ndx++ : start_ndx = 0;
		}
	}
	start_pt = starts[start_ndx];
	player.location = start_pt;
	mapArr[start_pt[0]] = socketID;
	player.name = 'Player ' + Math.floor(Math.random()*100000);
	player.score = 0;
	player.health = 3;
	player.ammo = 0;
	return player;
}

var io = require('socket.io').listen(server);

// io.sockets.on('connection', function(socket){
// 	console.log('connected to: ', socket.id);
// })

io.sockets.on('connection', function(socket){

	socket.emit('test', {'this': 'is a test'});
	console.log("connected:", socket.id);
	var player_constructor = PlayerConstructor(socket.id);
	players.push(player_constructor);

	var ndex = players.length-1;
	var new_player = players[ndex];
	socket.emit('join_game', {'you': ndex, 'map': mapArr, 'players': players});
	socket.broadcast.emit('new_player', {'ndex': ndex, 'player': new_player});

	socket.on('name_change', function(data){
		player = findPlayer(socket);
		players[player].name = data.name;
		io.emit('new_name', {'ndex': player, 'name': data.name});
	});

	socket.on('movement_request', function(data){
		ndx = findPlayer(socket.id);
		if (mapArr[data.location[0]]==0){
			cls = players[ndx].location;
			mapArr[cls[0]] = 0;
			mapArr[data.location[0]] = socket.id;
			players[ndx].location = data.location;
			io.emit('player_move', {'ndex': ndx, 'location': data.location});
		} else {
			data.location[0] = players[ndx].location[0];
			io.emit('player_move', {'ndex': ndx, 'location': data.location});
			console.log('no move 3', data.location);
		}
	});

	socket.on('death', function(data){
		io.emit('player_move', {'ndex': data.player, 'location': -1});
		players[data.player] = -1;
	})

	socket.on('shots_fired', function(data){

		socket.broadcast.emit('shot_fired', data);
		var shot_location = data.shotStartPosition;
		console.log('shot_location', shot_location);
		var range = data.shotRange - 1;
		while (range >= 0) {
			if (shot_location<0 || shot_location>2499){
				break;
			}
			if (mapArr[shot_location] !== 0){
				// console.log('shot location', mapArr[shot_location],'----------------------')

				if (mapArr[shot_location] == 1){
					break;
				} else {
					target = mapArr[shot_location];
					console.log('target ID:', mapArr[shot_location]);
					target_ndx = findPlayer(target);
					console.log('target:', target_ndx);
					console.log('players', players);
					damage(target_ndx, data.type, data.shootingPlayerIndex);
					}
				}
			
			switch (data.shotFacing){
				case 0:
					shot_location = shot_location - 50;
					break;
				case 1:
					shot_location = shot_location + 1;
					break;
				case 2:
					shot_location = shot_location + 50;
					break;
				case 3:
					shot_location = shot_location - 1;
					break;
			}
			range=range-1;
		}
	});

	socket.on('disconnect', function(data)
	{
		ndx = findPlayer(socket.id);
		console.log('index:',ndx);
		cls = players[ndx].location;
		mapArr[cls[0]] = 0;
		players[ndx] = false;
	});
});


