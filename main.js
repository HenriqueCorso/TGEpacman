// Import necessary modules from TGE
import * as TGE from './engine/engine.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import { Box, Circle, Poly } from './engine/physics.js';
import { getJSON } from './engine/utils.js';
import { Player, Enum_PlayerMovement } from './engine/player.js';

const Engine = TGE.Engine;

// Function to create the player
const createPlayer = () => {
  const player = Engine.addActor('player', {
    hasColliders: true,
    imgUrl: 'img/pacman.jpg',
    scale: 0.2,
    position: V2(150, 300),
  });
  const circlePlayer = new Circle(V2(0, 0), 100);
  player.movement.acceleration = 0;
  player.movementType = Enum_PlayerMovement.None;

  player.colliders.add(circlePlayer);
  player.attachKeyboard();

  player.setCollisionResponse('Obstacle', TGE.Enum_HitTestMode.Overlap);
  // player.events.add('beginoverlap', e => {
  //  console.log('playerWALL');
  // })
  return player;
};

// Function to create a ghost enemy
const createGhost = (position) => {
  const ghost = Engine.addActor('enemy', {
    name: 'ghost',
    hasColliders: true,
    imgUrl: 'img/ghost.png',
    scale: 0.2,
    position: position,
  });

  const circleGhost = new Circle(V2(0, 0), 100);
  ghost.colliders.add(circleGhost);
  ghost.colliderType = 'Enemy';
  ghost.setCollisionResponseFlag({
    Consumable: TGE.Enum_HitTestMode.Ignore,
    Enemy: TGE.Enum_HitTestMode.Ignore,
    Player: TGE.Enum_HitTestMode.Overlap,
    Obstacle: TGE.Enum_HitTestMode.Ignore
  });
  ghost.events.add('beginoverlap', e => {
    console.log('DEAD!')
    // do something when player overlaps
    // the event object contains reference to both parties of the overlap
  });
  return ghost;
};

// Function to create an obstacle
const createObstacle = (position) => {
  const player = Engine.gameLoop.players[0];

  const obstacle = Engine.addActor('obstacle', {
    name: 'obstacle',
    hasColliders: true,
    imgUrl: 'img/block.png',
    scale: 1,
    position: position,
  });

  // Create collision box for the obstacle
  const boxObstacle = new Box(V2(0, 0), V2(45, 45));
  obstacle.colliders.add(boxObstacle);
  obstacle.colliderType = 'Obstacle';
  obstacle.setCollisionResponseFlag({
    Consumable: TGE.Enum_HitTestMode.Ignore,
    Enemy: TGE.Enum_HitTestMode.Ignore,
    Player: TGE.Enum_HitTestMode.Overlap,
    Obstacle: TGE.Enum_HitTestMode.Ignore
  });
  obstacle.events.add('beginoverlap', e => {
    player.velocity = V2(0, 0);

    console.log('Obstacle Wall')
  });
  return obstacle;
};

// Function to create a pellet
const createPellet = (position) => {
  const pellet = Engine.addActor('consumable', {
    name: 'pellet',
    hasColliders: true,
    imgUrl: 'img/pellet.png',
    scale: 0.05,
    position: position,
  });

  // Create collision circle for the pellet
  const circlePellet = new Circle(V2(0, 0), 10);
  pellet.colliders.add(circlePellet);
  pellet.colliderType = 'Consumable';
  pellet.setCollisionResponseFlag({
    Consumable: TGE.Enum_HitTestMode.Ignore,
    Enemy: TGE.Enum_HitTestMode.Ignore,
    Player: TGE.Enum_HitTestMode.Overlap,
    Obstacle: TGE.Enum_HitTestMode.Ignore
  });
  pellet.events.add('beginoverlap', e => {
    // Remove the pellet when the player overlaps with it
    pellet.destroy();
    console.log('Pellet collected');
  });
  return pellet;
};


const moveEnemy = () => {
  const ghost = Engine.gameLoop.findActorByName('ghost');
  const tileSize = 50;

  // Check if ghost is in the middle of a tile
  const isGhostMiddleOfTile = ((ghost.position.x % tileSize === 0) && (ghost.position.y % tileSize === 0));

  // Rule #1 ghost is allowed to change direction only when it's in the middle of a tile
  if (isGhostMiddleOfTile) {
    const validDirections = [];

    // Check if the tile to the left is free
    if (isTileFree(ghost.position, V2(-1, 0), tileSize)) { validDirections.push(1) }; // Add direction "left"

    // Check if the tile to the right is free
    if (isTileFree(ghost.position, V2(1, 0), tileSize)) { validDirections.push(2) }; // Add direction "right"

    // Check if the tile above is free
    if (isTileFree(ghost.position, V2(0, -1), tileSize)) { validDirections.push(3) }; // Add direction "up"

    // Check if the tile below is free
    if (isTileFree(ghost.position, V2(0, 1), tileSize)) { validDirections.push(4) }; // Add direction "down"


    // Choose a random valid direction
    const randomDirectionIndex = Math.floor(Math.random() * validDirections.length);
    const randomDirection = validDirections[randomDirectionIndex];

    // Move ghost in the chosen direction
    if (randomDirection === 1) {
      ghost.position.x -= tileSize;
    } else if (randomDirection === 2) {
      ghost.position.x += tileSize;
    } else if (randomDirection === 3) {
      ghost.position.y -= tileSize;
    } else if (randomDirection === 4) {
      ghost.position.y += tileSize;
    }
  }
};


const isTileFree = (pos, offset, tileSize) => {
  // if player moving down or right , add the width and height of the player to the coordinates - which is the same as tileSize - to verify a hit right or below
  if (offset.x == 1 || offset.y == 1) {
    const mapPos = Vec2.Add(Vec2.ToInt(Vec2.DivScalar(pos, tileSize)), offset);
    return map[mapPos.y][mapPos.x] === 0;
  }
  // otherwiswe deduct the pixels of movemnent direction from the current position (to verify a hit aboce of left) 
  const mapPos = Vec2.ToInt(Vec2.DivScalar(Vec2.Add(pos, offset), tileSize));
  return map[mapPos.y][mapPos.x] === 0;
}

const movePlayer = () => {
  const player = Engine.gameLoop.players[0];
  const keys = player.controllers['keyboard'].keyState;
  const tileSize = 50;

  //check if player is exactly dead center over a tile (because that's the only situation when he's allowed to change directions!) otherwise he could be going partially over a block
  const isPlayerMiddleOfTile = ((player.position.x % tileSize == 0) && (player.position.y % tileSize == 0));

  //Rule #1 player is allowed to change direction only whne he's in the middle of a tile (this rule can be further refined)
  if (isPlayerMiddleOfTile) {
    if (keys.left && player.position.y % 50 == 0) player.data.desiredDirection = 1;
    if (keys.right && player.position.y % 50 == 0) player.data.desiredDirection = 2;
    if (keys.up && player.position.x % 50 == 0) player.data.desiredDirection = 3;
    if (keys.down && player.position.x % 50 == 0) player.data.desiredDirection = 4;
  }
  // save a copy of player's current position to se if rule #2 will result in player movement
  let oldPos = player.position.clone();

  // Rule #2 move player to desired direction if the tile in the direction of movement is free
  if (player.data.desiredDirection == 1 && isTileFree(player.position, V2(-1, 0), tileSize)) player.position.x--;
  if (player.data.desiredDirection == 2 && isTileFree(player.position, V2(1, 0), tileSize)) player.position.x++;
  if (player.data.desiredDirection == 3 && isTileFree(player.position, V2(0, -1), tileSize)) player.position.y--;
  if (player.data.desiredDirection == 4 && isTileFree(player.position, V2(0, 1), tileSize)) player.position.y++;


  // Rule #3 if player did not move in any direction dureng last frame, it has hit a block and thus not allowed to continue movemnt
  if (Vec2.IsEqual(oldPos, player.position, 0.5)) player.data.desiredDirection = -1
};


const tick = () => {
  const player = Engine.gameLoop.players[0];
  //const ghost = Engine.gameLoop.findActorByName('ghost');
  //const obstacle = Engine.gameLoop.findActorByName('obstacle');
  //const pellet = Engine.gameLoop.findActorByName('pellet');

  Engine.renderingSurface.resetTransform();
  Engine.renderingSurface.clear();

  // Update player's position based on user input
  movePlayer();
  // TODO: Implement game logic here

  // Check for overlap between player and enemy
  //if (player.overlapsWith(ghost)) {
  // console.log('DEAD!');
  // Perform actions or logic when there is an overlap 
  //};

  // TODO: Render the game entities
};

const map = await getJSON('./map.hjson');


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
  const ghost1 = createGhost(V2(350, 300));
  const ghost2 = createGhost(V2(350, 300));

  // Create the obstacles

  // Create the obstacles based on the map
  const obstacles = [];
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 1) {
        const obstacleX = col * 50;
        const obstacleY = row * 50;
        const obstacle = createObstacle(V2(obstacleX, obstacleY));
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
        const pellet = createPellet(V2(pelletX, pelletY));
        pellets.push(pellet);
      }
    }
  }


  // Start the game loop
  Engine.start(tick);
  Engine.gameLoop.addTimer({ duration: 30, repeat: Infinity, onRepeat: moveEnemy });

};

// Initialize the TGE engine and start the main function
Engine.init(main);
