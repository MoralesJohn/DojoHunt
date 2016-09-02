/*
game.js
Client side game engine for Dojo Hunt.
Written by Chris Rollins
*/


(function()
{	
	//globals
	var script;
	var mouseIsDown = false;
	var mapArr = [];
	var keysdown = [false, false, false, false, false];
	var localPlayer;
	var players = [];
	var positionPlayers = [];
	var socket;
	var waitingOnResources = true;
	var deathTimer = 3000;

	//  map globals
	var blocksize = 14;
	var moveLatency = 8;
	var mapOffset = blocksize;

	//canvas vars, mostly get set in main
	var background;
	var back_ctx;
	var canvas;
	var ctx;
	var effectsCanvas;
	var effects_ctx;

	const DIRECTION_UP = 0;
	const DIRECTION_RIGHT = 1;
	const DIRECTION_DOWN = 2;
	const DIRECTION_LEFT = 3;

	const POWER_BASIC_SHOT = 4;
	const POWER_TELEPORT = 5;
	const CUSTOM_POWER_1 = 6;
	const CUSTOM_POWER_2 = 7;
	const CUSTOM_POWER_3 = 8;
	const CUSTOM_POWER_4 = 9;
	const CUSTOM_POWER_5 = 10;
	const CUSTOM_POWER_6 = 11;

	function socketEvents()
	{
		socket = io.connect();

		socket.on("join_game", function(data)
		{
			players = data.players;

			mapArr = data.map;

			var i = data.you;
			var p = players[i];
			// var x = p.location[0] % 50;
			// var y = Math.floor(p.location[0]/50);
			var point = mapArrIndexToPoint(p.location[0]);
			localPlayer = new Character(point[0], point[1], p.health, p.ammo, p.name, i);
		});

		socket.on("new_player", function(data)
		{
			var loc;
			var p;
			var vx;
			var vy;
			clearCanvas(canvas);
			for(var i in players)
			{
				if(players[i].dead !== true)
				{
					loc = players[i].location;
					p = mapArrIndexToPoint(loc[0]);
					vx = (p[0] * blocksize) - (p[0] * blocksize)%blocksize;
					vy = (p[1] * blocksize) - (p[1] * blocksize)%blocksize;
					drawPlayer(vx, vy, "rgba(0, 100, 255, 1.0)", "rgba(255, 0, 0, 1.0)", ctx, i);
				}
			}
			players[data.ndex] = data.player;
		});

		socket.on("player_move", function(data)
		{
			var loc;
			var oldloc;
			loc = data.location;
			oldloc = players[data.ndex].location[0];
			positionPlayers[oldloc] = 0;
			positionPlayers[loc[0]] = players[data.ndex];
			players[data.ndex].location = loc;

			//Player is the local player
			if(data.ndex == localPlayer.ndex)
			{
				var point = mapArrIndexToPoint(loc[0]);
				localPlayer.setPosition([point[0], point[1]]);
				localPlayer.render();
			}
			else //otherwise render it on the enemy player canvas
			{
				var p = mapArrIndexToPoint(loc[0]);
				var vx = (p[0] * blocksize) - (p[0] * blocksize)%blocksize;
				var vy = (p[1] * blocksize) - (p[1] * blocksize)%blocksize;
				clearCanvas(canvas);
				for(var i in players)
				{
					if(players[i].dead !== true)
					{
						loc = players[i].location;
						p = mapArrIndexToPoint(loc[0]);
						vx = (p[0] * blocksize) - (p[0] * blocksize)%blocksize;
						vy = (p[1] * blocksize) - (p[1] * blocksize)%blocksize;
						drawPlayer(vx, vy, "rgba(0, 100, 255, 1.0)", "rgba(255, 0, 0, 1.0)", ctx, i);
					}
				}
			}

		});

		socket.on("shot_fired", function(data)
		{
			//{shootingPlayerIndex: this.ndex, shotStartPosition: pointToMapArrIndex(from), shotRange: range, shotFacing: ff, type: powerType}
			var p;
			var pp = mapArrIndexToPoint(p);
			pp[0] = pp[0] * blocksize + mapOffset;
			pp[1] = pp[1] * blocksize + mapOffset;
			var f;
			var ff;
			switch(f)
			{
				case DIRECTION_RIGHT:
					ff = [1, 0];
					break;
				case DIRECTION_UP:
					ff = [0, -1];
					break;
				case DIRECTION_LEFT:
					ff = [-1, 0];
					break;
				case DIRECTION_DOWN:
					ff = [0, 1];
					break;
			}

			localPlayer.powerVisualFunctions[data.type](pp, ff);
		});

		socket.on("successful_attack", function(data)
		{
			//{'ndex': target_ndx, 'damage': 1, 'shooter': shooter}
			var isDead = false;
			if(data.ndex === localPlayer.ndex)
			{
				isDead = localPlayer.injure(data.damage);
			}
		});

		socket.on("death", function(data)
		{
			players[data.ndex].dead = true;
			var loc;
			var p;
			var vx;
			var vy;
			clearCanvas(canvas);
			for(var i in players)
			{
				if(players[i].dead !== true)
				{
					loc = players[i].location;
					p = mapArrIndexToPoint(loc[0]);
					vx = (p[0] * blocksize) - (p[0] * blocksize)%blocksize;
					vy = (p[1] * blocksize) - (p[1] * blocksize)%blocksize;
					drawPlayer(vx, vy, "rgba(0, 100, 255, 1.0)", "rgba(255, 0, 0, 1.0)", ctx, i);
				}
			}
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
				case 32:
					return POWER_BASIC_SHOT;
				case 90:
					return POWER_TELEPORT;
				case 88:
					return CUSTOM_POWER_1;
				case 67:
					return CUSTOM_POWER_2;
				case 86:
					return CUSTOM_POWER_3;
				case 66:
					return CUSTOM_POWER_4;
				case 78:
					return CUSTOM_POWER_5;
				case 77:
					return CUSTOM_POWER_6;
			}
		return -1;
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

	//takes an array [x, y] as a point and returns the corresponding index in the map array
	function pointToMapArrIndex(point)
	{	
		var size = Math.floor(Math.sqrt(mapArr.length));
		//size*newY+newX
		return (point[1] * size + point[0]);
	}

	function mapArrIndexToPoint(index)
	{
		var size = Math.floor(Math.sqrt(mapArr.length));
		var x = (index % size);
		var y = (Math.floor(index/size));
		return [x, y];
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
		var me = this;

		document.getElementById("gameContainer").appendChild(charCanvas);

		charCanvas.width = window.innerWidth;
		charCanvas.height = window.innerHeight;
		clearCanvas(charCanvas);

		this.lockMovement = 0;

		this.ndex = ndex;

		this.dead = false;
		
		this.init = function()
		{
			//console.log(position);
			requestPosition(position[0], position[1]);
		};

		this.getHealth = function()
		{
			return health;
		}

		this.injure = function(dmg)
		{
			health-=dmg;
			var arr = ["1px", "40px", "80px", "120px"];
			var str = arr[health];
			var color;
			var dead = false;

			if(health < 0)
			{
				document.getElementById("dead").innerHTML = "YOU DIED";
				str = "0px";
				dead = true;
				this.dead = true;
				socket.emit("death", {player: this.ndex});
			}

			document.getElementById("healthbar-inner").style.width = str;

			return dead;
		}

		this.moveForward = function()
		{
			if(!this.lockMovement)
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

		this.getRawFacing = function()
		{
			return facing;
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

		//renders the local player on the canvas
		this.render = function()
		{
			var visualX = (position[0] * blocksize) - (position[0] * blocksize)%blocksize;
			var visualY = (position[1] * blocksize) - (position[1] * blocksize)%blocksize;
			var size = Math.floor(Math.sqrt(mapArr.length));
			if(this.dead === false)
			{
				clearCanvas(charCanvas);
				drawPlayer(visualX, visualY, "rgba(0, 100, 255, 1.0)", "rgba(0, 100, 255, 1.0)", charContext, this.ndex);
			}
		};

		//A building block for any damaging attack power.
		//The simplest use is just an instant line attack
		//However, this function can be called multiple times using loops along with conditionals and delays to create unique powers.
		//takes array [x2, y2] for from and a number for range
		//power type only affects visuals. leave blank for default shot.
		this.attack = function(from, range, f, powerType)
		{
			if(facing === undefined)
				f = facing;
			if(powerType === undefined)
				powerType = 0;

			var ff;

			if(f[0] == 0 && f[1] == 1)
				ff = DIRECTION_DOWN;
			else if(f[0] == 1 && f[1] == 0)
				ff = DIRECTION_RIGHT;
			else if(f[0] == 0 && f[1] == -1)
				ff = DIRECTION_UP;
			else if(f[0] == -1 && f[1] == 0)
				ff = DIRECTION_LEFT;

			socket.emit("shots_fired", {shootingPlayerIndex: this.ndex, shotStartPosition: pointToMapArrIndex(from), shotRange: range, shotFacing: ff, type: powerType});
		};

		//uh its complicated lol
		this.powers =
		[
		{power: function()
			{var thisPower = me.powers[0];
				if(thisPower.countdown == thisPower.cooldown && me.lockMovement == 0)
				{
					me.moveForward();
				}
			}, countdown: 0, cooldown: 1},
		{power: function()
			{var thisPower = me.powers[1];
				if(thisPower.countdown == thisPower.cooldown && me.lockMovement == 0)
				{
					me.moveForward();
				}
			}, countdown: 0, cooldown: 1},
		{power: function()
			{var thisPower = me.powers[2];
				if(thisPower.countdown == thisPower.cooldown && me.lockMovement == 0)
				{
					me.moveForward();
				}
			}, countdown: 0, cooldown: 1},
		{power: function()
			{var thisPower = me.powers[3];
				if(thisPower.countdown == thisPower.cooldown && me.lockMovement == 0)
				{
					me.moveForward();
				}
			}, countdown: 0, cooldown: 1},
			
			//basic shot
			//A simple ranged shot. An example of how the attack method can be used.
			{
				power: function()
				{
					var thisPower = me.powers[POWER_BASIC_SHOT];
					var shotProgress = 100 - thisPower.countdown;
					var newpos;
					if(thisPower.countdown%10 == 0)
						document.getElementById("cdstatus1").innerHTML = thisPower.countdown/100;
					if(thisPower.countdown === thisPower.cooldown)
					{
						thisPower.originalLoc = me.getPosition();
						thisPower.originalFacing = me.getRawFacing();
						thisPower.terminate = false;
					}
					else if(thisPower.countdown > 80 && thisPower.terminate === false)
					{
						newpos = [thisPower.originalLoc[0] + thisPower.originalFacing[0]*shotProgress, thisPower.originalLoc[1] + thisPower.originalFacing[1]*shotProgress];
						if(mapArr[pointToMapArrIndex(newpos)] !== 1)
						{
							me.powerVisualFunctions[POWER_BASIC_SHOT](thisPower.originalLoc, [thisPower.originalFacing[0] * shotProgress, thisPower.originalFacing[1] * shotProgress] );
							me.attack(newpos, 1, thisPower.originalFacing);
						}
						else
						{
							thisPower.terminate = true;
						}
					}
					else if(thisPower.countdown === 1)
					{
						document.getElementById("cdstatus1").innerHTML = "ready";
					}
				},
				countdown: 0, cooldown: 100, originalLoc: [0,0], originalFacing: [0,1], terminate: false
			},

			//teleport
			{
				power: function()
				{
					var thisPower = me.powers[POWER_TELEPORT];
					if(thisPower.countdown%10 == 0)
						document.getElementById("cdstatus2").innerHTML = thisPower.countdown/100;
					if(thisPower.countdown === thisPower.cooldown)
					{
						var x = position[0] + facing[0]*10;
						var y = position[1] + facing[1]*10;
						requestPosition(x, y);
					}
					else if(thisPower.countdown === 1)
					{
						document.getElementById("cdstatus2").innerHTML = "ready";
					}
				},
				countdown: 0, cooldown: 1000
			}

		];

		this.powerVisualFunctions =
		[undefined, undefined, undefined, undefined,

			function basicShotVisualEffect(p, f)
			{
				effects_ctx.fillStyle = "rgba(255, 0, 0, 1.0)";
				effects_ctx.fillRect(mapOffset + (p[0] + f[0]) * blocksize + Math.floor(blocksize/4), mapOffset + (p[1] + f[1]) * blocksize + Math.floor(blocksize/4), Math.floor(blocksize/2), Math.floor(blocksize/2));
				setTimeout(function()
				{
					effects_ctx.clearRect(mapOffset + (p[0] + f[0]) * blocksize + Math.floor(blocksize/4), mapOffset + (p[1] + f[1]) * blocksize + Math.floor(blocksize/4), blocksize, blocksize);
				},100);
			}
		];

		//requests any position from the server
		function requestPosition(newX, newY)
		{
			var visualX = (newX * blocksize) - (newX * blocksize)%blocksize;
			var visualY = (newY * blocksize) - (newY * blocksize)%blocksize;
			var tempX = visualX;
			var tempY = visualY;
			var size = Math.floor(Math.sqrt(mapArr.length));

			socket.emit("movement_request", {location: [size*newY+newX, localPlayer.getFacing()]}); 
			
			if(mapArr[size*newY+newX] === 1)
			{
				effects_ctx.fillStyle = "rgba(255, 0, 0, 1.0)";
				effects_ctx.fillRect(mapOffset + visualX, mapOffset + visualY, blocksize, blocksize);
				setTimeout(function()
				{
					effects_ctx.clearRect(mapOffset + visualX, mapOffset + visualY, blocksize, blocksize);
				},100);
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

			effectsCanvas = document.getElementById("effects_canvas");
			effects_ctx = effectsCanvas.getContext("2d");

			effectsCanvas.width = window.innerWidth;
			effectsCanvas.height = window.innerHeight;

			background.width = window.innerWidth;
			background.height = window.innerHeight;

			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			ctx.strokeStyle = "#000000";
			ctx.fillStyle = "#000000";
			back_ctx.strokeStyle = "#000000";
			back_ctx.fillStyle = "#000000";
			effects_ctx.strokeStyle = "#000000";
			effects_ctx.fillStyle = "#000000";

			//Register all the events after setting up canvases
			initEvents();
			
			//Initiate the socket connection and set up socket events after setting up all the local stuff
			socketEvents();



			//game loop
			var delay;
			var pobj;
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
				else if(localPlayer.dead === false)
				{
					delay = 0;
					for(var i = 0; i < 11; i++)
					{
						pobj = localPlayer.powers[i];
						if(keysdown[i])
						{
							if(i < 4)
							{
								localPlayer.setFacing(i);
								//localPlayer.moveForward();
								delay += moveLatency;
							}
							if(pobj.countdown === 0)
							{
								pobj.countdown = pobj.cooldown;
							}
						}

						if(pobj !== undefined)
						{
							if(pobj.countdown > 0)
							{
								pobj.power();
								pobj.countdown--;
							}
						}
					}
					pobj = undefined;
				
					if(localPlayer.lockMovement > 0)
					{
						localPlayer.lockMovement--;
					}
					else
					{
						localPlayer.lockMovement += delay;
					}
				}
				else //player is dead
				{
					if(deathTimer%100 == 0)
					{
						document.getElementById("deadcd").innerHTML = deathTimer/100;
					}
					deathTimer--;
					if(deathTimer < 1)
						window.location.reload(true);
				}
			}, 10);
		}
	}

	script = new Main();
	window.addEventListener( "load", script.start );
}());