// Import necessary modules from TGE
import * as TGE from './engine/engine.js';
import { Vector2 } from './engine/types.js';
import { Box, Circle, Poly } from './engine/physics.js';

const Engine = TGE.Engine;

const main = async () => {
  const tick = () => {
    Engine.renderingSurface.resetTransform();
    Engine.renderingSurface.clear();
    // Update player's position based on user input
    const keys = player.controllers['keyboard'].keyState;
    if (keys.left) player.position.x -= 2;
    if (keys.right) player.position.x += 2;
    if (keys.up) player.position.y -= 2;
    if (keys.down) player.position.y += 2;

    // TODO: Implement game logic here

    // TODO: Render the game entities
  };

  // Set up the game environment
  Engine.setRootElement('game');
  Engine.createRenderingSurface();

  Engine.gameLoop.flags.collisionsEnabled = true;
  Engine.gameLoop.flags.showColliders = true; // turn off later

  // TODO: Define the game entities (player, enemies, obstacles)

  // Create the player
  const player = Engine.addActor('player', { hasColliders: true, imgUrl: 'img/pacman.jpg', scale: 0.2, position: new Vector2(150, 300) });
  player.attachKeyboard();
  player.setCollisionResponse('WorldDynamic', TGE.Enum_HitTestMode.Overlap);
  player.events.add('beginoverlap', e => {
    player.velocity = new Vector2(0, 0);
    // do something when player overlaps
    // the event object contains reference to both parties of the overlap
    console.log('playerTouch')
  });


  // Create the enemies (ghosts)
  const ghost1 = Engine.addActor('enemy', { hasColliders: true, imgUrl: 'img/ghost.png', scale: 0.2, position: new Vector2(350, 300) });
  ghost1.setCollisionResponse('Enemy', TGE.Enum_HitTestMode.Overlap);
  ghost1.events.add('beginoverlap', e => {
    console.log('DEAD')
    // do something when player overlaps
    // the event object contains reference to both parties of the overlap
    console.log('EnmeyTouch')
  });




  // Create the obstacles
  const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

  ];

  const obstacleSize = 100; // Size of each obstacle (assumed to be square)

  // Create the obstacles based on the map
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 1) {
        const obstacleX = col * 50;
        const obstacleY = row * 50;

        const obstacle = Engine.addActor('obstacle', {
          hasColliders: true,
          imgUrl: 'img/block.png',
          scale: obstacleSize / 100, // Assuming the obstacle image size is 100x100 pixels
          position: new Vector2(obstacleX, obstacleY),
        });
        // Create collision box for the obstacle
        const boxObstacle = new Box(new Vector2(0, 0), new Vector2(45, 45));
        obstacle.colliders.add(boxObstacle);
        obstacle.setCollisionResponse('Obstacle', TGE.Enum_HitTestMode.Overlap);
        obstacle.events.add('beginoverlap', e => {
          player.velocity = new Vector2(0, 0);
          // do something when player overlaps
          // the event object contains reference to both parties of the overlap
          console.log('WallTouchs')
        });
      }
    }
  }

  // Create the pellets based on the map
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 0) {
        const pelletX = col * 50; // Center X position of the pellet
        const pelletY = row * 50; // Center Y position of the pellet

        const pellet = Engine.addActor('enemy', {
          hasColliders: true,
          imgUrl: 'img/pellet.png',
          scale: 0.05,
          position: new Vector2(pelletX, pelletY),
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
      }
    }
  }

  // Define collision shapes for player and enemy actors
  const circlePlayer = new Circle(new Vector2(0, 0), 100);
  const circleGhost = new Circle(new Vector2(0, 0), 100);

  player.colliders.add(circlePlayer);
  ghost1.colliders.add(circleGhost);

  // Start the game loop
  Engine.start(tick);
};

// Initialize the TGE engine and start the main function
Engine.init(main);
