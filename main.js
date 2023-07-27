import * as TGE from './engine/engine.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import { Pacman } from './pacman.js'
import { Ghost } from './ghost.js';
import { isTileFree } from './pacman-utils.js';
import { TileMap } from './engine/tileMap.js';
import { Obstacle } from './obstacle.js';
import { Pellet } from './pellet.js';
import { PowerUp } from './powerUp.js';

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

function createMap() {
  // Load the map data from level1.hjson

  const tileSize = 50;

  // Loop through the rows and columns of the tilemap
  for (let row = 0; row < this.height; row++) {
    for (let col = 0; col < this.width; col++) {
      const tileValue = this.tileAt(col, row); // Get the tile value from the TileMap instance

      const position = V2(col * tileSize, row * tileSize);

      let actor = null; // Define a variable to hold the actor

      switch (tileValue) {
        case 1: // Obstacle
          actor = new Obstacle(position);
          break;
        case 0: // Pellet
          actor = new Pellet(position);
          break;
        case 2: // PowerUp 
          actor = new PowerUp(position);
          break;
      }

      Engine.addActor(actor); // Add the actor to the engine

    }
  }
}

const main = async () => {
  await Engine.setup('./settings.hjson');


  const { map } = await TileMap.LoadFromFile({ url: './level1.hjson' });
  map.createMap = createMap;
  map.isTileFree = isTileFree;

  map.createMap();


  Engine.gameLoop.data.map = map;


  await createPacman();
  await createGhosts();


  Engine.gameLoop.forActors(a => a.offset = V2(25, 25));

  Engine.gameLoop.tickRate = 120;
  Engine.start(tick);

};


Engine.init(main);
