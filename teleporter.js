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
    const circleTeleporter = new Circle(V2(0, 0), 30);
    this.colliders.add(circleTeleporter);
  }


  onCollision(actor) {
    console.log('Teleport')

    Engine.gameLoop.forActors(actor => {
      if (actor.name != 'pacman') return;

      // Get the width and height of the map
      const mapWidth = Engine.gameLoop.data.map.width;
      const mapHeight = Engine.gameLoop.data.map.height;

      // Get the position of the opposite teleporter on the map
      let teleporterPosition = this.position;

      // If the teleporter is in the left half of the map, teleport to the right half
      if (this.position.x < mapWidth / 2) {
        teleporterPosition = V2(this.position.x + mapWidth / 2, this.position.y);
      }
      // If the teleporter is in the right half of the map, teleport to the left half
      else {
        teleporterPosition = V2(this.position.x - mapWidth / 2, this.position.y);
      }

      // Set the position of the actor to the teleporter position
      actor.position = teleporterPosition;
    });
  }
}
