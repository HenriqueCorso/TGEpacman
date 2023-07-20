import { Vector2 as Vec2, V2 } from './engine/types.js';
import { map } from './myMap.js';

// Utility function to check if a tile is free for Pacman to move
export const isTileFree = (pos, offset, tileSize) => {
  // If the player is moving down or right, add the width and height of the player
  // to the coordinates, which is the same as tileSize, to verify a hit right or below.
  if (offset.x == 1 || offset.y == 1) {
    const mapPos = Vec2.Add(Vec2.ToInt(Vec2.DivScalar(pos, tileSize)), offset);
    return map[mapPos.y][mapPos.x] === 0 || map[mapPos.y][mapPos.x] === 2;
  } else {
    // Otherwise, deduct the pixels of movement direction from the current position
    // to verify a hit above or left.
    const mapPos = Vec2.ToInt(Vec2.DivScalar(Vec2.Add(pos, offset), tileSize));
    return map[mapPos.y][mapPos.x] === 0 || map[mapPos.y][mapPos.x] === 2;
  }
};