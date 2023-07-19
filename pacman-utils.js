import { Vector2 as Vec2, V2 } from './engine/types.js';
import { map } from './myMap.js';



export const isTileFree = (pos, offset, tileSize) => {
  // if player moving down or right , add the width and height of the player to the coordinates - which is the same as tileSize - to verify a hit right or below
  if (offset.x == 1 || offset.y == 1) {
    const mapPos = Vec2.Add(Vec2.ToInt(Vec2.DivScalar(pos, tileSize)), offset);
    return map[mapPos.y][mapPos.x] === 0;
  }
  // otherwiswe deduct the pixels of movemnent direction from the current position (to verify a hit aboce of left) 
  const mapPos = Vec2.ToInt(Vec2.DivScalar(Vec2.Add(pos, offset), tileSize));
  return map[mapPos.y][mapPos.x] === 0;
}