// Create a settings object
let settings = {
  global: true,
  fullscreen: false,
  width: 475, height: 275,
  scale: 1,
  clearColor: [0, 0, 0],
};

// Load Kaboom with our settings
kaboom(settings);

// Load sprites
loadSprite("mars", "https://i.imgur.com/4R8XnD2.png");
loadSprite("rocket", "https://i.imgur.com/gQnVGjV.png");
loadSprite("alien", "https://i.imgur.com/38Pc7n7.png");

// Load sounds
loadSound("shoot", "shoot.wav");
loadSound("song", "sample_3.mp3")

let song;
let SHOOT_SOUND;
// Create main scene
scene("main", () => {
  // Add layers to our main scene
  song = play("song", { volume: .8 });
  loop: true;
  // "bg" mean background layer, it is a static image
  // "obj" mean object layer, the action happens here
  // "ui" means user interface layer, for health display, etc.
  // The "obj" after the comma sets it as our default layer
  layers(["bg", "obj", "ui"], "obj");
  // Add the mars sprite to the background
  add([sprite("mars"), layer("bg")]);
  // Add player with various attributes
  const player = add([
    sprite("rocket"), // Use our rocket image loaded above
    pos(200, 200), // Start at position (200,200)
    scale(.5), // 1:1 pixel size
    rotate(0), // No rotation
    origin("center"), // If rotated, rocket rotates from center
    "player", // Give the name player to this object
  ]);
  // Add controls
  keyDown("left", () => {
    player.move(-100, 0);
  });
  keyDown("right", () => {
    player.move(100, 0);
  });
  keyDown("up", () => {
    player.move(0, -100);
  });
  keyDown("down", () => {
    player.move(0, 100);
  });
  // Declare variables for map dimensions
  const MAP_WIDTH = 475;
  const MAP_HEIGHT = 275;
  const BLOCK_SIZE = 25;
  // Add level with boundaries
  // You can draw the map using symbols we define below
  const map = addLevel(
    [
      "++++++++++++++++++++",
      "-                  -",
      "-                  -",
      "-                  -",
      "-                  -",
      "-                  -",
      "-                  -",
      "-                  -",
      "-                  -",
      "-                  -",
      "-                  -",
      "====================",
    ],
    {
      width: BLOCK_SIZE, // Set width of blocks
      height: BLOCK_SIZE, // Set height of blocks
      pos: vec2(0, 0), // Position at origin
      // Add symbols we can use to draw blocks
      // Symbols represent rectanges that we use as blocks
      // We can set the width, RGB color, and give it a name
      "=": [rect(BLOCK_SIZE, 1), color(0, 0, 0), "ground", solid()],
      p: [rect(BLOCK_SIZE, BLOCK_SIZE), color(0, 1, 0), "platform", solid()],
      "-": [rect(1, BLOCK_SIZE), color(0, 0, 0), "boundary", solid()],
      "+": [rect(BLOCK_SIZE, 1), color(0, 0, 0), "ceeling", solid()],
    }
  );
  // Every object has an action it runs each frame
  // Stop player from going through boundaries when moving
  player.action(() => {
    player.resolve();
  });
  // Add variable to control laser speed
  const LASER_SPEED = 300;
  // Add function to generate laser
  function spawnLaser(laserPos) {
    // Spawn the laser above the rocket
    laserPos = laserPos.add(0, -20);
    add([
      rect(2, 8),
      pos(laserPos),
      origin("center"),
      color(0, 1, 0),
      "laser",
      {
        laserSpeed: -1 * LASER_SPEED,
      },
    ]);
  }
  // Each frame, move the laser up the screen
  action("laser", (l) => {
    // Move up
    l.move(0, l.laserSpeed);
    // If the laser is out of bounds, destroy the laser
    if (l.pos.y < 0 || l.pos.y > MAP_HEIGHT) {
      destroy(l);
    }
  });
  // Shoot with spacebar
  // We use keyPress instead of keyDown to shoot once at a time
  keyPress("space", () => {
    // Play laser sound
    SHOOT_SOUND = play("shoot", {
      volume: 0.1,
    });
    // Spawn laser at player position
    spawnLaser(player.pos);
  });
  // cheat
  let SPACE_IS_DOWN;
  keyDown("space", () => {
    SPACE_IS_DOWN = new Date()
  })

  const FAST_LASER_SPEED = 400;
  const LASER_WAIT = .1;
  // Add function to generate laser
  function spawnfastLaser(laserPos) {
    // Spawn the laser above the rocket
    originalPos = laserPos
    const NOW = new Date()
    const FINAL_TIME_DIF = NOW - START_RAPID_FIRE
    if (FINAL_TIME_DIF >= 5000) {
      SHOOT_SOUND.pause();
      loop: false
      return
    }
    laserPos = laserPos.add(0, -20);
    add([
      rect(4, 8),
      pos(laserPos),
      origin("center"),
      color(1, 0, 0),
      "fastlaser",
      {
        fastlaserSpeed: -1 * FAST_LASER_SPEED,
      }
    ]);
    wait(LASER_WAIT, () => spawnfastLaser(originalPos));
  }
  // Each frame, move the laser up the screen
  action("fastlaser", (l) => {
    // Move up
    l.move(0, l.fastlaserSpeed);
    // If the laser is out of bounds, destroy the laser
    if (l.pos.y < 0 || l.pos.y > MAP_HEIGHT) {
      destroy(l);
    }
  });

  let START_RAPID_FIRE;
  keyRelease("space", () => {
    const NOW = new Date()
    const TIME_DIF = NOW - SPACE_IS_DOWN;
    destroyAll("TIME_DIF")
    add([
      text(TIME_DIF.toString()),
      pos(250, 100),
      origin("center"),
      layer("ui"),
      "TIME_DIF",
    ]);
    if (TIME_DIF >= 7) {
      add([
        text("rapid fire activated"),
        pos(250, 105),
        origin("center"),
        layer("ui"),
        "score",
      ])
      spawnfastLaser(player.pos)
      SHOOT_SOUND = play("shoot", {
        volume: 0.2,
        loop: true
      });
      START_RAPID_FIRE = new Date()
    }

  })
  // Add aliens
  const NEW_ALIEN_WAIT = 2;
  function spawnAlien() {
    add([
      sprite("alien"),
      // Randomize the spawn position
      pos(rand(10, MAP_WIDTH - 30), 0),
      "alien",
      {
        speedX: 1,
        speedY: 50,
      },
    ]);
    // Wait a few seconds before next spawn
    wait(NEW_ALIEN_WAIT, spawnAlien);
  }

  // Call function
  spawnAlien();

  action("alien", (alien) => {
    alien.move(alien.speedX, alien.speedY);
  });

  // Add score to UI layer
  var score = 0;
  function displayScore() {
    add([
      text("SCORE: " + score.toString(), 8),
      pos(80, 20),
      origin("center"),
      layer("ui"),
      color(2, 0, 2),
      "score",
    ]);
    if (score == 1000) {
      add([
        text("this achievement is useless"),
        pos(200, 120),
        origin("center"),
        layer("ui"),
        color(0, 6, 0),
        "score",
      ]);
      add([
        text("this is nothing special"),
        pos(200, 100),
        origin("center"),
        layer("ui"),
        color(0, 6, 0),
        "score",
      ]);
      add([
        text("yay you found me!"),
        pos(200, 80),
        origin("center"),
        layer("ui"),
        color(0, 6, 0),
        "score",
      ]);
    }
  }
  // Call function to display initial score
  displayScore();
  // Detect collision of alien and lasers
  collides("alien", "laser", (alien, laser) => {
    camShake(5);
    score += 50;
    destroyAll("score");
    displayScore();
    destroy(alien);
    destroy(laser);
    if (score == 2500) {
      destroyAll("alien")
      go("win", score);
    }
});

collides("alien", "fastlaser", (alien, fastlaser) => {
  camShake(5);
  score += 50;
  destroyAll("score");
  displayScore();
  destroy(alien);
  destroy(fastlaser);
  if (score == 2500) {
    destroyAll("alien")
    go("win", score);
  }
});
collides("alien", "ground", (alien, ground) => {
  camShake(5);
  destroyAll("alien");
  destroyAll("player");
  go("lost", score);
})

// Detect collision of alien and player
collides("alien", "player", (alien, player) => {
  if (cheatActivated == true) {
    camShake(5);
    destroy(alien);
    score += 50;
    destroyAll("score");
    displayScore();
    if (score == 2500) {
      destroyAll("alien")
      go("win", score);
    }
    return
  }
  camShake(5);
  destroy(alien);
  go("lost", score);
})
//cheat combo
let cheatActivated = false;
let cheatP = false;
let cheatY = false;
keyDown("p", () => {
  cheatP = true;
})
keyDown("y", () => {
  if (cheatP == true) {
    cheatY = true;
  }
  if (cheatP && cheatY == true) {
    add([
      text("cheats activated"),
      color(3, 0, 7),
      pos(250, 100),
      origin("center"),
      layer("ui"),
      "score",
    ])
    cheatActivated = true;
  }
})

//End game
keyPress("backspace", () => {
  if (cheatActivated == true) {
    destroyAll("alien");
    go("lost", score);
  }
})

});

scene("win", (score) => {
  song.pause();
  SHOOT_SOUND && SHOOT_SOUND.pause();
  add([
    text("You won the demo! Try again with 'enter' or buy the game."),
    pos(250, 50),
    origin("center"),
    layer("ui"),
    "end",
  ])
  add([
    text("Score: " + score.toString(), 8),
    pos(250, 60),
    origin("center"),
    layer("ui"),
    "end",
  ])
  keyPress("enter", () => {
    go("main");
  })
})
// Game over scene
scene("lost", (score) => {
  song.pause();
  SHOOT_SOUND && SHOOT_SOUND.pause();
  // Add losing text to the UI layer
  add([
    text("You ded! lol 'enter' to start again! Score: " + score.toString(), 8),
    pos(250, 50),
    origin("center"),
    layer("ui"),
    "score",
  ]);

  // Press enter to restart
  keyPress("enter", () => {
    go("main");
  });
});
// Start scene
start("main");






//yes