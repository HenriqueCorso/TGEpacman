import * as TGE from './engine/engine.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import { Pacman } from './pacman.js'
import { Ghost } from './ghost.js';
import { isTileFree } from './pacman-utils.js';
import { TileMap } from './engine/tileMap.js';
import { Obstacle } from './obstacle.js';
import { Pellet } from './pellet.js';
import { PowerUp } from './powerUp.js';
import { InitAudio } from './engine/audio.js';

const Engine = TGE.Engine;

const tick = () => {

};

const createPacman = async () => {
  const player = new Pacman();

  await player.init();
};

const createGhosts = async (mapName) => {
  if (mapName == 'level1.hjson') {
    const ghost = new Ghost(V2(250, 300));
    const ghost2 = new Ghost(V2(250, 300));

    await ghost.init('img/ghostMoving.png');
    await ghost2.init('img/ghostMoving2.png');

  } else if (mapName == 'level2.hjson') {
    const ghost = new Ghost(V2(450, 300));
    const ghost2 = new Ghost(V2(450, 300));
    const ghost3 = new Ghost(V2(450, 300));

    await ghost.init('img/ghostMoving.png');
    await ghost2.init('img/ghostMoving2.png');
    await ghost3.init('img/ghostMoving3.png');
  }
};

function createMap() {

  Engine.gameLoop.data.tileSize = 50;

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

export const loadMap = async (mapPath) => {


  Engine.gameLoop.clear();

  const { map } = await TileMap.LoadFromFile({ url: mapPath });
  map.createMap = createMap;
  map.isTileFree = isTileFree;

  Engine.gameLoop.data.map = map;
  Engine.gameLoop.data.url = mapPath

  await map.createMap();

  await createPacman();
  await createGhosts(mapPath); // Pass the map name to createGhosts

  Engine.gameLoop.forActors(a => a.offset = V2(25, 25));
  Engine.gameLoop.add('custom', { update, zIndex: 2 });

}



const update = () => {
  const player = Engine.gameLoop.findActorByName('pacman');
  const pellet = Engine.gameLoop.findActorByName('pellet');


  let score = pellet.data.score
  let lives = player.data.lives

  Engine.renderingSurface.resetTransform();

  // Display score
  Engine.renderingSurface.textOut(V2(10, 20), `Score: ${score}`, {
    color: 'white',
    font: '20px Arial',
  });

  // Display lives
  Engine.renderingSurface.textOut(V2(200, 20), `Lives: ${lives}`, {
    color: 'white',
    font: '20px Arial',
  });
}


// Add the custom score layer to the GameLoop with the appropriate zIndex



const main = async () => {
  await Engine.setup('./settings.hjson');

  const audio = InitAudio(Engine);
  const data = await audio.loadFromFile('./sfx/sounds.hjson');
  await audio.addBunch(data);
  const start = await audio.spawn('start', true);

  await loadMap('level1.hjson'); // Load the initial map

  Engine.gameLoop.tickRate = 120;
  Engine.start(tick);


};


Engine.init(main);
