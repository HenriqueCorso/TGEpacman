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


const createPacman = async () => {
  const player = new Pacman();

  await player.init();
};

const createGhosts = async () => {
  const ghost = new Ghost(V2(350, 300));
  const ghost2 = new Ghost(V2(350, 300));

  await ghost.init('img/ghostMoving.png');
  await ghost2.init('img/ghostMoving2.png');
};



const createMap = () => {
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      const position = V2(col * 50, row * 50);
      const tileContent = map[row][col];

      switch (tileContent) {
        case 1: // Obstacle
          const obstacle = new Obstacle(position);
          Engine.addActor(obstacle);
          break;
        case 0: // Pellet
          const pellet = new Pellet(position);
          Engine.addActor(pellet);
          break;
        case 2: // PowerUp
          const powerUp = new PowerUp(position);
          Engine.addActor(powerUp);
          break;
        // Add more cases for other tile content types, if needed
      }
    }
  }
};

const main = async () => {
  await Engine.setup('./settings.hjson');

  await createPacman();
  await createGhosts();
  createMap();

  Engine.gameLoop.forActors(a => a.offset = V2(25, 25));
  Engine.gameLoop.tickRate = 120;
  Engine.start(tick);
};

Engine.init(main);
