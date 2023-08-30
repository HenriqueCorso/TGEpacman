import { Actor } from './engine/actor.js';
import { Engine } from './engine/engine.js';
import { Circle } from './engine/physics.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import * as TGE from './engine/engine.js';

export class Teleporter extends Actor {
  constructor(position) {
    super({
      owner: Engine.gameLoop,
      hasColliders: true,
      imgUrl: 'img/pellet.png',
      scale: 0.2,
      position: position,
      zIndex: 0
    });

    this.setupColliders();
    this.setupCollisionResponse();
    this.events.add('beginoverlap', (e) => this.onCollision());

  }

  setupCollisionResponse() {
    this.setCollisionResponseFlag({
      Consumable: TGE.Enum_HitTestMode.Ignore,
      Enemy: TGE.Enum_HitTestMode.Overlap,
      Player: TGE.Enum_HitTestMode.Overlap,
      Obstacle: TGE.Enum_HitTestMode.Ignore,
    });
  }
  setupColliders() {
    const circleTeleporter = new Circle(V2(0, 0), 50);
    this.colliders.add(circleTeleporter);
  }


  onCollision() {
    console.log('Teleport')

    Engine.gameLoop.forActors(actor => {
      if (actor.name != 'pacman') return;

      const mapWidth = Engine.gameLoop.data.map.width * Engine.gameLoop.data.tileSize;
      console.log(mapWidth)
      // Get the position of the opposite teleporter on the map
      let teleporterPosition = this.position.clone();

      // Determine the teleportation direction based on the player's rotation

      if (actor.rotation == 0) {
        // If the player is moving to the right, teleport to the left side of the map
        teleporterPosition.x = (teleporterPosition.x - mapWidth + 100)
      } else {
        // If the player is moving to the left, teleport to the right side of the map
        teleporterPosition.x = (teleporterPosition.x + mapWidth - 100)

        console.log(teleporterPosition)
      }

      // Set the position of the actor to the teleporter position
      actor.position = teleporterPosition;

      actor.position.x = Math.floor(actor.position.x);
    });
  }
}
