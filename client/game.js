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
	var mouseIsDown = false;
	var mapArr = [];
	var keysdown = [false, false, false, false, false];
	var charPos = [0,0];
	var localPlayer;
	var players = [];
	var socket;
	var waitingOnResources = true;

	//  map globals
	var blocksize = 14;
	var moveLatency = 8;
	var mapOffset = blocksize;

	//canvas vars, mostly get set in main
	var background;
	var back_ctx;
	var canvas;
	var ctx;

	const DIRECTION_UP = 0;
	const DIRECTION_RIGHT = 1;
	const DIRECTION_DOWN = 2;
	const DIRECTION_LEFT = 3;

	function socketEvents()
	{
		socket = io.connect();

		socket.on("join_game", function(data)
		{
			players = data.players;

			mapArr = data.map;

			var i = data.you;
			var p = players[i];
			var x = p.location[0] % 50;
			var y = Math.floor(p.location[0]/50);
			localPlayer = new Character(x, y, p.health, p.ammo, p.name, i);
		});

		socket.on("new_player", function(data)
		{
			players[data.ndex] = data.player;
		});

		socket.on("player_move", function(data)
		{
			loc = data.location;
			players[data.ndex].location = loc;

			//Player is the local player
			if(data.ndex == localPlayer.ndex)
			{
				console.log(localPlayer.getPosition());
				var x = data.location[0] % 50;
				var y = Math.floor(data.location[0]/50);
				localPlayer.setPosition([x, y]);
				localPlayer.render();
			}
			else //otherwise render it on the enemy player canvas
			{
				var x = (loc[0] % 50);
				var y = (Math.floor(loc[0]/50));
				var vx = (x * blocksize) - (x * blocksize)%blocksize;
				var vy = (y * blocksize) - (y * blocksize)%blocksize;
				clearCanvas(canvas);
				drawPlayer(vx, vy, "rgba(0, 100, 255, 1.0)", "rgba(255, 0, 0, 1.0)", ctx, data.ndex);
				mapArr[loc[0]] = -1;
			}
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

	function Character(startX, startY, health, ammo, name, ndex)
	{
		var position = [startX, startY];
		var facing = [1, 0];
		var name = name;
		var charCanvas = document.getElementById("localplayer_canvas");
		var charContext = charCanvas.getContext("2d");
		var health = health;
		var ammo = ammo;
		var that = this;

		document.getElementById("gameContainer").appendChild(charCanvas);

		charCanvas.width = window.innerWidth;
		charCanvas.height = window.innerHeight;
		clearCanvas(charCanvas);

		this.busy = 0;

		this.ndex = ndex;
		
		this.init = function()
		{
			//console.log(position);
			requestPosition(position[0], position[1]);
		};

		this.moveForward = function()
		{
			if(!this.busy)
			{
				var x = position[0] + facing[0];
				var y = position[1] + facing[1];
				requestPosition(x, y);
			}
		};

		this.getPosition = function()
		{
			return position;
		};

		this.setPosition = function(newPosition)
		{
			position = newPosition;
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

		this.render = function()
		{
			var visualX = (position[0] * blocksize) - (position[0] * blocksize)%blocksize;
			var visualY = (position[1] * blocksize) - (position[1] * blocksize)%blocksize;
			var size = Math.floor(Math.sqrt(mapArr.length));
			if(mapArr[size*position[1]+position[0]] == 0)
			{
				clearCanvas(charCanvas);

				// charContext.fillStyle = "rgba(0, 100, 255, 1.0)";
				// charContext.fillRect(mapOffset + visualX, mapOffset + visualY, blocksize, blocksize);
				drawPlayer(visualX, visualY, "rgba(0, 100, 255, 1.0)", "rgba(0, 100, 255, 1.0)", charContext, this.ndex);
			}
		};

		function requestPosition(newX, newY)
		{
			var visualX = (newX * blocksize) - (newX * blocksize)%blocksize;
			var visualY = (newY * blocksize) - (newY * blocksize)%blocksize;
			var tempX = visualX;
			var tempY = visualY;
			var size = Math.floor(Math.sqrt(mapArr.length));

			socket.emit("movement_request", {location: [size*newY+newX, localPlayer.getFacing()]}); 
			
			if(mapArr[size*newY+newX] === 0)
			{
				// console.log("movement request to:", {location: [size*newY+newX, localPlayer.getFacing()]});
				// socket.emit("movement_request", {location: [size*newY+newX, localPlayer.getFacing()]}); 
			}
			else
			{
				console.log("collision:", mapArr[size*newY+newX]);
				charContext.fillStyle = "rgba(255, 0, 0, 1.0)";
				charContext.fillRect(mapOffset + visualX, mapOffset + visualY, blocksize, blocksize);
				setTimeout(function()
				{
					that.render();
				},2000);
			}
		}
	}


	//Used by the render function and also drawing other players.
	//This function only provides the appearance of the player.
	function drawPlayer(x, y, outlineColor, fillColor, context, playerIndex)
	{
		if(outlineColor === undefined)
			outlineColor = "#000000";
		if(fillColor === undefined)
			fillColor = "rgba(0, 100, 255, 1.0)";

		var short = Math.floor(blocksize/3);
		var long = Math.floor(blocksize/2);

		x += mapOffset + Math.floor(blocksize/2);
		y += mapOffset + Math.floor(blocksize/2);

		var triangles =
		[
			[[x + short, y + long], [x, y - long], [x - short, y + long]],	//up
			[[x + long, y], [x - long, y - short], [x - long, y + short]],	//right
			[[x - short, y - long], [x, y+long], [x + short, y - long]],	//down
			[[x + long, y + short], [x - long, y], [x + long, y - short]]	//left
		]
		var t = triangles[players[playerIndex].location[1]];

		//context.strokeStyle = outlineColor;
		context.fillStyle = fillColor;

		context.beginPath();
		context.moveTo(t[0][0], t[0][1]);
		for(var p in t)
		{
			console.log(t[p][0], t[p][1]);
			context.lineTo(t[p][0], t[p][1]);
		}
		context.closePath();
		context.fill();
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
	}

	script = new Main();
	window.addEventListener( "load", script.start );

}());