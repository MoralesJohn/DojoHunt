# DojoHunt
DojoHunt is a group project in JavaScript using Node, Express and websockets. The project was written by John Morales, John Pham and Chris Rollins at the Coding Dojo in San Jose, CA. 

The software takes its inspiration from BSD Hunt which has been around for decades. The copyright to that work is held by the Regents of the University of California. 

It should be said that this software was written from scratch. None of the code from the original Hunt game was used. The map, which is not generated, but is hardcoded as an array, was also created from scratch. Both the client and server were written in JavaScript, with no reference to BSD Hunt.

# The Game
When you join the game you will see the (imperfect) maze, and you are represented by a blue triangle. Any other players will be represented by red triangles. 

You start with three points of health, and do not die until you fall below 0 health. This happens when someone shoots you. Once you shoot, you cannot shoot again for 1 second. 

You can move with the arrow keys, or the W-A-S-D keys. You can also teleport 10 sqares straight ahead with the Z key. Even if you are unsuccessful (this happens when the target square is occupied), you cannot attempt another teleport for 10 seconds. 

To summarize the controls: 
- Move with the arrow keys or W-A-S-D.

- Shoot with the Space Bar.

- Teleport with Z

# Features to be fixed
- You cannot see the shots fired by other players.

- Issues with the canvas have forced us to use an inefficient method for drawing characters, which is far too taxing on the CPU. 

- Dying does not reload the page as intended. 

# Additional features planned
- Fog of war needs to be implemented to limit the opponents and maze visible to the player. This should be directional rather than radial. 

- Additional types of weapons. 

- Traps in the maze.

- Healing, either over time, or as health pick-ups. 

- Scoring and a stored scoreboard.

# Installation
You will need to have Nodejs and NPM installed and ready to go. Additionally, you will need Express, Mongoose and Socket.IO. 

The package.json exists, so using NPM will install the required packages. Body-parser will also be installed, as it is expected to be part of future features, but is not currently used. 

While the software does not actually use a database, the plans included storing a scoreboard in a mongo db, and the calls are already in place, so you will need to install mongo, and have the database available, though nothing should be written to it.

Happy coding!
