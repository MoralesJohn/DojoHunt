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
app.get('/', function(req, res) {
	res.redirect("/game.html");
});
app.listen(8000, function(){
	console.log('DojoHunt listening port 8000.....');
});

io.sockets.on('connection', function(socket){
	players.push(PlayerConstructor(socket.id));
	socket.emit('map', {'mapArr': mapArr});
	socket.emit('all_players', {'players': players});
	var ndex = players.length-1;
	var new_player = players[ndex];
	socket.emit('join_game', {'you': new_player});
	socket.broadcast.emit('new_player', {'ndex': ndex, 'player': new_player});
});

io.sockets.on('name_change', function(data, socket){
	player = findPlayer(socket);
	players[player].name = data.name;
	io.emit('new_name', {'ndex': player, 'name': data.name});
});

io.sockets.on('movement_request', function(data, socket){
	player = findPlayer(socket);
	if (mapArr[data.location[0]]=0){
		mapArr[players[player].location[0]] = 0;
		mapArr[data.location[0]] = -1;
		players[player].location = data.location;
		io.emit('player_move', {'ndex': player, 'location': data.location});
	}
});

require('./server/gameback.js');
