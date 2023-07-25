import { Vector2 as Vec2 } from './engine/types.js';
import { TileMap } from './engine/tileMap.js';

const { map } = await TileMap.LoadFromFile({ url: './level1.hjson' });


// Utility function to check if a tile is free for Pacman to move
export const isTileFree = (pos, offset, tileSize) => {
  // If the player is moving down or right, add the width and height of the player to the coordinates, which is the same as tileSize, to verify a hit right or below.
  if (offset.x == 1 || offset.y == 1) {
    const mapPos = Vec2.Add(Vec2.ToInt(Vec2.DivScalar(pos, tileSize)), offset);
    return map.tileAt(mapPos.x, mapPos.y) === 0 || map.tileAt(mapPos.x, mapPos.y) === 2;
  } else {
    // Otherwise, deduct the pixels of movement direction from the current position to verify a hit above or left.
    const mapPos = Vec2.ToInt(Vec2.DivScalar(Vec2.Add(pos, offset), tileSize));
    return map.tileAt(mapPos.x, mapPos.y) === 0 || map.tileAt(mapPos.x, mapPos.y) === 2;
  }
};

// Utility function to stop and hide a specific flipbook of an actor
export const stopAndHideFlipbook = (actor, flipbookIndex) => {
  const fb = actor?.flipbooks[flipbookIndex];       // makes sure actor exists before testing
  if (!fb) return;                                 // return early pattern
  fb.stop();
  fb.isVisible = false;
};

// Utility function to play and show a specific flipbook sequence of an actor
export const playAndShowFlipbook = (actor, flipbookIndex, sequenceName) => {
  const fb = actor?.flipbooks[flipbookIndex];
  if (!fb) return;
  fb.play(sequenceName);
  fb.isVisible = true;
};


