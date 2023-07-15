// Import necessary modules from TGE
import * as TGE from './engine/engine.js';
import { Vector2 } from './engine/types.js';
import { Box, Circle, Poly } from './engine/physics.js';
import { getJSON } from './engine/utils.js';


const Engine = TGE.Engine;

// Function to create the player
const createPlayer = () => {
  const player = Engine.addActor('player', {
    hasColliders: true,
    imgUrl: 'img/pacman.jpg',
    scale: 0.2,
    position: new Vector2(150, 300),
  });
  const circlePlayer = new Circle(new Vector2(0, 0), 100);
  player.colliders.add(circlePlayer);
  player.attachKeyboard();
  player.setCollisionResponse('WorldDynamic', TGE.Enum_HitTestMode.Overlap);


  return player;
};

// Function to create a ghost enemy
const createGhost = (position) => {
  const ghost = Engine.addActor('enemy', {
    hasColliders: true,
    imgUrl: 'img/ghost.png',
    scale: 0.2,
    position: position,
  });

  const circleGhost = new Circle(new Vector2(0, 0), 100);
  ghost.colliders.add(circleGhost);
  ghost.setCollisionResponse('Enemy', TGE.Enum_HitTestMode.Overlap);

  return ghost;
};

// Function to create an obstacle
const createObstacle = (position) => {
  const obstacle = Engine.addActor('obstacle', {
    hasColliders: true,
    imgUrl: 'img/block.png',
    scale: 1,
    position: position,
  });

  // Create collision box for the obstacle
  const boxObstacle = new Box(new Vector2(0, 0), new Vector2(50, 50));
  obstacle.colliders.add(boxObstacle);
  obstacle.setCollisionResponse('Obstacle', TGE.Enum_HitTestMode.Overlap);
  obstacle.events.add('beginoverlap', e => {
    // do something when player overlaps
    // the event object contains reference to both parties of the overlap
    console.log('WallTouch');
  });

  return obstacle;
};

// Function to create a pellet
const createPellet = (position) => {
  const pellet = Engine.addActor('enemy', {
    hasColliders: true,
    imgUrl: 'img/pellet.png',
    scale: 0.05,
    position: position,
  });

  // Create collision circle for the pellet
  const circlePellet = new Circle(new Vector2(0, 0), 10);
  pellet.colliders.add(circlePellet);
  pellet.setCollisionResponse('Enemy', TGE.Enum_HitTestMode.Overlap);
  pellet.events.add('beginoverlap', e => {
    // Remove the pellet when the player overlaps with it
    pellet.destroy();
    console.log('Pellet collected');
  });

  return pellet;
};


const tick = (player, enemy) => {
  Engine.renderingSurface.resetTransform();
  Engine.renderingSurface.clear();

  // Update player's position based on user input
  const keys = player.controllers['keyboard'].keyState;
  if (keys.left) player.position.x -= 2;
  if (keys.right) player.position.x += 2;
  if (keys.up) player.position.y -= 2;
  if (keys.down) player.position.y += 2;

  // TODO: Implement game logic here
  // Check for overlap between player and enemy
  if (player.overlapsWith(enemy)) {
    console.log('DEAD!');
    // Perform actions or logic when there is an overlap
  }


  // TODO: Render the game entities
};


const main = async () => {

  // Set up the game environment
  Engine.setRootElement('game');
  Engine.createRenderingSurface();

  Engine.gameLoop.flags.collisionsEnabled = true;
  Engine.gameLoop.flags.showColliders = true; // turn off later

  // TODO: Define the game entities (player, enemies, obstacles)

  // Create the player
  const player = createPlayer();

  // Create the enemies (ghosts)
  const ghost1 = createGhost(new Vector2(350, 300));

  // Create the obstacles
  const map = await getJSON('./map.hjson');

  // Create the obstacles based on the map
  const obstacles = [];
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 1) {
        const obstacleX = col * 50;
        const obstacleY = row * 50;
        const obstacle = createObstacle(new Vector2(obstacleX, obstacleY));
        obstacles.push(obstacle);
      }
    }
  }

  // Create the pellets based on the map
  const pellets = [];
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 0) {
        const pelletX = col * 50; // Center X position of the pellet
        const pelletY = row * 50; // Center Y position of the pellet
        const pellet = createPellet(new Vector2(pelletX, pelletY));
        pellets.push(pellet);
      }
    }
  }


  // Start the game loop
  Engine.start(() => tick(player, ghost1));
};

// Initialize the TGE engine and start the main function
Engine.init(main);
