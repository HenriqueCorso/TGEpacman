// Import necessary modules from TGE
import * as TGE from './engine/engine.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import { Box, Circle, Poly } from './engine/physics.js';
import { getJSON } from './engine/utils.js';
import { Player, Enum_PlayerMovement } from './engine/player.js';
import { Pacman } from './pacman.js'
import { Ghost } from './ghost.js';
import { Obstacle } from './obstacle.js'
import { Pellet } from './pellet.js';
import { map } from './myMap.js';
import { PowerUp } from './powerUp.js';
import { preloadImages } from './engine/utils.js';
import { Flipbook } from './engine/flipbook.js';

const Engine = TGE.Engine;


const tick = () => {
};


const main = async () => {
  await Engine.setup('./settings.hjson');

  // TODO: Define the game entities (player, enemies, obstacles)

  // Create the player
  const player = new Pacman();
  Engine.addActor(player);

  player.flags.isFlipbookEnabled = true;

  const fb = new Flipbook({ dims: V2(5, 5), actor: player });

  await fb.loadAsAtlas('img/pacmanMoving.png');

  fb.addSequence({ name: 'moving', startFrame: 0, endFrame: 17, loop: true });

  fb.play('moving');


  // Create the enemies (ghosts)
  const ghost = new Ghost(V2(350, 300));
  const ghost2 = new Ghost(V2(350, 300));

  Engine.addActor(ghost);
  Engine.addActor(ghost2);


  // Create the obstacles based on the Map
  const obstacles = [];
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 1) {
        const obstacleX = col * 50;
        const obstacleY = row * 50;
        const obstacle = new Obstacle(V2(obstacleX, obstacleY));
        Engine.addActor(obstacle); // Add the obstacle to the engine
        obstacles.push(obstacle);
      }
    }
  }

  // Create the pellets
  const pellets = [];
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 0) {
        const pelletX = col * 50; // Center X position of the pellet
        const pelletY = row * 50; // Center Y position of the pellet
        const pellet = new Pellet(V2(pelletX, pelletY));
        Engine.addActor(pellet); // Add the pellet to the engine
        pellets.push(pellet);
      }
    }
  }

  // Create the powerUP
  const powerUps = [];
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 2) {
        const powerUpX = col * 50; // Center X position of the powerUp
        const powerUpY = row * 50; // Center Y position of the powerUp
        const powerUP = new PowerUp(V2(powerUpX, powerUpY));
        Engine.addActor(powerUP); // Add the pellet to the engine
        powerUps.push(powerUP);
      }
    }
  }

  Engine.gameLoop.forActors(a => a.offset = V2(25, 25));

  Engine.gameLoop.tickRate = 120; // doubles the game speed
  // Start the game loop
  Engine.start(tick);

};

// Initialize the TGE engine and start the main function
Engine.init(main);