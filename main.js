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
  Engine.addActor(player);

  player.flags.isFlipbookEnabled = true;

  const pacmanFB = new Flipbook({ dims: V2(4, 4), actor: player, fps: 10 });
  await pacmanFB.loadAsAtlas('img/pacmanMoving.png');
  pacmanFB.addSequence({ name: 'PacmanMoving', startFrame: 0, endFrame: 15, loop: true });
  pacmanFB.play('PacmanMoving');

  const pacmanDFB = new Flipbook({ dims: V2(5, 4), actor: player, fps: 10 });
  await pacmanDFB.loadAsAtlas('img/pacmanDead.png');
  pacmanDFB.addSequence({ name: 'PacmanDead', startFrame: 0, endFrame: 17, loop: false });
};

const createGhosts = async () => {
  const ghost = new Ghost(V2(350, 300));
  const ghost2 = new Ghost(V2(350, 300));

  Engine.addActor(ghost);
  Engine.addActor(ghost2);

  ghost.flags.isFlipbookEnabled = true;
  ghost2.flags.isFlipbookEnabled = true;

  const createGhostFlipbook = async (actor, atlas, sequenceName) => {
    const ghostFB = new Flipbook({ dims: V2(3, 3), actor, fps: 10 });
    await ghostFB.loadAsAtlas(atlas);
    ghostFB.addSequence({ name: sequenceName, startFrame: 0, endFrame: 7, loop: true });
    ghostFB.play(sequenceName);
  };

  await createGhostFlipbook(ghost, 'img/ghostMoving.png', 'GhostMoving');
  await createGhostFlipbook(ghost2, 'img/ghostMoving2.png', 'GhostMoving');


  const ghostFBS = new Flipbook({ dims: V2(3, 3), actor: ghost, fps: 10 });
  await ghostFBS.loadAsAtlas('img/ghostMovingScared.png');
  ghostFBS.addSequence({ name: 'ScaredGhostMoving', startFrame: 0, endFrame: 7, loop: true });

  const ghost2FBS = new Flipbook({ dims: V2(3, 3), actor: ghost2, fps: 10 });
  await ghost2FBS.loadAsAtlas('img/ghostMovingScared.png');
  ghost2FBS.addSequence({ name: 'ScaredGhostMoving', startFrame: 0, endFrame: 7, loop: true });
};



const createObstacles = () => {
  const obstacles = [];
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 1) {
        const obstacleX = col * 50;
        const obstacleY = row * 50;
        const obstacle = new Obstacle(V2(obstacleX, obstacleY));
        Engine.addActor(obstacle);
        obstacles.push(obstacle);
      }
    }
  }
};

const createPellets = () => {
  const pellets = [];
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 0) {
        const pelletX = col * 50;
        const pelletY = row * 50;
        const pellet = new Pellet(V2(pelletX, pelletY));
        Engine.addActor(pellet);
        pellets.push(pellet);
      }
    }
  }
};

const createPowerUps = () => {
  const powerUps = [];
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 2) {
        const powerUpX = col * 50;
        const powerUpY = row * 50;
        const powerUP = new PowerUp(V2(powerUpX, powerUpY));
        Engine.addActor(powerUP);
        powerUps.push(powerUP);
      }
    }
  }
};

const main = async () => {
  await Engine.setup('./settings.hjson');

  await createPacman();
  await createGhosts();
  createObstacles();
  createPellets();
  createPowerUps();

  Engine.gameLoop.forActors(a => a.offset = V2(25, 25));
  Engine.gameLoop.tickRate = 120;
  Engine.start(tick);
};

Engine.init(main);
