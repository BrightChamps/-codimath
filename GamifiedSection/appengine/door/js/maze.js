/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Door game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Door');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Trashcan');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.math');
goog.require('Blockly.utils.string');
goog.require('Blockly.VerticalFlyout');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Door.Blocks');
goog.require('Door.soy');


BlocklyGames.NAME = 'door';

/**
 * Go to the next level.  Add skin parameter.
 * @suppress {duplicate}
 */

Door.MAX_BLOCKS = [undefined, // Level 0.
    Infinity, Infinity, 2, 5, 5, 5, 5, 10, 7, 10][BlocklyGames.LEVEL];

// Crash type constants.
Door.CRASH_STOP = 1;
Door.CRASH_SPIN = 2;
Door.CRASH_FALL = 3;

Door.SKINS = [
  // sprite: A 1029x51 set of 21 avatar images.
  // tiles: A 250x200 set of 20 map images.
  // marker: A 20x34 goal image.
  // background: An optional 400x450 background image, or false.
  // look: Colour of sonar-like look icon.
  // winSound: List of sounds (in various formats) to play when the player wins.
  // crashSound: List of sounds (in various formats) for player crashes.
  // crashType: Behaviour when player crashes (stop, spin, or fall).
  {
    sprite: 'door/pegman.png',
    tiles: 'door/puzzle-without-label.png',
    idlesprite: 'door/Idle.png',
    marker: 'door/marker.png',
    background: 'door/14bg.png',
    look: '#000',
    coin: 'door/coin-sprite.png',
    winSound: ['door/win.mp3', 'door/win.ogg'],
    crashSound: ['door/fail_pegman.mp3', 'door/fail_pegman.ogg'],
    crashType: Door.CRASH_STOP
  },
  {
    sprite: 'door/astro.png',
    tiles: 'door/tiles_astro.png',
    marker: 'door/marker.png',
    background: 'door/bg_astro.jpg',
    // Coma star cluster, photo by George Hatfield, used with permission.
    look: '#fff',
    coin: 'door/coin.png',
    winSound: ['door/win.mp3', 'door/win.ogg'],
    crashSound: ['door/fail_astro.mp3', 'door/fail_astro.ogg'],
    crashType: Door.CRASH_SPIN
  },
  {
    sprite: 'door/panda.png',
    tiles: 'door/tiles_panda.png',
    marker: 'door/marker.png',
    background: 'door/bg_panda.jpg',
    // Spring canopy, photo by Rupert Fleetingly, CC licensed for reuse.
    look: '#000',
    coin: 'door/coin.png',
    winSound: ['door/win.mp3', 'door/win.ogg'],
    crashSound: ['door/fail_panda.mp3', 'door/fail_panda.ogg'],
    crashType: Door.CRASH_FALL
  }
];
Door.SKIN_ID = BlocklyGames.getNumberParamFromUrl('skin', 0, Door.SKINS.length);
Door.SKIN = Door.SKINS[Door.SKIN_ID];

/**
 * Milliseconds between each animation frame.
 */
Door.stepSpeed;

// BlocklyGames.coinval = 100;

/**
 * The types of squares in the door, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
Door.SquareType = {
  WALL: 0,
  OPEN: 1,
  START: 2,
  FINISH: 3
};
// Door.correctdirections = [2, 0, 14, 2, 0, 12, 12, 8, 10, 6, 10, 14, 0, 0, 0];
Door.correctdirections = [[-1, 0, 7, -1, 0, 6],
                          [1, -1, -1, 1, -1, 6],
                          [-1, -1, 5, -1, 5, 4],
                          [-1, 7, -1, 3, -1, -1],
                          [-1, -1, 0, 0, 0, 16]];
// The door square constants defined above are inlined here
// for ease of reading and writing the static doors.
Door.map = [
// Level 0.
 undefined,
// Level 1.
 [[0, 1, 1, 0, 1, 1],
  [2, 0, 0, 1, 0, 1],
  [0, 0, 1, 0, 1, 1],
  [0, 1, 0, 1, 0, 0],
  [0, 0, 1, 1, 1, 3]],
// Level 2.
 [[0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 3, 0, 0, 0],
  [0, 0, 2, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]],
// Level 3.
 [[0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 1, 1, 1, 1, 3, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]],
// Level 4.
/**
 * Note, the path continues past the start and the goal in both directions.
 * This is intentionally done so users see the door is about getting from
 * the start to the goal and not necessarily about moving over every part of
 * the door, 'mowing the lawn' as Neil calls it.
 */
 [[0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 1, 1],
  [0, 0, 0, 0, 0, 3, 1, 0],
  [0, 0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0],
  [0, 2, 1, 0, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 0, 0, 0]],
// Level 5.
 [[0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 3, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 2, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]],
// Level 6.
 [[0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 0, 0, 1, 0, 0],
  [0, 1, 1, 3, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 2, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]],
// Level 7.
 [[0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 0],
  [0, 2, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 0],
  [0, 1, 1, 3, 0, 1, 0, 0],
  [0, 1, 0, 1, 0, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]],
// Level 8.
 [[0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 0],
  [0, 1, 0, 0, 1, 1, 0, 0],
  [0, 1, 1, 1, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 1, 0, 0],
  [0, 2, 1, 1, 0, 3, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]],
// Level 9.
 [[0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0],
  [3, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 1, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 2, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]],
// Level 10.
 [[0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 3, 0, 1, 0],
  [0, 1, 1, 0, 1, 1, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 1, 0, 0, 1, 0],
  [0, 2, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]]
][BlocklyGames.LEVEL];

/**
 * Measure door dimensions and set sizes.
 * ROWS: Number of tiles down.
 * COLS: Number of tiles across.
 * SQUARE_SIZE: Pixel height and width of each door square (i.e. tile).
 */
Door.ROWS = Door.map.length;
Door.COLS = Door.map[0].length;
Door.SQUARE_SIZE = (200);
Door.PEGMAN_HEIGHT = 80;
Door.PEGMAN_WIDTH = 80;
// console.log(Door.ROWS + ',' + Door.COLS);
// console.log(Door.MAZE_WIDTH + ',' + Door.MAZE_HEIGHT);
Door.PATH_WIDTH = Door.SQUARE_SIZE / 3;
Door.factorX = window.innerWidth;
Door.factorY = window.innerHeight;
var temp = Door.factorX / 2133 > Door.factorY/ 1084 ? Door.factorY/ 1084 : Door.factorX / 2133;

/**
 * Constants for cardinal directions.  Subsequent code assumes these are
 * in the range 0..3 and that opposites have an absolute difference of 2.
 * @enum {number}
 */
Door.DirectionType = {
  EAST: 0,
  NORTHEAST: 1,
  NORTH: 2,
  NORTHWEST: 3,
  WEST: 4,
  SOUTHWEST: 5,
  SOUTH: 6,
  SOUTHEAST: 7
};

/**
 * Outcomes of running the user program.
 */
Door.ResultType = {
  UNSET: 0,
  SUCCESS: 1,
  FAILURE: -1,
  TIMEOUT: 2,
  ERROR: -2
};

/**
 * Result of last execution.
 */
Door.result = Door.ResultType.UNSET;

/**
 * Starting direction.
 */
Door.startDirection = Door.DirectionType.EAST;

/**
 * PIDs of animation tasks currently executing.
 */
Door.pidList = [];

// Map each possible shape to a sprite.
// Input: Binary string representing Centre/North/West/South/East squares.
// Output: [x, y] coordinates of each tile's sprite in tiles.png.
Door.tile_SHAPES = {
  '0,0':[0,0],
  '1,0':[1,0],
  '2,0':[2,0],
  '3,0':[3,0],
  '4,0':[4,0],
  '5,0':[5,0],
  '0,1':[0,1],
  '0,2':[0,2],
  '0,3':[0,3],
  '0,4':[0,4],
  '1,1':[1,1],
  '1,2':[1,2],
  '1,3':[1,3],
  '1,4':[1,4],
  '2,1':[2,1],
  '2,2':[2,2],
  '2,3':[2,3],
  '2,4':[2,4],
  '3,1':[3,1],
  '3,2':[3,2],
  '3,3':[3,3],
  '3,4':[3,4],
  '4,1':[4,1],
  '4,2':[4,2],
  '4,3':[4,3],
  '4,4':[4,4],
  '5,1':[5,1],
  '5,2':[5,2],
  '5,3':[5,3],
  '5,4':[5,4]
};

// Door.tile_SHAPES = {
//   '0,0':[0,3],
//   '1,0':[3,0],
//   '2,0':[2,0],
//   '3,0':[1,0],
//   '4,0':[4,0],
//   '5,0':[5,0],
//   '0,1':[0,1],
//   '0,2':[0,2],
//   '0,3':[0,0],
//   '0,4':[0,4],
//   '1,1':[1,1],
//   '1,2':[1,2],
//   '1,3':[1,3],
//   '1,4':[1,4],
//   '2,1':[2,1],
//   '2,2':[2,2],
//   '2,3':[2,3],
//   '2,4':[2,4],
//   '3,1':[3,1],
//   '3,2':[3,2],
//   '3,3':[3,3],
//   '3,4':[3,4],
//   '4,1':[4,1],
//   '4,2':[4,2],
//   '4,3':[4,3],
//   '4,4':[4,4],
//   '5,1':[5,1],
//   '5,2':[5,2],
//   '5,3':[5,3],
//   '5,4':[5,4]
// };

/**
 * Create and layout all the nodes for the path, scenery, Pegman, and goal.
 */
Door.drawMap = function() {
  var svg = document.getElementById('svgDoor');
  var scale = Math.max(Door.ROWS, Door.COLS) * Door.SQUARE_SIZE;
  // svg.setAttribute('viewBox', '0 0 ' + scale + ' ' + scale);
  svg.style.width = Door.MAZE_WIDTH + 'px';
  svg.style.height = Door.MAZE_HEIGHT + 'px';
  svg.setAttribute('viewBox', '0 0 ' + Door.MAZE_WIDTH + ' ' + Door.MAZE_HEIGHT);
  // Draw the outer square.
  Blockly.utils.dom.createSvgElement('rect', {
      'height': Door.MAZE_HEIGHT,
      'width': Door.MAZE_WIDTH,
      'fill': '#F1EEE7',
      'stroke-width': 1,
      'stroke': '#CCB'
    }, svg);

  if (Door.SKIN.background) {
    var tile = Blockly.utils.dom.createSvgElement('image', {
        'height': Door.MAZE_HEIGHT,
        'width': Door.MAZE_WIDTH,
        // 'x': +Door.SQUARE_SIZE /6,
        // 'y': +Door.SQUARE_SIZE /12
        'x': 0,
        'y': 0
      }, svg);
    tile.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
        Door.SKIN.background);
  }

  // Draw the tiles making up the door map.

  // Return a value of '0' if the specified square is wall or out of bounds,
  // '1' otherwise (empty, start, finish).
  // var normalize = function(x, y) {
  //   if (x < 0 || x >= Door.COLS || y < 0 || y >= Door.ROWS) {
  //     return '0';
  //   }
  //   return (Door.map[y][x] == Door.SquareType.WALL) ? '0' : '1';
  // };
  //
  // // Compute and draw the tile for each square.
  // var tileId = 0;
  for (var y = 0; y < Door.ROWS; y++) {
    for (var x = 0; x < Door.COLS ; x++) {
      var tileShape = (x).toString() + ',' + (y).toString();
      var left = Door.tile_SHAPES[tileShape][0];
      var top = Door.tile_SHAPES[tileShape][1];
      // Tile's clipPath element.
      var tileClip = Blockly.utils.dom.createSvgElement('clipPath', {
          'id': 'tileClipPath' + (x+1).toString() + (y+1).toString()
        }, svg);
      Blockly.utils.dom.createSvgElement('rect', {
          'height': Door.SQUARE_SIZE,
          'width': Door.SQUARE_SIZE,
          'x': x * Door.SQUARE_SIZE,
          'y': y * Door.SQUARE_SIZE
        }, tileClip);
      // Tile sprite.
      var tile = Blockly.utils.dom.createSvgElement('image', {
          'id' : (x+1).toString() + (y+1).toString(),
          'height': Door.SQUARE_SIZE * 5,
          'width': Door.SQUARE_SIZE * 6,
          'clip-path': 'url(#tileClipPath' + (x+1).toString() + (y+1).toString() + ')',
          'x': (x - left) * Door.SQUARE_SIZE,
          'y': (y - top) * Door.SQUARE_SIZE
        }, svg);
      tile.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
          Door.SKIN.tiles);
      var te = Blockly.utils.dom.createSvgElement('text', {
        'x' : x * Door.SQUARE_SIZE,
        'y': y * Door.SQUARE_SIZE,
        
      })
    }
  }

  // Add finish marker.
};

/**
 * Initialize Blockly and the door.  Called on page load.
 */
Door.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Door.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       skin: Door.SKIN_ID,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init();

  // Setup the Pegman menu.
  var pegmanImg = document.querySelector('#pegmanButton>img');
  pegmanImg.style.backgroundImage = 'url(' + Door.SKIN.sprite + ')';
  var pegmanMenu = document.getElementById('pegmanMenu');
  var handlerFactory = function(n) {
    return function() {
      Door.changePegman(n);
    };
  };
  for (var i = 0; i < Door.SKINS.length; i++) {
    if (i == Door.SKIN_ID) {
      continue;
    }
    var div = document.createElement('div');
    var img = document.createElement('img');
    img.src = 'common/1x1.gif';
    img.style.backgroundImage = 'url(' + Door.SKINS[i].sprite + ')';
    div.appendChild(img);
    pegmanMenu.appendChild(div);
    Blockly.bindEvent_(div, 'mousedown', null, handlerFactory(i));
  }
  Blockly.bindEvent_(window, 'resize', null, Door.hidePegmanMenu);
  var pegmanButton = document.getElementById('pegmanButton');
  Blockly.bindEvent_(pegmanButton, 'mousedown', null, Door.showPegmanMenu);
  var pegmanButtonArrow = document.getElementById('pegmanButtonArrow');
  var arrow = document.createTextNode(Blockly.FieldDropdown.ARROW_CHAR);
  pegmanButtonArrow.appendChild(arrow);

  var rtl = BlocklyGames.isRtl();
  Door.SQUARE_SIZE = Door.SQUARE_SIZE * BlocklyGames.factor;
  Door.MAZE_WIDTH = Door.SQUARE_SIZE * Door.COLS;
  Door.MAZE_HEIGHT = Door.SQUARE_SIZE * Door.ROWS;
  Door.PEGMAN_HEIGHT = 130 * BlocklyGames.factor;
  Door.PEGMAN_WIDTH = 130 * BlocklyGames.factor;

  var blocklyDiv = document.getElementById('blockly');
  var visualization = document.getElementById('visualization');
  var top = visualization.offsetTop;
  var buttontable = document.getElementById('buttontable');
  var onresize = function(e) {
    var top = visualization.offsetTop;
    blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
    blocklyDiv.style.left = rtl ? '10px' : (Door.MAZE_WIDTH + 20) + 'px';
    blocklyDiv.style.width = (window.innerWidth - (Door.MAZE_WIDTH + 40)) + 'px';
    blocklyDiv.style.paddingBottom = 10 * BlocklyGames.factor + 'px';
  buttontable.style.left = blocklyDiv.offsetLeft + 'px';
  buttontable.style.width = (window.innerWidth - (Door.MAZE_WIDTH + 40)) + 'px';
  buttontable.style.top = blocklyDiv.offsetTop + Door.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('runButton').style.left = blocklyDiv.offsetLeft + 'px';
  document.getElementById('runButton').style.top = blocklyDiv.offsetTop + Door.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('resetButton').style.left = document.getElementById('runButton').offsetLeft + document.getElementById('runButton').offsetWidth + 'px';
  document.getElementById('resetButton').style.top = blocklyDiv.offsetTop + Door.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('resetButton').style.marginRight = '0px';
  };
  window.addEventListener('scroll', function() {
    onresize(null);
    Blockly.svgResize(BlocklyInterface.workspace);
    buttontable.style.left = blocklyDiv.offsetLeft + 'px';
    buttontable.style.width = (window.innerWidth - (Door.MAZE_WIDTH + 40)) + 'px';
    buttontable.style.top = blocklyDiv.offsetTop + Door.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('runButton').style.left = blocklyDiv.offsetLeft + 'px';
    document.getElementById('runButton').style.top = blocklyDiv.offsetTop + Door.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('resetButton').style.left = document.getElementById('runButton').offsetLeft + document.getElementById('runButton').offsetWidth + 'px';
    document.getElementById('resetButton').style.top = blocklyDiv.offsetTop + Door.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('resetButton').style.marginRight = '0px';
  });
  window.addEventListener('resize', onresize);
  onresize(null);
  Door.SQUARE_SIZE = Door.SQUARE_SIZE / BlocklyGames.factor;
  Door.MAZE_WIDTH = Door.SQUARE_SIZE / Door.COLS;
  Door.MAZE_HEIGHT = Door.SQUARE_SIZE / Door.ROWS;
  Door.PEGMAN_HEIGHT = 130 / BlocklyGames.factor;
  Door.PEGMAN_WIDTH = 130 / BlocklyGames.factor;

  Door.SQUARE_SIZE = Door.SQUARE_SIZE * BlocklyGames.factor;
  Door.MAZE_WIDTH = Door.SQUARE_SIZE * Door.COLS;
  Door.MAZE_HEIGHT = Door.SQUARE_SIZE * Door.ROWS;
  Door.PEGMAN_HEIGHT = 130 * BlocklyGames.factor;
  Door.PEGMAN_WIDTH = 130 * BlocklyGames.factor;

  // Scale the workspace so level 1 = 1.3, and level 10 = 1.0.
  // var scale = 1 + (1 - (BlocklyGames.LEVEL / BlocklyGames.MAX_LEVEL)) / 3;
  var scale = 1;
  BlocklyInterface.injectBlockly(
      {'maxBlocks': Door.MAX_BLOCKS,
       'rtl': rtl,
       'trashcan': true,
       'zoom': {'startScale': scale}});
  BlocklyInterface.workspace.getAudioManager().load(Door.SKIN.winSound, 'win');
  BlocklyInterface.workspace.getAudioManager().load(Door.SKIN.crashSound, 'fail');
  // Not really needed, there are no user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('moveForward,moveBackward,' +
      'turnRight,turnLeft,isPathForward,isPathRight,isPathBackward,isPathLeft');

  Door.drawMap();
  // Door.drawCoin();
  // Door.drawcoinval();
  var runButton1 = document.getElementById('runButton');
  var resetButton1 = document.getElementById('resetButton');

  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton1.style.minWidth) {
    resetButton1.style.minWidth = runButton1.offsetWidth + 'px';
  }


  // Locate the start and finish squares.
  for (var y = 0; y < Door.ROWS; y++) {
    for (var x = 0; x < Door.COLS; x++) {
      if (Door.map[y][x] == Door.SquareType.START) {
        Door.start_ = {x: x, y: y};
        Door.start1_ = {x: x, y: y};
      } else if (Door.map[y][x] == Door.SquareType.FINISH) {
        Door.finish_ = {x: x, y: y};
      }
    }
  }

  Door.reset(true);
  BlocklyInterface.workspace.addChangeListener(function() {Door.updateCapacity();});

  document.body.addEventListener('mousemove', Door.updatePegSpin_, true);

  BlocklyGames.bindClick('runButton', Door.runButtonClick);
  BlocklyGames.bindClick('resetButton', Door.resetButtonClick);


  // Add the spinning Pegman icon to the done dialog.
  // <img id="pegSpin" src="common/1x1.gif">
  var buttonDiv = document.getElementById('dialogDoneButtons');
  var pegSpin = document.createElement('img');
  pegSpin.id = 'pegSpin';
  pegSpin.src = 'common/1x1.gif';
  pegSpin.style.backgroundImage = 'url(' + Door.SKIN.sprite + ')';
  buttonDiv.parentNode.insertBefore(pegSpin, buttonDiv);

  // Lazy-load the JavaScript interpreter.
  BlocklyInterface.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyInterface.importPrettify();
  BlocklyGames.bindClick('helpButton', Door.showHelp);
};

/**
 * When the workspace changes, update the help as needed.
 * @param {Blockly.Events.Abstract=} opt_event Custom data for event.
 */
Door.levelHelp = function(opt_event) {
  if (opt_event && opt_event.type == Blockly.Events.UI) {
    // Just a change to highlighting or somesuch.
    return;
  } else if (BlocklyInterface.workspace.isDragging()) {
    // Don't change helps during drags.
    return;
  } else if (Door.result == Door.ResultType.SUCCESS ||
             BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
                                               BlocklyGames.LEVEL)) {
    // The user has already won.  They are just playing around.
    return;
  }
  var rtl = BlocklyGames.isRtl();
  var userBlocks = Blockly.Xml.domToText(
      Blockly.Xml.workspaceToDom(BlocklyInterface.workspace));
  var toolbar = BlocklyInterface.workspace.flyout_.workspace_.getTopBlocks(true);
  var content = null;
  var origin = null;
  var style = null;
  if (BlocklyGames.LEVEL == 1) {
    // if (BlocklyInterface.workspace.getAllBlocks().length < 2) {
    //   content = document.getElementById('dialogHelpStack');
    //   style = {'width': '370px', 'top': '130px'};
    //   style[rtl ? 'right' : 'left'] = '215px';
    //   origin = toolbar[0].getSvgRoot();
    // } else {
    //   var topBlocks = BlocklyInterface.workspace.getTopBlocks(true);
    //   if (topBlocks.length > 1) {
    //     var xml = [
    //         '<xml>',
    //           '<block type="door_moveForward" x="10" y="10">',
    //             '<next>',
    //               '<block type="door_moveForward"></block>',
    //             '</next>',
    //           '</block>',
    //         '</xml>'];
    //     BlocklyInterface.injectReadonly('sampleOneTopBlock', xml);
    //     content = document.getElementById('dialogHelpOneTopBlock');
    //     style = {'width': '360px', 'top': '120px'};
    //     style[rtl ? 'right' : 'left'] = '225px';
    //     origin = topBlocks[0].getSvgRoot();
    //   } else if (Door.result == Door.ResultType.UNSET) {
    //     // Show run help dialog.
    //     content = document.getElementById('dialogHelpRun');
    //     style = {'width': '360px', 'top': '410px'};
    //     style[rtl ? 'right' : 'left'] = '400px';
    //     origin = document.getElementById('runButton');
    //   }
    // }
  } else if (BlocklyGames.LEVEL == 2) {
    if (Door.result != Door.ResultType.UNSET &&
        document.getElementById('runButton').style.display == 'none') {
      content = document.getElementById('dialogHelpReset');
      style = {'width': '360px', 'top': '410px'};
      style[rtl ? 'right' : 'left'] = '400px';
      origin = document.getElementById('resetButton');
    }
  } else if (BlocklyGames.LEVEL == 3) {
    if (userBlocks.indexOf('door_forever') == -1) {
      if (BlocklyInterface.workspace.remainingCapacity() == 0) {
        content = document.getElementById('dialogHelpCapacity');
        style = {'width': '430px', 'top': '310px'};
        style[rtl ? 'right' : 'left'] = '50px';
        origin = document.getElementById('capacityBubble');
      } else {
        content = document.getElementById('dialogHelpRepeat');
        style = {'width': '360px', 'top': '360px'};
        style[rtl ? 'right' : 'left'] = '425px';
        origin = toolbar[3].getSvgRoot();
      }
    }
  } else if (BlocklyGames.LEVEL == 4) {
    if (BlocklyInterface.workspace.remainingCapacity() == 0 &&
        (userBlocks.indexOf('door_forever') == -1 ||
         BlocklyInterface.workspace.getTopBlocks(false).length > 1)) {
      content = document.getElementById('dialogHelpCapacity');
      style = {'width': '430px', 'top': '310px'};
      style[rtl ? 'right' : 'left'] = '50px';
      origin = document.getElementById('capacityBubble');
    } else {
      var showHelp = true;
      // Only show help if there is not a loop with two nested blocks.
      var blocks = BlocklyInterface.workspace.getAllBlocks();
      for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        if (block.type != 'door_forever') {
          continue;
        }
        var j = 0;
        while (block) {
          var kids = block.getChildren();
          block = kids.length ? kids[0] : null;
          j++;
        }
        if (j > 2) {
          showHelp = false;
          break;
        }
      }
      if (showHelp) {
        content = document.getElementById('dialogHelpRepeatMany');
        style = {'width': '360px', 'top': '360px'};
        style[rtl ? 'right' : 'left'] = '425px';
        origin = toolbar[3].getSvgRoot();
      }
    }
  } else if (BlocklyGames.LEVEL == 5) {
    if (Door.SKIN_ID == 0 && !Door.showPegmanMenu.activatedOnce) {
      content = document.getElementById('dialogHelpSkins');
      style = {'width': '360px', 'top': '60px'};
      style[rtl ? 'left' : 'right'] = '20px';
      origin = document.getElementById('pegmanButton');
    }
  } else if (BlocklyGames.LEVEL == 6) {
    if (userBlocks.indexOf('door_if') == -1) {
      content = document.getElementById('dialogHelpIf');
      style = {'width': '360px', 'top': '430px'};
      style[rtl ? 'right' : 'left'] = '425px';
      origin = toolbar[4].getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL == 7) {
    if (!Door.levelHelp.initialized7_) {
      // Create fake dropdown.
      var span = document.createElement('span');
      span.className = 'helpMenuFake';
      var options =
          [BlocklyGames.getMsg('Door_pathAhead'),
           BlocklyGames.getMsg('Door_pathLeft'),
           BlocklyGames.getMsg('Door_pathRight')];
      var prefix = Blockly.utils.string.commonWordPrefix(options);
      var suffix = Blockly.utils.string.commonWordSuffix(options);
      if (suffix) {
        var option = options[0].slice(prefix, -suffix);
      } else {
        var option = options[0].substring(prefix);
      }
      // Add dropdown arrow: "option ▾" (LTR) or "▾ אופציה" (RTL)
      span.textContent = option + ' ' + Blockly.FieldDropdown.ARROW_CHAR;
      // Inject fake dropdown into message.
      var container = document.getElementById('helpMenuText');
      var msg = container.textContent;
      container.textContent = '';
      var parts = msg.split(/%\d/);
      for (var i = 0; i < parts.length; i++) {
        container.appendChild(document.createTextNode(parts[i]));
        if (i != parts.length - 1) {
          container.appendChild(span.cloneNode(true));
        }
      }
      Door.levelHelp.initialized7_ = true;
    }
    // The hint says to change from 'ahead', but keep the hint visible
    // until the user chooses 'right'.
    if (userBlocks.indexOf('isPathRight') == -1) {
      content = document.getElementById('dialogHelpMenu');
      style = {'width': '360px', 'top': '430px'};
      style[rtl ? 'right' : 'left'] = '425px';
      origin = toolbar[4].getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL == 9) {
    if (userBlocks.indexOf('door_ifElse') == -1) {
      content = document.getElementById('dialogHelpIfElse');
      style = {'width': '360px', 'top': '305px'};
      style[rtl ? 'right' : 'left'] = '425px';
      origin = toolbar[5].getSvgRoot();
    }
  }
  if (content) {
    if (content.parentNode != document.getElementById('dialog')) {
      BlocklyDialogs.showDialog(content, origin, true, false, style, null);
    }
  } else {
    BlocklyDialogs.hideDialog(false);
  }
};

/**
 * Reload with a different Pegman skin.
 * @param {number} newSkin ID of new skin.
 */
Door.changePegman = function(newSkin) {
  BlocklyInterface.saveToSessionStorage();
  location = location.protocol + '//' + location.host + location.pathname +
      '?lang=' + BlocklyGames.LANG + '&level=' + BlocklyGames.LEVEL +
      '&skin=' + newSkin;
};

/**
 * Display the Pegman skin-change menu.
 * @param {!Event} e Mouse, touch, or resize event.
 */
Door.showPegmanMenu = function(e) {
  var menu = document.getElementById('pegmanMenu');
  if (menu.style.display == 'block') {
    // Menu is already open.  Close it.
    Door.hidePegmanMenu(e);
    return;
  }
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  var button = document.getElementById('pegmanButton');
  button.classList.add('buttonHover');
  menu.style.top = (button.offsetTop + button.offsetHeight) + 'px';
  menu.style.left = button.offsetLeft + 'px';
  menu.style.display = 'block';
  Door.pegmanMenuMouse_ =
      Blockly.bindEvent_(document.body, 'mousedown', null, Door.hidePegmanMenu);
  // Close the skin-changing hint if open.
  var hint = document.getElementById('dialogHelpSkins');
  if (hint && hint.className != 'dialogHiddenContent') {
    BlocklyDialogs.hideDialog(false);
  }
  Door.showPegmanMenu.activatedOnce = true;
};

/**
 * Hide the Pegman skin-change menu.
 * @param {!Event} e Mouse, touch, or resize event.
 */
Door.hidePegmanMenu = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  document.getElementById('pegmanMenu').style.display = 'none';
  document.getElementById('pegmanButton').classList.remove('buttonHover');
  if (Door.pegmanMenuMouse_) {
    Blockly.unbindEvent_(Door.pegmanMenuMouse_);
    delete Door.pegmanMenuMouse_;
  }
};

/**
 * Reset the door to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Door.reset = function(first) {
  // Kill all tasks.
  for (var i = 0; i < Door.pidList.length; i++) {
    clearTimeout(Door.pidList[i]);
  }
  Door.pidList = [];
  Door.prevlog.clear();
  // Move Pegman into position.
  Door.pegmanX = Door.start1_.x;
  Door.pegmanY = Door.start1_.y;
  Door.pegmanXcheck = Door.pegmanX;
  Door.pegmanYcheck = Door.pegmanY;
  if (first) {
    // Opening animation.
    Door.pegmanD = Door.startDirection - 2;
    Door.scheduleFinish(false);
    Door.pidList.push(setTimeout(function() {
      Door.stepSpeed = 130;
      //BlocklyGames.coinval = 100;
      Door.schedule([Door.pegmanX, Door.pegmanY, Door.pegmanD * 2],
                    [Door.pegmanX, Door.pegmanY, Door.pegmanD * 2 + 4]);
      Door.pegmanD = Door.startDirection;
      Door.pegmanDcheck = Door.pegmanD;
    }, Door.stepSpeed * 5));
  } else {
    Door.pegmanD = Door.startDirection;
    Door.pegmanDcheck = Door.pegmanD;
    Door.displayPegman(Door.pegmanX, Door.pegmanY, Door.pegmanD * 2);
  }

  // Move the finish icon into position.

  // Make 'look' icon invisible and promote to top.
  // lookIcon.parentNode.appendChild(lookIcon);
  // var paths = lookIcon.getElementsByTagName('path');
  // for (var i = 0, path; (path = paths[i]); i++) {
  //   path.setAttribute('stroke', Door.SKIN.look);
  // }
};

/**
 * Click the run button.  Start the program.
 * @param {!Event} e Mouse or touch event.
 */
Door.runButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  BlocklyDialogs.hideDialog(false);
  // Only allow a single top block on level 1.
  // if (BlocklyGames.LEVEL == 1 &&
  //     BlocklyInterface.workspace.getTopBlocks(false).length > 1 &&
  //     Door.result != Door.ResultType.SUCCESS &&
  //     !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
  //                                        BlocklyGames.LEVEL)) {
  //   // Door.levelHelp();
  //   return;
  // }
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  // runButton.style.display = 'none';
  // resetButton.style.display = 'inline';
  // Door.reset(false);
  Door.execute();
};

/**
 * Updates the document's 'capacity' element with a message
 * indicating how many more blocks are permitted.  The capacity
 * is retrieved from BlocklyInterface.workspace.remainingCapacity().
 */
Door.updateCapacity = function() {
  var cap = BlocklyInterface.workspace.remainingCapacity();
  var p = document.getElementById('capacity');
  if (cap == Infinity) {
    p.style.display = 'none';
  } else {
    p.style.display = 'inline';
    p.innerHTML = '';
    cap = Number(cap);
    var capSpan = document.createElement('span');
    capSpan.className = 'capacityNumber';
    capSpan.appendChild(document.createTextNode(cap));
    if (cap == 0) {
      var msg = BlocklyGames.getMsg('Door_capacity0');
    } else if (cap == 1) {
      var msg = BlocklyGames.getMsg('Door_capacity1');
    } else {
      var msg = BlocklyGames.getMsg('Door_capacity2');
    }
    var parts = msg.split(/%\d/);
    for (var i = 0; i < parts.length; i++) {
      p.appendChild(document.createTextNode(parts[i]));
      if (i != parts.length - 1) {
        p.appendChild(capSpan.cloneNode(true));
      }
    }
  }
};

/**
 * Click the reset button.  Reset the door.
 * @param {!Event} e Mouse or touch event.
 */
Door.resetButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  //var runButton = document.getElementById('runButton');
  //runButton.style.display = 'inline';
  //document.getElementById('resetButton').style.display = 'none';
  BlocklyInterface.workspace.highlightBlock(null);
  Door.reset(false);
  Door.levelHelp();
};

/**
 * Inject the Door API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS-Interpreter.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Door.initInterpreter = function(interpreter, globalObject) {
  // API
  var wrapper;
  wrapper = function(x1, y1, x2, y2, id) {
    Door.moveBlockf(x1, y1, x2, y2, id);
  };
  interpreter.setProperty(globalObject, 'moveblock',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(x, y, direction, angle, id) {
    Door.rotateBlockf(x, y, direction, angle, id);
  };
  interpreter.setProperty(globalObject, 'rotateblock',
      interpreter.createNativeFunction(wrapper));

};

/**
 * Execute the user's code.  Heaven help us...
 */
Door.execute = function() {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Door.execute, 250);
    return;
  }

  Door.log = [];
  Blockly.selected && Blockly.selected.unselect();
  var code = BlocklyInterface.getJsCode();
  BlocklyInterface.executedJsCode = code;
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
  Door.result = Door.ResultType.UNSET;
  var interpreter = new Interpreter(code, Door.initInterpreter);

  // Try running the user's code.  There are four possible outcomes:
  // 1. If pegman reaches the finish [SUCCESS], true is thrown.
  // 2. If the program is terminated due to running too long [TIMEOUT],
  //    false is thrown.
  // 3. If another error occurs [ERROR], that error is thrown.
  // 4. If the program ended normally but without solving the door [FAILURE],
  //    no error or exception is thrown.
  try {
    var ticks = 10000;  // 10k ticks runs Pegman for about 8 minutes.
    while (interpreter.step()) {
      if (ticks-- == 0) {
        throw Infinity;
      }
    }
    Door.result = Door.notDone() ?
        Door.ResultType.FAILURE : Door.ResultType.SUCCESS;
  } catch (e) {
    // A boolean is thrown for normal termination.
    // Abnormal termination is a user error.
    if (e === Infinity) {
      Door.result = Door.ResultType.TIMEOUT;
    } else if (e === false) {
      Door.result = Door.ResultType.ERROR;
    } else {
      // Syntax error, can't happen.
      Door.result = Door.ResultType.ERROR;
      alert(e);
    }
  }

  // Fast animation if execution is successful.  Slow otherwise.
  if (Door.result == Door.ResultType.SUCCESS) {
    Door.stepSpeed = 80;
    Door.log.push(['finish', null]);
  } else {
    Door.stepSpeed = 130;
  }
  // Door.log now contains a transcript of all the user's actions.
  // Reset the door and animate the transcript.
  // Door.reset(false);
  Door.pidList.push(setTimeout(Door.animate, 100));
};

/**
 * Iterate through the recorded path and animate pegman's actions.
 */
Door.prevlog = new Set();
Door.animate = function() {
  var action = Door.log.shift();
  if (!action) {
    BlocklyInterface.highlight(null);
    Door.levelHelp();
    return;
  }
  if(!Door.prevlog.has(action[1])){
    BlocklyInterface.highlight(action[1]);
    switch (action[0]) {
      case 'move':
        var block1 = document.getElementById(action[2].toString() + action[3].toString());
        var block2 = document.getElementById(action[4].toString() + action[5].toString());
        var dummyX = block1.getAttribute('x');
        var dummY = block1.getAttribute('y');
        alert(action[2].toString() + action[3].toString());
        alert(block2.getAttribute('x'));
        block1.setAttribute('x', block2.getAttribute('x'));
        block1.setAttribute('y', block2.getAttribute('y'));
        block2.setAttribute('x', dummyX);
        block2.setAttribute('y', dummY);
        document.getElementById('tileClipPath' + action[2].toString() + action[3].toString()).setAttribute('x', block1.getAttribute('x'));
        document.getElementById('tileClipPath' + action[2].toString() + action[3].toString()).setAttribute('y', block1.getAttribute('y'));
        document.getElementById('tileClipPath' + action[4].toString() + action[5].toString()).setAttribute('x', block2.getAttribute('x'));
        document.getElementById('tileClipPath' + action[4].toString() + action[5].toString()).setAttribute('y', block2.getAttribute('y'));
        break;
      case 'leftRotate':
        break;
      case 'rightRotate':
        break;
      case 'finish':
        Door.scheduleFinish(true);
      }
      Door.prevlog.add(action[1]);
      var factor = Door.timevalue;
  }
  else {
    var factor = 1;
  }
  // console.log(Door.prevlog);
  Door.pidList.push(setTimeout(Door.animate, Door.stepSpeed * factor));
};

/**
 * Point the congratulations Pegman to face the mouse.
 * @param {Event} e Mouse move event.
 * @private
 */
Door.updatePegSpin_ = function(e) {
  if (document.getElementById('dialogDone').className ==
      'dialogHiddenContent') {
    return;
  }
  var pegSpin = document.getElementById('pegSpin');
  var bBox = BlocklyDialogs.getBBox_(pegSpin);
  var x = bBox.x + bBox.width / 2 - window.pageXOffset;
  var y = bBox.y + bBox.height / 2 - window.pageYOffset;
  var dx = e.clientX - x;
  var dy = e.clientY - y;
  var angle = Blockly.utils.math.toDegrees(Math.atan(dy / dx));
  // 0: North, 90: East, 180: South, 270: West.
  if (dx > 0) {
    angle += 90;
  } else {
    angle += 270;
  }
  // Divide into 16 quads.
  var quad = Math.round(angle / 360 * 16);
  if (quad == 16) {
    quad = 15;
  }
  // Display correct Pegman sprite.
  pegSpin.style.backgroundPosition = (-quad * Door.PEGMAN_WIDTH) + 'px 0px';
};

/**
 * Schedule the animations for a move or turn.
 * @param {!Array.<number>} startPos X, Y and direction starting points.
 * @param {!Array.<number>} endPos X, Y and direction ending points.
 */
Door.schedule = function(startPos, endPos) {
  // var deltas = [(endPos[0] - startPos[0]) ,
  //               (endPos[1] - startPos[1]) ,
  //               (endPos[2] - startPos[2])];
  // deltas[2] = deltas[2] > 8 ? (deltas[2] - 16) : deltas[2];
  // var factor;
  // var consolation = deltas[2] < 0 ? deltas[2] : 0;
  // if(deltas[2] > 0){
  //   switch (Math.abs(deltas[2])) {
  //     case 2:
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 1 + consolation));
  //       }, Door.stepSpeed));
  //       factor = 2;
  //       break;
  //     case 4:
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 1 + consolation));
  //       }, Door.stepSpeed));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 2 + consolation));
  //       }, Door.stepSpeed * 2));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 3 + consolation));
  //       }, Door.stepSpeed * 3));
  //       factor = 4;
  //       break;
  //     case 6:
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 1 + consolation));
  //       }, Door.stepSpeed));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 2 + consolation));
  //       }, Door.stepSpeed * 2));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 3 + consolation));
  //       }, Door.stepSpeed * 3));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 4 + consolation));
  //       }, Door.stepSpeed * 4));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 5 + consolation));
  //       }, Door.stepSpeed * 5));
  //       factor = 6;
  //       break;
  //     case 8:
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 1 + consolation));
  //       }, Door.stepSpeed));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 2 + consolation));
  //       }, Door.stepSpeed * 2));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 3 + consolation));
  //       }, Door.stepSpeed * 3));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 4 + consolation));
  //       }, Door.stepSpeed * 4));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 5 + consolation));
  //       }, Door.stepSpeed * 5));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 6 + consolation));
  //       }, Door.stepSpeed * 6));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 7 + consolation));
  //       }, Door.stepSpeed * 7));
  //       factor = 8;
  //       break;
  //   }
  // }
  // else if(deltas[2] < 0){
  //   switch (Math.abs(deltas[2])) {
  //     case 2:
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 1 + consolation));
  //       }, Door.stepSpeed));
  //       factor = 2;
  //       break;
  //     case 4:
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 3 + consolation));
  //       }, Door.stepSpeed));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 2 + consolation));
  //       }, Door.stepSpeed * 2));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 1 + consolation));
  //       }, Door.stepSpeed * 3));
  //       factor = 4;
  //       break;
  //     case 6:
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 5 + consolation));
  //       }, Door.stepSpeed));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 4 + consolation));
  //       }, Door.stepSpeed * 2));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 3 + consolation));
  //       }, Door.stepSpeed * 3));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 2 + consolation));
  //       }, Door.stepSpeed * 4));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 1 + consolation));
  //       }, Door.stepSpeed * 5));
  //       factor = 6;
  //       break;
  //     case 8:
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 7 + consolation));
  //       }, Door.stepSpeed));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 6 + consolation));
  //       }, Door.stepSpeed * 2));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 5 + consolation));
  //       }, Door.stepSpeed * 3));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 4 + consolation));
  //       }, Door.stepSpeed * 4));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 3 + consolation));
  //       }, Door.stepSpeed * 5));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 2 + consolation));
  //       }, Door.stepSpeed * 6));
  //     Door.pidList.push(setTimeout(function() {
  //         Door.displayPegman(startPos[0] + deltas[0] * 2,
  //             startPos[1] + deltas[1] * 2,
  //             Door.constrainDirection16(startPos[2] + 1 + consolation));
  //       }, Door.stepSpeed * 7));
  //       factor = 8;
  //       break;
  //   }
  // }
  // else if(deltas[2] == 0){
  //   // alert(startPos[2]);
  //   // pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href','start/' + startPos[2] + '.png');
  //   for(var i=1; i <= (Math.abs(deltas[0]) * 32 || Math.abs(deltas[1]) * 32); i++ ) {
  //     Door.timeout = function(val) {
  //       Door.pidList.push(setTimeout(function() {
  //          Door.displayPegman(startPos[0] + (deltas[0] * val / 32) ,
  //              (startPos[1] + deltas[1] * val / 32),
  //              Door.constrainDirection16(val-1));
  //        }, Door.stepSpeed * val));
  //     }
  //     Door.timeout(i);
  //   }
  //   factor = Math.abs(deltas[0]) > Math.abs(deltas[1]) ? Math.abs(deltas[0]) * 32 + 4 : Math.abs(deltas[1]) * 32 + 4;
  //   Door.pidList.push(setTimeout(function() {
  //       // pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href','start/Idle.png');
  //       Door.displayPegman(endPos[0], endPos[1],
  //           Door.constrainDirection16(endPos[2]));
  //     }, Door.stepSpeed * (factor - 2)));
  // }
  // Door.timevalue = factor + 2;
  // BlocklyGames.updatecoinvalue();
  // Door.pidList.push(setTimeout(function() {
  //     Door.displayPegman(endPos[0], endPos[1],
  //         Door.constrainDirection16(endPos[2]));
  //   }, Door.stepSpeed * factor));
  //
};

/**
 * Schedule the animations and sounds for a failed move.
 * @param {boolean} forward True if forward, false if backward.
 */
Door.scheduleFail = function(forward) {
  // var deltaX = 0;
  // var deltaY = 0;
  // // BlocklyGames.coinval -=10;
  // // Door.drawcoinval();
  // BlocklyGames.updatecoinvalue();
  // switch (Door.pegmanD) {
  //   case Door.DirectionType.NORTH:
  //     deltaY = -1;
  //     break;
  //   case Door.DirectionType.NORTHEAST:
  //     deltaX = 1;
  //     deltaY = -1;
  //     break;
  //   case Door.DirectionType.EAST:
  //     deltaX = 1;
  //     break;
  //   case Door.DirectionType.SOUTHEAST:
  //     deltaX = 1;
  //     deltaY = 1;
  //     break;
  //   case Door.DirectionType.SOUTH:
  //     deltaY = 1;
  //     break;
  //   case Door.DirectionType.SOUTHWEST:
  //     deltaX = -1;
  //     deltaY = 1;
  //     break;
  //   case Door.DirectionType.WEST:
  //     deltaX = -1;
  //     break;
  //   case Door.DirectionType.NORTHWEST:
  //     deltaX = -1;
  //     deltaY = -1;
  //     break;
  //
  // }
  // if (!forward) {
  //   deltaX = -deltaX;
  //   deltaY = -deltaY;
  // }
  // if (Door.SKIN.crashType == Door.CRASH_STOP) {
  //   // Bounce bounce.
  //   deltaX /= 4;
  //   deltaY /= 4;
  //   var direction16 = Door.constrainDirection16(Door.pegmanD * 2);
  //   Door.displayPegman(Door.pegmanX + deltaX,
  //                      Door.pegmanY + deltaY,
  //                      direction16);
  //   BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
  //   Door.pidList.push(setTimeout(function() {
  //     Door.displayPegman(Door.pegmanX,
  //                        Door.pegmanY,
  //                        direction16);
  //     }, Door.stepSpeed));
  //   Door.pidList.push(setTimeout(function() {
  //     Door.displayPegman(Door.pegmanX + deltaX,
  //                        Door.pegmanY + deltaY,
  //                        direction16);
  //     BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
  //   }, Door.stepSpeed * 2));
  //   Door.pidList.push(setTimeout(function() {
  //       Door.displayPegman(Door.pegmanX, Door.pegmanY, direction16);
  //     }, Door.stepSpeed * 3));
  // } else {
  //   // Add a small random delta away from the grid.
  //   var deltaZ = (Math.random() - 0.5) * 10;
  //   var deltaD = (Math.random() - 0.5) / 2;
  //   deltaX += (Math.random() - 0.5) / 4;
  //   deltaY += (Math.random() - 0.5) / 4;
  //   deltaX /= 8;
  //   deltaY /= 8;
  //   var acceleration = 0;
  //   if (Door.SKIN.crashType == Door.CRASH_FALL) {
  //     acceleration = 0.01;
  //   }
  //   Door.pidList.push(setTimeout(function() {
  //     BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
  //   }, Door.stepSpeed * 2));
  //   var setPosition = function(n) {
  //     return function() {
  //       var direction16 = Door.constrainDirection16(Door.pegmanD * 4 +
  //                                                   deltaD * n);
  //       Door.displayPegman(Door.pegmanX + deltaX * n,
  //                          Door.pegmanY + deltaY * n,
  //                          direction16,
  //                          deltaZ * n);
  //       deltaY += acceleration;
  //     };
  //   };
  //   // 100 frames should get Pegman offscreen.
  //   for (var i = 1; i < 100; i++) {
  //     Door.pidList.push(setTimeout(setPosition(i),
  //         Door.stepSpeed * i / 2));
  //   }
  // }
};

/**
 * Schedule the animations and sound for a victory dance.
 * @param {boolean} sound Play the victory sound.
 */
Door.scheduleFinish = function(sound) {
  var direction16 = Door.constrainDirection16(Door.pegmanD * 2);
  Door.displayPegman(Door.pegmanX, Door.pegmanY, 16);
  if (sound) {
    BlocklyInterface.workspace.getAudioManager().play('win', 0.5);
  }
  Door.stepSpeed = 150;  // Slow down victory animation a bit.
  Door.pidList.push(setTimeout(function() {
    Door.displayPegman(Door.pegmanX, Door.pegmanY, 18);
    }, Door.stepSpeed));
  Door.pidList.push(setTimeout(function() {
    Door.displayPegman(Door.pegmanX, Door.pegmanY, 16);
    }, Door.stepSpeed * 2));
  Door.pidList.push(setTimeout(function() {
      Door.displayPegman(Door.pegmanX, Door.pegmanY, direction16);
    }, Door.stepSpeed * 3));
};

/**
 * Display Pegman at the specified location, facing the specified direction.
 * @param {number} x Horizontal grid (or fraction thereof).
 * @param {number} y Vertical grid (or fraction thereof).
 * @param {number} d Direction (0 - 15) or dance (16 - 17).
 * @param {number=} opt_angle Optional angle (in degrees) to rotate Pegman.
 */
Door.displayPegman = function(x, y, d, opt_angle) {
  // var valueX = 0;
  // var valueY = 0;
  // var pegmanIcon = document.getElementById('pegman');
  // pegmanIcon.setAttribute('x',
  //     x * Door.SQUARE_SIZE - d * Door.PEGMAN_WIDTH + 1 + valueX);
  // pegmanIcon.setAttribute('y',
  //     Door.SQUARE_SIZE * (y + 0.5) - Door.PEGMAN_HEIGHT / 2 - 8 + valueY);
  // if (opt_angle) {
  //   pegmanIcon.setAttribute('transform', 'rotate(' + opt_angle + ', ' +
  //       (x * Door.SQUARE_SIZE + Door.SQUARE_SIZE / 2) + ', ' +
  //       (y * Door.SQUARE_SIZE + Door.SQUARE_SIZE / 2) + ')');
  // } else {
  //   pegmanIcon.setAttribute('transform', 'rotate(0, 0, 0)');
  // }
  // // Door.scheduleLook(x , y, Door.constrainDirection4(Door.pegmanD));
  // var clipRect = document.getElementById('clipRect');
  // clipRect.setAttribute('x', x * Door.SQUARE_SIZE + 1 +valueX);
  // clipRect.setAttribute('y', pegmanIcon.getAttribute('y'));
};

/**
 * Display the look icon at Pegman's current location,
 * in the specified direction.
 * @param {!Door.DirectionType} d Direction (0 - 3).
 */
Door.scheduleLook = function(x, y, d) {
  x -=0.10;
  y -= 0.25;
  x *= Door.SQUARE_SIZE;
  y *= Door.SQUARE_SIZE;
  var deg = d * 90 - 45;

};

/**
 * Schedule one of the 'look' icon's waves to appear, then disappear.
 * @param {!Element} path Element to make appear.
 * @param {number} delay Milliseconds to wait before making wave appear.
 */
Door.scheduleLookStep = function(path, delay) {
  Door.pidList.push(setTimeout(function() {
    path.style.display = 'inline';
    setTimeout(function() {
      path.style.display = 'none';
    }, Door.stepSpeed * 2);
  }, delay));
};

/**
 * Keep the direction within 0-4, wrapping at both ends.
 * @param {number} d Potentially out-of-bounds direction value.
 * @return {number} Legal direction value.
 */
Door.constrainDirection4 = function(d) {
  d = Math.round(d) % 8;
  if (d < 0) {
    d += 8;
  }
  return d;
};

/**
 * Keep the direction within 0-15, wrapping at both ends.
 * @param {number} d Potentially out-of-bounds direction value.
 * @return {number} Legal direction value.
 */
Door.constrainDirection16 = function(d) {
  d = Math.round(d) % 16;
  if (d < 0) {
    d += 16;
  }
  return d;
};


Door.moveBlockf = function(x1, y1, x2, y2, id) {
  if(!Door.prevlog.has(id)){
    var command;
    command = 'move'
    Door.log.push([command, id, x1, y1, x2, y2]);
  }
};

Door.rotateBlockf = function(x, y, direction, angle, id) {
  if(!Door.prevlog.has(id)){
    var command;
    if(direction == 'right')
    {
      command = 'rightRotate';
    }
    else {
      command = 'leftRotate';
    }
    Door.log.push([command, id, x, y, angle]);
  }
};
/**
 * Is there a path next to pegman?
 * @param {number} direction Direction to look
 *     (0 = forward, 1 = right, 2 = backward, 3 = left).
 * @param {?string} id ID of block that triggered this action.
 *     Null if called as a helper function in Door.move().
 * @return {boolean} True if there is a path.
 */
Door.isPath = function(direction, id) {
  if(!Door.prevlog.has(id))
  {
    var effectiveDirection = Door.pegmanDcheck + direction;
    var square;
    var cdirection;
    var command;
    switch (Door.constrainDirection4(effectiveDirection)) {
      case Door.DirectionType.NORTH:
        square = Door.map[Door.pegmanYcheck - 1] &&
            Door.map[Door.pegmanYcheck - 1][Door.pegmanXcheck];
        command = 'look_north';
        break;
      case Door.DirectionType.NORTHEAST:
        square = Door.map[Door.pegmanYcheck - 1][Door.pegmanXcheck + 1] &&
            Door.map[Door.pegmanYcheck -1];
        command = 'look_northeast';
        break;
      case Door.DirectionType.EAST:
        square = Door.map[Door.pegmanYcheck][Door.pegmanXcheck + 1];
        command = 'look_east';
        break;
      case Door.DirectionType.SOUTHEAST:
        square = Door.map[Door.pegmanYcheck + 1][Door.pegmanXcheck + 1] &&
            Door.map[Door.pegmanYcheck + 1];
        command = 'look_southeast';
        break;
      case Door.DirectionType.SOUTH:
        square = Door.map[Door.pegmanYcheck + 1] &&
            Door.map[Door.pegmanYcheck + 1][Door.pegmanXcheck];
        command = 'look_south';
        break;
      case Door.DirectionType.SOUTHWEST:
        square = Door.map[Door.pegmanYcheck + 1][Door.pegmanXcheck - 1] &&
            Door.map[Door.pegmanYcheck + 1];
        command = 'look_southwest';
        break;
      case Door.DirectionType.WEST:
        square = Door.map[Door.pegmanYcheck][Door.pegmanXcheck - 1];
        command = 'look_west';
        break;
      case Door.DirectionType.NORTHWEST:
        square = Door.map[Door.pegmanYcheck - 1][Door.pegmanXcheck - 1] &&
            Door.map[Door.pegmanYcheck - 1];
        command = 'look_northwest';
        break;
    }
  }
  // alert(effectiveDirection);
  if (id) {
    Door.log.push([command, id]);
  }
  return square !== Door.SquareType.WALL && square !== undefined && effectiveDirection == Door.correctdirections[Door.pegmanYcheck][Door.pegmanXcheck];
};

/**
 * Is the player at the finish marker?
 * @return {boolean} True if not done, false if done.
 */
Door.notDone = function() {
  return Door.pegmanXcheck != Door.finish_.x || Door.pegmanYcheck != Door.finish_.y;
  // return Door.pegmanXcheck != Door.finish_.x || Door.pegmanYcheck != Door.finish_.y || Door.pegmanDcheck == Door.correctdirections[Door.pegmanYcheck][Door.pegmanXcheck];
};

Door.showHelp = function() {
  var help = document.getElementById('help');
  var button = document.getElementById('helpButton');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };
  BlocklyDialogs.showDialog(help, button, true, true, style, Door.hideHelp);
  BlocklyDialogs.bridgeDialogKeyDown();
};

Door.hideHelp = function() {
 BlocklyDialogs.stopDialogKeyDown();
};

window.addEventListener('load', Door.init);
