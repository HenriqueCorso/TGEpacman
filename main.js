import * as TGE from './engine/engine.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import { Pacman } from './pacman.js'
import { Ghost } from './ghost.js';
import { Obstacle } from './obstacle.js'
import { Pellet } from './pellet.js';
import { PowerUp } from './powerUp.js';
import { TileMap } from './engine/tileMap.js';


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

const createMap = async () => {
  // Load the map data from level1.hjson
  const { map } = await TileMap.LoadFromFile({ url: './level1.hjson' });

  const tileSize = 50;

  // Loop through the rows and columns of the tilemap
  for (let row = 0; row < map.height; row++) {
    for (let col = 0; col < map.width; col++) {
      const tileValue = map.tileAt(col, row); // Get the tile value from the TileMap instance

      const position = V2(col * tileSize + 25, row * tileSize + 25);

      switch (tileValue) {
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
