// Import necessary modules from TGE
import * as TGE from './engine/engine.js';

const Engine = TGE.Engine;



const main = async () => {

  const tick = () => {
    // Update player's position based on user input
    const keys = player.controllers['keyboard'].keyState;
    if (keys.left) player.position.x -= 2;
    if (keys.right) player.position.x += 2;
    if (keys.up) player.position.y -= 2;
    if (keys.down) player.position.y += 2;


    ;
  };

  // Set up the game environment
  Engine.setRootElement('game');
  Engine.createRenderingSurface();


  const player = Engine.addActor('player', { imgUrl: 'img/pacman.jpg', scale: 0.2 });

  player.attachKeyboard();




  // Start the game
  Engine.start(tick);

};

Engine.init(main);