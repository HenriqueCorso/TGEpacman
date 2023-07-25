import { Player, Enum_PlayerMovement } from './engine/player.js';
import { Engine } from './engine/engine.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import { Box, Circle, Poly } from './engine/physics.js';
import * as TGE from './engine/engine.js';
import { isTileFree } from './pacman-utils.js';
import { map } from './myMap.js';
import { preloadImages } from './engine/utils.js';
import { Flipbook } from './engine/flipbook.js';
import { stopAndHideFlipbook, playAndShowFlipbook } from './pacman-utils.js';

class Pacman extends Player {
  constructor() {
    super({
      name: 'pacman',
      owner: Engine.gameLoop,
      hasColliders: true,
      scale: 0.2,
      position: V2(50, 50),
      rotation: Math.PI
    });

    this.canMove = true; // Add a flag to indicate if the player can move
  }

  init = async () => {

    Engine.addActor(this);


    this.initLifeSystem(); // Initialize the life system
    this.initColliders(); // Initialize colliders and movement
    this.attachKeyboard();
    this.setCollisionResponse('Obstacle', TGE.Enum_HitTestMode.Overlap);

    this.flags.isFlipbookEnabled = true;


    const pacmanFB = new Flipbook({ dims: V2(4, 4), actor: this, fps: 10 });
    await pacmanFB.loadAsAtlas('img/pacmanMoving.png');
    pacmanFB.addSequence({ name: 'PacmanMoving', startFrame: 0, endFrame: 15, loop: true });
    pacmanFB.play('PacmanMoving');

    // Load the PacmanDead flipbook and set isFixed to true to stop rotation
    const pacmanDFB = new Flipbook({ dims: V2(5, 4), actor: this, fps: 10 });
    await pacmanDFB.loadAsAtlas('img/pacmanDead.png');
    pacmanDFB.addSequence({ name: 'PacmanDead', startFrame: 0, endFrame: 17, loop: false });
    pacmanDFB.isFixed = true; // Set isFixed to true to stop rotation
  }

  initLifeSystem() {
    this.data.lives = 3;
    this.data.isRespawning = false;
  }

  initColliders() {
    const circlePlayer = new Circle(V2(0, 0), 100);
    this.movement.acceleration = 0;
    this.movementType = Enum_PlayerMovement.None;
    this.colliders.add(circlePlayer);
  }

  handleCollisionWithGhost() {
    const player = Engine.gameLoop.findActorByName('pacman');

    if (!this.data.isRespawning) {
      this.data.lives--;
      if (this.data.lives <= 0) {
        console.log('Game Over');
        alert('GameOver');
        location.reload();
      } else {
        console.log(`Respawning... Lives left: ${this.data.lives}`);
        this.data.isRespawning = true;
        this.flags.isVisible = false;

        // Disable movement when the player loses a life
        this.canMove = false;

        setTimeout(() => {
          this.position = V2(50, 50);
          this.data.isRespawning = false;
          this.flags.isVisible = true;

          stopAndHideFlipbook(player, 1);
          playAndShowFlipbook(player, 0, 'PacmanMoving');

          // Reset desiredDirection to prevent movement in the next tick
          this.data.desiredDirection = -1;

          // Enable movement again after the player respawns
          this.canMove = true;
        }, 2000);
      }
    }
  }


  handlePlayerMovement() {
    const keys = this.controllers['keyboard'].keyState;
    const tileSize = 50;
    const isPlayerMiddleOfTile = ((this.position.x % tileSize == 0) && (this.position.y % tileSize == 0));

    if (!this.canMove) return;

    if (isPlayerMiddleOfTile) {
      if (keys.left && this.position.y % 50 == 0) this.data.desiredDirection = 1;
      if (keys.right && this.position.y % 50 == 0) this.data.desiredDirection = 2;
      if (keys.up && this.position.x % 50 == 0) this.data.desiredDirection = 3;
      if (keys.down && this.position.x % 50 == 0) this.data.desiredDirection = 4;
    }

    let oldPos = this.position.clone();

    if (this.data.desiredDirection == 1 && isTileFree(this.position, V2(-1, 0), tileSize)) this.position.x -= 2;
    if (this.data.desiredDirection == 2 && isTileFree(this.position, V2(1, 0), tileSize)) this.position.x += 2;
    if (this.data.desiredDirection == 3 && isTileFree(this.position, V2(0, -1), tileSize)) this.position.y -= 2;
    if (this.data.desiredDirection == 4 && isTileFree(this.position, V2(0, 1), tileSize)) this.position.y += 2;

    if (Vec2.IsEqual(oldPos, this.position, 0.5)) this.data.desiredDirection = -1;

    if (this.data.desiredDirection !== -1) {
      if (this.data.desiredDirection === 1) { this.rotation = Math.PI; }
      else if (this.data.desiredDirection === 2) { this.rotation = 0; }
      else if (this.data.desiredDirection === 3) { this.rotation = -Math.PI / 2; }
      else if (this.data.desiredDirection === 4) { this.rotation = Math.PI / 2; }
    }
  }

  tick() {
    super.tick();
    this.handlePlayerMovement();
  }
}

export { Pacman };
