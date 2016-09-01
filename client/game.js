(function()
{	
	var script;
	var canvas;
	var ctx;
	var lastpos = [0, 0];
	var mouseIsDown = false;
	var mapArr = [];
	var blocksize = 13;
	var keysdown = {up: false, left: false, down: false, right: false};
	var background;
	var back_ctx;
	var charPos = [0,0];
	var mapOffset = 70;
	var moveLatency = 8;
	var localPlayer;
	
	function checkKeyCode(k)
	{
		switch(k)
			{
				case 87:
				case 38:
					return "up";
				case 65:
				case 37:
					return "left";
				case 83:
				case 40:
					return "down";
				case 68:
				case 39:
					return "right";
			}
		return "nokey";
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

	function makeMap(size, numBlocks)
	{
		var newMap = [];
		var i;
		var spot = Math.floor(Math.random()*size*size);
		var streak = 0;
		var streakSize = (Math.random()+0.1)*0.1*numBlocks;

		if(streakSize > 0.06*numBlocks)
			streakSize = Math.floor(0.06*numBlocks);

		for(i = 0; i < size*size; i++)
		{
			if(i < size || i >= (size*size - size) || i%size == 0 || i%(size) == (size-1) )
			{
				newMap[i] = true;
			}
			else
			{
				newMap[i] = false;
			}
		}

		for(i = 0; i < numBlocks; i++)
		{
			if(streak < streakSize)
			{
				streak++;
				spot++;
			}
			else
			{
				streak = 0;
				streakSize--;
				spot = Math.floor(Math.random()*size*size);
			}
			newMap[spot] = true;
		}

		return newMap;
	}

	function drawMap(map, x, y, blocksize)
	{
		var size = Math.sqrt(map.length);
		var drawY = x;
		var drawX = y;

		back_ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
		back_ctx.fillRect(x, y, size*blocksize, size*blocksize);

		back_ctx.fillStyle = "rgba(0, 0, 0, 1.0)";

		for(var i in map)
		{
			if(i%size == 0 && i >= size)
				drawY+=blocksize;
			if(map[i])
				back_ctx.fillRect(drawX + (i%size)*blocksize, drawY, blocksize, blocksize);
		}
	}

	function clearCanvas(c)
	{
		var pixels = c.getContext("2d").createImageData(canvas.width, canvas.height);
		c.getContext("2d").putImageData(pixels, 0, 0);
	}

	function Character(startX, startY, health, ammo)
	{
		var position = [0, 0]; //The getter returns an object {x: xval, y: yval}
		var facing = [1, 0];
		var name = "";
		var charCanvas = document.getElementById("localplayer_canvas");
		var charContext = charCanvas.getContext("2d");
		var health = health;
		var ammo = ammo;

		document.getElementById("gameContainer").appendChild(charCanvas);

		charCanvas.width = window.innerWidth;
		charCanvas.height = window.innerHeight;

		placeCharacter(startX, startY, true);

		this.busy = 0;

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
			return {x: position[0], y: position[1]};
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
				return "down";
			else if(facing[0] == 1 && facing[1] == 0)
				return "right";
			else if(facing[0] == 0 && facing[1] == -1)
				return "up";
			else if(facing[0] == -1 && facing[1] == 0)
				return "left";
		};

		//takes a string for a cardinal direction. "right", "up", "left", or "down"
		//an invalid input will not change the data, and it will console log an error.
		this.setFacing = function(newFacing)
		{
			switch(newFacing.toLowerCase())
			{
				case "right":
					facing = [1, 0];
					break;
				case "up":
					facing = [0, -1];
					break;
				case "left":
					facing = [-1, 0];
					break;
				case "down":
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
			
			if(mapArr[50*newY+newX] == false || ignoreCollision === true)
			{
				clearCanvas(charCanvas);

				position = [newX, newY];
				charContext.fillStyle = "rgba(0, 100, 255, 1.0)";
				charContext.fillRect(mapOffset + visualX, mapOffset + visualY, blocksize, blocksize);
				//send via socket: position as mapArr[50*newY+newX], and facing as string
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

			initEvents();

			mapArr = makeMap(50, 300);
			drawMap(mapArr, mapOffset, mapOffset, blocksize);

			localPlayer = new Character(1, 1);

			//game loop
			setInterval(function()
			{
				if(keysdown.up)
				{
					localPlayer.setFacing("up");
					localPlayer.moveForward();
				}
				if(keysdown.left)
				{
					localPlayer.setFacing("left");
					localPlayer.moveForward();
				}
				if(keysdown.down)
				{
					localPlayer.setFacing("down");
					localPlayer.moveForward();
				}
				if(keysdown.right)
				{
					localPlayer.setFacing("right");
					localPlayer.moveForward();
				}
				
				if(localPlayer.busy > 0)
				{
					localPlayer.busy--;
				}
				else
				{
					localPlayer.busy += moveLatency;
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