import { TileMap } from './engine/tileMap.js';
import { Engine } from './engine/engine.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import { Obstacle } from './obstacle.js';
import { Pellet } from './pellet.js';
import { PowerUp } from './powerUp.js';




class MyMap extends TileMap {
  constructor() {
    super();
  }

  async createMap() {
    // Load the map data from level1.hjson
    const { map } = await TileMap.LoadFromFile({ url: './level1.hjson' });

    const tileSize = 50;

    // Loop through the rows and columns of the tilemap
    for (let row = 0; row < map.height; row++) {
      for (let col = 0; col < map.width; col++) {
        const tileValue = map.tileAt(col, row); // Get the tile value from the TileMap instance

        const position = V2(col * tileSize, row * tileSize);

        let actor = null; // Define a variable to hold the actor

        switch (tileValue) {
          case 1: // Obstacle
            actor = new Obstacle(position);
            break;
          case 0: // Pellet
            actor = new Pellet(position);
            break;
          case 2: // PowerUp 
            actor = new PowerUp(position);
            break;
        }

        Engine.addActor(actor); // Add the actor to the engine 
      }
    }
  }

  // Utility function to check if a tile is free for Pacman to move
  isTileFree(pos, offset, tileSize) {
    // If the player is moving down or right, add the width and height of the player to the coordinates, which is the same as tileSize, to verify a hit right or below.
    if (offset.x == 1 || offset.y == 1) {
      const mapPos = Vec2.Add(Vec2.ToInt(Vec2.DivScalar(pos, tileSize)), offset);
      return this.tileAt(mapPos.x, mapPos.y) === 0 || this.tileAt(mapPos.x, mapPos.y) === 2;
    } else {
      // Otherwise, deduct the pixels of movement direction from the current position to verify a hit above or left.
      const mapPos = Vec2.ToInt(Vec2.DivScalar(Vec2.Add(pos, offset), tileSize));
      return this.tileAt(mapPos.x, mapPos.y) === 0 || this.tileAt(mapPos.x, mapPos.y) === 2;
    }
  }
}
export { MyMap };
