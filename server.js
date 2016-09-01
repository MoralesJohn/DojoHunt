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

io.sockets.on('connection', function(socket){
	players.push(PlayerConstructor(socket.id));
	io.emit('map', {'mapArr': mapArr});
	io.emit('all_players', {'players': players});
	io.emit('new_player', player);
});

io.sockets.on('name_change', function(socket){
	player = findPlayer(socket);
	io.emit('new_name', player);
});

io.sockets.on('movement_request', function(data, socket){
	player = findPlayer(socket);
	if (mapArr[data.location[0]]=0){
		mapArr[player.location[0]] = 0;
		mapArr[data.location[0]] = -1;
		player.location = data.location;
		io.emit('player_move', player);
	}
});
app.listen(8000, function(){
	console.log('DojoHunt listening port 8000.....');
});

require('./server/gameback.js');
