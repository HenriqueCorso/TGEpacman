import * as TGE from './engine/engine.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import { Pacman } from './pacman.js'
import { Ghost } from './ghost.js';
import { Obstacle } from './obstacle.js'
import { Pellet } from './pellet.js';
import { PowerUp } from './powerUp.js';
import { TileMap } from './engine/tileMap.js';
import { MyMap } from './myMap.js';

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


const main = async () => {
  await Engine.setup('./settings.hjson');

  await createPacman();
  await createGhosts();


  const myMap = new MyMap();
  await myMap.createMap();

  Engine.gameLoop.forActors(a => a.offset = V2(25, 25));

  Engine.gameLoop.tickRate = 120;
  Engine.start(tick);

};


Engine.init(main);
