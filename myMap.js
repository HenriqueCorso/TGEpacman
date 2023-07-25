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

        switch (tileValue) {
          case 1: // Obstacle
            const obstacle = new Obstacle(position);
            Engine.addActor(obstacle);
            break;
          case 0: // Pellet
            const pellet = new Pellet(position);
            Engine.addActor(pellet);
            break;
          case 2: // PowerUp 
            const powerUp = new PowerUp(position);
            Engine.addActor(powerUp);
            break;
        }
      }
    }
  }
}

export { MyMap }