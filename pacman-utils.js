


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

