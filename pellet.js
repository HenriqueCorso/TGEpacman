import { Actor } from './engine/actor.js';
import { Engine } from './engine/engine.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import { Circle } from './engine/physics.js';
import * as TGE from './engine/engine.js';
import { loadMap } from './main.js';
import { InitAudio } from './engine/audio.js';

class Pellet extends Actor {
  static totalPellets = 0;
  static collectedPellets = 0;

  constructor(position) {
    super({
      name: 'pellet',
      owner: Engine.gameLoop,
      hasColliders: true,
      imgUrl: 'img/pellet.png',
      scale: 0.05,
      position: position,
      zIndex: 0,
    });

    const circlePellet = new Circle(V2(0, 0), 10);
    this.colliders.add(circlePellet);
    this.colliderType = 'Consumable';
    this.setCollisionResponseFlag({
      Consumable: TGE.Enum_HitTestMode.Ignore,
      Enemy: TGE.Enum_HitTestMode.Ignore,
      Player: TGE.Enum_HitTestMode.Overlap,
      Obstacle: TGE.Enum_HitTestMode.Ignore,
    });
    this.events.add('beginoverlap', (e) => {
      this.collect();
    });

    // Increment the total number of pellets when a new pellet is created
    Pellet.totalPellets++;
  }

  collect() {

    // Remove the pellet when the player overlaps with it
    this.destroy();
    console.log('Pellet collected');
    Pellet.collectedPellets++;

    Engine.data.score += 10;

    // Play munch sound when a pellet is collected
    const soundIndex = Math.floor(Math.random() * 2) + 1; // Randomly choose between "munch1" and "munch2" sounds
    Engine.audio.spawn(`munch${soundIndex}`, true);

    // Check if all the pellets are collected
    if (Pellet.collectedPellets === Pellet.totalPellets) {
      this.triggerWinScenario();
    }
  }


  triggerWinScenario() {
    console.log('Congratulations! You Win!');
    // Implement any win scenario actions here, such as showing a win screen or restarting the game.

    // Check the current level and load the appropriate level
    const currentLevel = Engine.gameLoop.data.url;
    if (currentLevel === 'level1.hjson') {
      loadMap('level2.hjson');
    } else if (currentLevel === 'level2.hjson') {
      loadMap('level3.hjson');
    } else if (currentLevel === 'level3.hjson') {
      loadMap('level4.hjson');
    } else {
      console.log('All levels completed!');
      // Implement any actions for completing all levels here, such as showing a game completed screen.
    }
  }
}

export { Pellet };