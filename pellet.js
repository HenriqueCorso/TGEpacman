import { Actor } from './engine/actor.js';
import { Player, Enum_PlayerMovement } from './engine/player.js';
import { Engine } from './engine/engine.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import { Box, Circle, Poly } from './engine/physics.js';
import * as TGE from './engine/engine.js';


class Pellet extends Actor {
  constructor(position) {
    super({
      owner: Engine.gameLoop,
      hasColliders: true,
      imgUrl: 'img/pellet.png',
      scale: 0.05,
      position: position
    });
    // Create collision circle for the pellet
    const circlePellet = new Circle(V2(0, 0), 10);
    this.colliders.add(circlePellet);
    this.colliderType = 'Consumable';
    this.setCollisionResponseFlag({
      Consumable: TGE.Enum_HitTestMode.Ignore,
      Enemy: TGE.Enum_HitTestMode.Ignore,
      Player: TGE.Enum_HitTestMode.Overlap,
      Obstacle: TGE.Enum_HitTestMode.Ignore
    });
    this.events.add('beginoverlap', e => {
      // Remove the pellet when the player overlaps with it
      this.destroy();
      console.log('Pellet collected');
    });

  }
}


export { Pellet };
