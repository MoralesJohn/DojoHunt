/*
game.js
Client side game engine for Dojo Hunt.
Written by Chris Rollins
*/

//Everything is inside this immediately invoked function in order to hide it from the browser DOM.
(function()
{	
	//globals
	var script;
	var canvas;
	var ctx;
	var lastpos = [0, 0];
	var mouseIsDown = false;
	var mapArr = [];
	var keysdown = [false, false, false, false, false];
	var background;
	var back_ctx;
	var charPos = [0,0];
	var localPlayer;
	var players = [];
	var socket;
	var waitingOnResources = true;

	//  map globals
	var blocksize = 13;
	var moveLatency = 8;
	var mapOffset = blocksize;

	const DIRECTION_UP = 0;
	const DIRECTION_RIGHT = 1;
	const DIRECTION_DOWN = 2;
	const DIRECTION_LEFT = 3;

	function socketEvents()
	{
		socket = io.connect();
		socket.on('test', function(data) {
			console.log('TEST');
			socket.emit('testing', {foo:'bar'});
		})
		socket.on("map", function(data)
		{
			console.log('map', data);
			mapArr = data.mapArr;
		});

		socket.on("all_players", function(data)
		{
			players = data.players;
		});

		socket.on("join_game", function(data)
		{
			var p = data.you;
			var x = p.location[0] % 50;
			var y = Math.floor(p.location[0]/50);
			localPlayer = new Character(x, y, p.health, p.ammo, p.name);
		});

		socket.on("new_player", function(data)
		{
			players[data[ndex]] = data.player;
		});

		socket.on("player_move", function(data)
		{
			players[data[ndex]].location = data.location;
		});

		socket.on("new_name", function(data)
		{
			players[data[ndex]].name = data.name;
		});
	}
	
	function checkKeyCode(k)
	{
		switch(k)
			{
				case 87:
				case 38:
					return DIRECTION_UP;
				case 65:
				case 37:
					return DIRECTION_LEFT;
				case 83:
				case 40:
					return DIRECTION_DOWN;
				case 68:
				case 39:
					return DIRECTION_RIGHT;
			}
		return 4;
	}

	function initEvents()
	{
		canvas.onmousedown = function(e)
		{
			mouseIsDown = true;
		};

		canvas.onmouseup = function(e)
		{
			mouseIsDown = false;
		};

		canvas.onmouseout = function(e)
		{
			mouseIsDown = false;
		};

		canvas.onmousemove = function(e)
		{

		};

		document.onkeydown = function(e)
		{
			//console.log(e.keyCode);
			keysdown[checkKeyCode(e.keyCode)] = true; 
		}

		document.onkeyup = function(e)
		{
			keysdown[checkKeyCode(e.keyCode)] = false; 
		}
	}

	function drawMap(map, placementOffset, blocksize)
	{
		var size = Math.sqrt(map.length);
		var drawY = placementOffset;
		var drawX = placementOffset;

		back_ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
		back_ctx.fillRect(placementOffset, placementOffset, size*blocksize, size*blocksize);

		back_ctx.fillStyle = "rgba(0, 0, 0, 1.0)";

		for(var i in map)
		{
			if(i%size == 0 && i >= size)
				drawY+=blocksize;
			if(map[i] === 1)
				back_ctx.fillRect(drawX + (i%size)*blocksize, drawY, blocksize, blocksize);
		}
	}

	function clearCanvas(c)
	{
		var pixels = c.getContext("2d").createImageData(canvas.width, canvas.height);
		c.getContext("2d").putImageData(pixels, 0, 0);
	}

	function Character(startX, startY, health, ammo, name)
	{
		var position = [startX, startY]; //The getter returns an object {x: xval, y: yval}
		var facing = [1, 0];
		var name = name;
		var charCanvas = document.getElementById("localplayer_canvas");
		var charContext = charCanvas.getContext("2d");
		var health = health;
		var ammo = ammo;

		document.getElementById("gameContainer").appendChild(charCanvas);

		charCanvas.width = window.innerWidth;
		charCanvas.height = window.innerHeight;
		clearCanvas(charCanvas);

		this.busy = 0;
		
		this.init = function()
		{
			console.log(position);
			placeCharacter(position[0], position[1], true);
		};

		this.moveForward = function()
		{
			if(!this.busy)
			{
				var x = position[0] + facing[0];
				var y = position[1] + facing[1];
				placeCharacter(x, y, false);
			}
		};

		this.getPosition = function()
		{
			return position;
		};

		this.getName = function()
		{
			return name;
		};

		this.setName = function(newName)
		{
			name = newName;
		};

		this.getFacing = function()
		{
			if(facing[0] == 0 && facing[1] == 1)
				return DIRECTION_DOWN;
			else if(facing[0] == 1 && facing[1] == 0)
				return DIRECTION_RIGHT;
			else if(facing[0] == 0 && facing[1] == -1)
				return DIRECTION_UP;
			else if(facing[0] == -1 && facing[1] == 0)
				return DIRECTION_LEFT;
		};

		this.setFacing = function(newFacing)
		{
			switch(newFacing)
			{
				case DIRECTION_RIGHT:
					facing = [1, 0];
					break;
				case DIRECTION_UP:
					facing = [0, -1];
					break;
				case DIRECTION_LEFT:
					facing = [-1, 0];
					break;
				case DIRECTION_DOWN:
					facing = [0, 1];
					break;
			}
		};

		function placeCharacter(newX, newY, ignoreCollision)
		{
			var visualX = (newX * blocksize) - (newX * blocksize)%blocksize;
			var visualY = (newY * blocksize) - (newY * blocksize)%blocksize;
			var tempX = visualX;
			var tempY = visualY;

			if(ignoreCollision === undefined)
			{
				ignoreCollision = false;
			}
			
			if(mapArr[50*newY+newX] == 0 || ignoreCollision === true)
			{
				clearCanvas(charCanvas);

				position = [newX, newY];
				charContext.fillStyle = "rgba(0, 100, 255, 1.0)";
				charContext.fillRect(mapOffset + visualX, mapOffset + visualY, blocksize, blocksize);

				socket.emit("movement_request", {location: [50*newY+newX, localPlayer.getFacing()]}); 
			}
			else
			{
				charContext.fillStyle = "rgba(255, 0, 0, 1.0)";
				charContext.fillRect(mapOffset + visualX, mapOffset + visualY, blocksize, blocksize);
				setTimeout(function(){clearCanvas(charCanvas); placeCharacter(position[0], position[1], true)},2000);
			}
		}
	}

	function Main()
	{
		this.start = function()
		{
			canvas = document.getElementById("otherplayers_canvas");
			ctx = canvas.getContext("2d");

			background = document.getElementById("background_canvas");
			back_ctx = background.getContext("2d");

			background.width = window.innerWidth;
			background.height = window.innerHeight;

			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			ctx.strokeStyle = "#000000";
			ctx.fillStyle = "#000000";
			back_ctx.strokeStyle = "#000000";
			back_ctx.fillStyle = "#000000";

			//Register all the events after setting up canvases
			initEvents();
			
			//Initiate the socket connection and set up socket events after setting up all the local stuff
			socketEvents();

			//game loop
			var delay;
			setInterval(function()
			{
				if(waitingOnResources)
				{
					if(localPlayer !== undefined && mapArr.length > 0)
					{
						drawMap(mapArr, mapOffset, blocksize);
						localPlayer.init();
						waitingOnResources = false;
					}
				}
				else
				{
					delay = 0;
					for(var direction = 0; direction < 4; direction++)
					{
						if(keysdown[direction])
						{
							localPlayer.setFacing(direction);
							localPlayer.moveForward();
							delay += moveLatency;
						}
					}
				
					if(localPlayer.busy > 0)
					{
						localPlayer.busy--;
					}
					else
					{
						localPlayer.busy += delay;
					}
				}
			}, 10);
		}

		this.drawPixel = function(x, y, color)
		{
			newPixel = ctx.createImageData(1, 1);
			newPixel.data[3] = 255;
			ctx.putImageData(newPixel, x, y);
		}

		this.drawLine = function(x1, y1, x2, y2, color)
		{
			if(color === undefined)
				color = "#000000";

			ctx.strokeStyle = color;

			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.closePath();
			ctx.stroke();
		}
	}

	script = new Main();
	window.addEventListener( "load", script.start );

}());