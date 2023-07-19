import { Actor } from './engine/actor.js';
import { Player, Enum_PlayerMovement } from './engine/player.js';
import { Engine } from './engine/engine.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import { Box, Circle, Poly } from './engine/physics.js';
import * as TGE from './engine/engine.js';

class Obstacle extends Actor {
  constructor(position) {
    super({
      owner: Engine.gameLoop,
      hasColliders: true,
      imgUrl: 'img/block.png',
      scale: 1,
      position: position
    });

    const boxObstacle = new Box(V2(0, 0), V2(45, 45));
    this.colliders.add(boxObstacle);
    this.colliderType = 'Obstacle';
    this.setCollisionResponseFlag({
      Consumable: TGE.Enum_HitTestMode.Ignore,
      Enemy: TGE.Enum_HitTestMode.Ignore,
      Player: TGE.Enum_HitTestMode.Overlap,
      Obstacle: TGE.Enum_HitTestMode.Ignore
    });
    this.events.add('beginoverlap', e => {
      player.velocity = V2(0, 0);

      console.log('Obstacle Wall')
    });
  }
}



export { Obstacle };


