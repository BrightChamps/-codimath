/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Maze game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Maze');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Trashcan');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.math');
goog.require('Blockly.utils.string');
goog.require('Blockly.VerticalFlyout');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Maze.Blocks');
goog.require('Maze.soy');


BlocklyGames.NAME = 'maze';

/**
 * Go to the next level.  Add skin parameter.
 * @suppress {duplicate}
 */

Maze.MAX_BLOCKS = [undefined, // Level 0.
    Infinity, Infinity, 2, 5, 5, 5, 5, 10, 7, 10][BlocklyGames.LEVEL];

// Crash type constants.
Maze.CRASH_STOP = 1;
Maze.CRASH_SPIN = 2;
Maze.CRASH_FALL = 3;

Maze.SKINS = [
  // sprite: A 1029x51 set of 21 avatar images.
  // tiles: A 250x200 set of 20 map images.
  // marker: A 20x34 goal image.
  // background: An optional 400x450 background image, or false.
  // look: Colour of sonar-like look icon.
  // winSound: List of sounds (in various formats) to play when the player wins.
  // crashSound: List of sounds (in various formats) for player crashes.
  // crashType: Behaviour when player crashes (stop, spin, or fall).
  {
    sprite: 'maze/pegman.png',
    tiles: 'maze/maze-2.png',
    idlesprite: 'maze/Idle.png',
    marker: 'maze/marker.png',
    background: 'maze/T2.png',
    look: '#000',
    coin: 'maze/coin-sprite.png',
    winSound: ['maze/win.mp3', 'maze/win.ogg'],
    crashSound: ['maze/fail_pegman.mp3', 'maze/fail_pegman.ogg'],
    crashType: Maze.CRASH_STOP
  },
  {
    sprite: 'maze/astro.png',
    tiles: 'maze/tiles_astro.png',
    marker: 'maze/marker.png',
    background: 'maze/bg_astro.jpg',
    // Coma star cluster, photo by George Hatfield, used with permission.
    look: '#fff',
    coin: 'maze/coin.png',
    winSound: ['maze/win.mp3', 'maze/win.ogg'],
    crashSound: ['maze/fail_astro.mp3', 'maze/fail_astro.ogg'],
    crashType: Maze.CRASH_SPIN
  },
  {
    sprite: 'maze/panda.png',
    tiles: 'maze/tiles_panda.png',
    marker: 'maze/marker.png',
    background: 'maze/bg_panda.jpg',
    // Spring canopy, photo by Rupert Fleetingly, CC licensed for reuse.
    look: '#000',
    coin: 'maze/coin.png',
    winSound: ['maze/win.mp3', 'maze/win.ogg'],
    crashSound: ['maze/fail_panda.mp3', 'maze/fail_panda.ogg'],
    crashType: Maze.CRASH_FALL
  }
];
Maze.SKIN_ID = BlocklyGames.getNumberParamFromUrl('skin', 0, Maze.SKINS.length);
Maze.SKIN = Maze.SKINS[Maze.SKIN_ID];

/**
 * Milliseconds between each animation frame.
 */
Maze.stepSpeed;

// BlocklyGames.coinval = 100;

/**
 * The types of squares in the maze, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
Maze.SquareType = {
  WALL: 0,
  OPEN: 1,
  START: 2,
  FINISH: 3
};
// Maze.correctdirections = [2, 0, 14, 2, 0, 12, 12, 8, 10, 6, 10, 14, 0, 0, 0];
Maze.correctdirections = [[-1, 0, 7, -1, 0, 6],
                          [1, -1, -1, 1, -1, 6],
                          [-1, -1, 5, -1, 5, 4],
                          [-1, 7, -1, 3, -1, -1],
                          [-1, -1, 0, 0, 0, 16]];
// The maze square constants defined above are inlined here
// for ease of reading and writing the static mazes.
Maze.map = [
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
 * This is intentionally done so users see the maze is about getting from
 * the start to the goal and not necessarily about moving over every part of
 * the maze, 'mowing the lawn' as Neil calls it.
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
 * Measure maze dimensions and set sizes.
 * ROWS: Number of tiles down.
 * COLS: Number of tiles across.
 * SQUARE_SIZE: Pixel height and width of each maze square (i.e. tile).
 */
Maze.ROWS = Maze.map.length;
Maze.COLS = Maze.map[0].length;
Maze.SQUARE_SIZE = (200);
Maze.PEGMAN_HEIGHT = 80;
Maze.PEGMAN_WIDTH = 80;
// console.log(Maze.ROWS + ',' + Maze.COLS);
// console.log(Maze.MAZE_WIDTH + ',' + Maze.MAZE_HEIGHT);
Maze.PATH_WIDTH = Maze.SQUARE_SIZE / 3;
Maze.factorX = window.innerWidth;
Maze.factorY = window.innerHeight;
var temp = Maze.factorX / 2133 > Maze.factorY/ 1084 ? Maze.factorY/ 1084 : Maze.factorX / 2133;

/**
 * Constants for cardinal directions.  Subsequent code assumes these are
 * in the range 0..3 and that opposites have an absolute difference of 2.
 * @enum {number}
 */
Maze.DirectionType = {
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
Maze.ResultType = {
  UNSET: 0,
  SUCCESS: 1,
  FAILURE: -1,
  TIMEOUT: 2,
  ERROR: -2
};

/**
 * Result of last execution.
 */
Maze.result = Maze.ResultType.UNSET;

/**
 * Starting direction.
 */
Maze.startDirection = Maze.DirectionType.EAST;

/**
 * PIDs of animation tasks currently executing.
 */
Maze.pidList = [];

// Map each possible shape to a sprite.
// Input: Binary string representing Centre/North/West/South/East squares.
// Output: [x, y] coordinates of each tile's sprite in tiles.png.
Maze.tile_SHAPES = {
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

/**
 * Create and layout all the nodes for the path, scenery, Pegman, and goal.
 */
Maze.drawMap = function() {
  var svg = document.getElementById('svgMaze');
  var scale = Math.max(Maze.ROWS, Maze.COLS) * Maze.SQUARE_SIZE;
  // svg.setAttribute('viewBox', '0 0 ' + scale + ' ' + scale);
  svg.style.width = Maze.MAZE_WIDTH + 'px';
  svg.style.height = Maze.MAZE_HEIGHT + 'px';
  svg.setAttribute('viewBox', '0 0 ' + Maze.MAZE_WIDTH + ' ' + Maze.MAZE_HEIGHT);
  // Draw the outer square.
  Blockly.utils.dom.createSvgElement('rect', {
      'height': Maze.MAZE_HEIGHT,
      'width': Maze.MAZE_WIDTH,
      'fill': '#F1EEE7',
      'stroke-width': 1,
      'stroke': '#CCB'
    }, svg);

  if (Maze.SKIN.background) {
    var tile = Blockly.utils.dom.createSvgElement('image', {
        'height': Maze.MAZE_HEIGHT,
        'width': Maze.MAZE_WIDTH,
        // 'x': +Maze.SQUARE_SIZE /6,
        // 'y': +Maze.SQUARE_SIZE /12
        'x': 0,
        'y': 0
      }, svg);
    tile.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
        Maze.SKIN.background);
  }

  // Draw the tiles making up the maze map.

  // Return a value of '0' if the specified square is wall or out of bounds,
  // '1' otherwise (empty, start, finish).
  // var normalize = function(x, y) {
  //   if (x < 0 || x >= Maze.COLS || y < 0 || y >= Maze.ROWS) {
  //     return '0';
  //   }
  //   return (Maze.map[y][x] == Maze.SquareType.WALL) ? '0' : '1';
  // };
  //
  // // Compute and draw the tile for each square.
  // var tileId = 0;
  // for (var y = 0; y < Maze.ROWS; y++) {
  //   for (var x = 0; x < Maze.COLS; x++) {
  //     var tileShape = x.toString() + ',' + y.toString();
  //     var left = Maze.tile_SHAPES[tileShape][0];
  //     var top = Maze.tile_SHAPES[tileShape][1];
  //     // Tile's clipPath element.
  //     var tileClip = Blockly.utils.dom.createSvgElement('clipPath', {
  //         'id': 'tileClipPath' + tileId
  //       }, svg);
  //     Blockly.utils.dom.createSvgElement('rect', {
  //         'height': Maze.SQUARE_SIZE,
  //         'width': Maze.SQUARE_SIZE,
  //         'x': x * Maze.SQUARE_SIZE,
  //         'y': y * Maze.SQUARE_SIZE
  //       }, tileClip);
  //     // Tile sprite.
  //     var tile = Blockly.utils.dom.createSvgElement('image', {
  //         'height': Maze.SQUARE_SIZE * 4,
  //         'width': Maze.SQUARE_SIZE * 5,
  //         'clip-path': 'url(#tileClipPath' + tileId + ')',
  //         'x': (x - left) * Maze.SQUARE_SIZE,
  //         'y': (y - top) * Maze.SQUARE_SIZE
  //       }, svg);
  //     tile.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
  //         Maze.SKIN.tiles);
  //     tileId++;
  //   }
  // }

  // Add finish marker.
  var finishMarker = Blockly.utils.dom.createSvgElement('image', {
      'id': 'finish',
      'height': 34,
      'width': 20
    }, svg);
  finishMarker.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      Maze.SKIN.marker);

  // Pegman's clipPath element, whose (x, y) is reset by Maze.displayPegman
  var pegmanClip = Blockly.utils.dom.createSvgElement('clipPath', {
      'id': 'pegmanClipPath'
    }, svg);
  Blockly.utils.dom.createSvgElement('rect', {
      'id': 'clipRect',
      'height': Maze.PEGMAN_HEIGHT,
      'width': Maze.PEGMAN_WIDTH
    }, pegmanClip);

  // Add Pegman.
  var pegmanIcon = Blockly.utils.dom.createSvgElement('image', {
      'id': 'pegman',
      'height': Maze.PEGMAN_HEIGHT,
      'width': Maze.PEGMAN_WIDTH * 16, // 49 * 21 = 1029
      'clip-path': 'url(#pegmanClipPath)',
      // 'opacity': '0.6'
    }, svg);
  pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      Maze.SKIN.idlesprite);

};

/**
 * Initialize Blockly and the maze.  Called on page load.
 */
Maze.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Maze.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       skin: Maze.SKIN_ID,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init();

  // Setup the Pegman menu.
  var pegmanImg = document.querySelector('#pegmanButton>img');
  pegmanImg.style.backgroundImage = 'url(' + Maze.SKIN.sprite + ')';
  var pegmanMenu = document.getElementById('pegmanMenu');
  var handlerFactory = function(n) {
    return function() {
      Maze.changePegman(n);
    };
  };
  for (var i = 0; i < Maze.SKINS.length; i++) {
    if (i == Maze.SKIN_ID) {
      continue;
    }
    var div = document.createElement('div');
    var img = document.createElement('img');
    img.src = 'common/1x1.gif';
    img.style.backgroundImage = 'url(' + Maze.SKINS[i].sprite + ')';
    div.appendChild(img);
    pegmanMenu.appendChild(div);
    Blockly.bindEvent_(div, 'mousedown', null, handlerFactory(i));
  }
  Blockly.bindEvent_(window, 'resize', null, Maze.hidePegmanMenu);
  var pegmanButton = document.getElementById('pegmanButton');
  Blockly.bindEvent_(pegmanButton, 'mousedown', null, Maze.showPegmanMenu);
  var pegmanButtonArrow = document.getElementById('pegmanButtonArrow');
  var arrow = document.createTextNode(Blockly.FieldDropdown.ARROW_CHAR);
  pegmanButtonArrow.appendChild(arrow);

  var rtl = BlocklyGames.isRtl();
  Maze.SQUARE_SIZE = Maze.SQUARE_SIZE * BlocklyGames.factor;
  Maze.MAZE_WIDTH = Maze.SQUARE_SIZE * Maze.COLS;
  Maze.MAZE_HEIGHT = Maze.SQUARE_SIZE * Maze.ROWS;
  Maze.PEGMAN_HEIGHT = 130 * BlocklyGames.factor;
  Maze.PEGMAN_WIDTH = 130 * BlocklyGames.factor;

  var blocklyDiv = document.getElementById('blockly');
  var visualization = document.getElementById('visualization');
  var top = visualization.offsetTop;
  var buttontable = document.getElementById('buttontable');
  var onresize = function(e) {
    var top = visualization.offsetTop;
    blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
    blocklyDiv.style.left = rtl ? '10px' : (Maze.MAZE_WIDTH + 20) + 'px';
    blocklyDiv.style.width = (window.innerWidth - (Maze.MAZE_WIDTH + 40)) + 'px';
    blocklyDiv.style.paddingBottom = 10 * BlocklyGames.factor + 'px';
  buttontable.style.left = blocklyDiv.offsetLeft + 'px';
  buttontable.style.width = (window.innerWidth - (Maze.MAZE_WIDTH + 40)) + 'px';
  buttontable.style.top = blocklyDiv.offsetTop + Maze.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('runButton').style.left = blocklyDiv.offsetLeft + 'px';
  document.getElementById('runButton').style.top = blocklyDiv.offsetTop + Maze.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('resetButton').style.left = document.getElementById('runButton').offsetLeft + document.getElementById('runButton').offsetWidth + 'px';
  document.getElementById('resetButton').style.top = blocklyDiv.offsetTop + Maze.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('resetButton').style.marginRight = '0px';
  };
  window.addEventListener('scroll', function() {
    onresize(null);
    Blockly.svgResize(BlocklyInterface.workspace);
    buttontable.style.left = blocklyDiv.offsetLeft + 'px';
    buttontable.style.width = (window.innerWidth - (Maze.MAZE_WIDTH + 40)) + 'px';
    buttontable.style.top = blocklyDiv.offsetTop + Maze.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('runButton').style.left = blocklyDiv.offsetLeft + 'px';
    document.getElementById('runButton').style.top = blocklyDiv.offsetTop + Maze.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('resetButton').style.left = document.getElementById('runButton').offsetLeft + document.getElementById('runButton').offsetWidth + 'px';
    document.getElementById('resetButton').style.top = blocklyDiv.offsetTop + Maze.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('resetButton').style.marginRight = '0px';
  });
  window.addEventListener('resize', onresize);
  onresize(null);
  Maze.SQUARE_SIZE = Maze.SQUARE_SIZE / BlocklyGames.factor;
  Maze.MAZE_WIDTH = Maze.SQUARE_SIZE / Maze.COLS;
  Maze.MAZE_HEIGHT = Maze.SQUARE_SIZE / Maze.ROWS;
  Maze.PEGMAN_HEIGHT = 130 / BlocklyGames.factor;
  Maze.PEGMAN_WIDTH = 130 / BlocklyGames.factor;

  Maze.SQUARE_SIZE = Maze.SQUARE_SIZE * BlocklyGames.factor;
  Maze.MAZE_WIDTH = Maze.SQUARE_SIZE * Maze.COLS;
  Maze.MAZE_HEIGHT = Maze.SQUARE_SIZE * Maze.ROWS;
  Maze.PEGMAN_HEIGHT = 130 * BlocklyGames.factor;
  Maze.PEGMAN_WIDTH = 130 * BlocklyGames.factor;

  // Scale the workspace so level 1 = 1.3, and level 10 = 1.0.
  // var scale = 1 + (1 - (BlocklyGames.LEVEL / BlocklyGames.MAX_LEVEL)) / 3;
  var scale = 1;
  BlocklyInterface.injectBlockly(
      {'maxBlocks': Maze.MAX_BLOCKS,
       'rtl': rtl,
       'trashcan': true,
       'zoom': {'startScale': scale}});
  BlocklyInterface.workspace.getAudioManager().load(Maze.SKIN.winSound, 'win');
  BlocklyInterface.workspace.getAudioManager().load(Maze.SKIN.crashSound, 'fail');
  // Not really needed, there are no user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('moveForward,moveBackward,' +
      'turnRight,turnLeft,isPathForward,isPathRight,isPathBackward,isPathLeft');

  Maze.drawMap();
  // Maze.drawCoin();
  // Maze.drawcoinval();
  var runButton1 = document.getElementById('runButton');
  var resetButton1 = document.getElementById('resetButton');

  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton1.style.minWidth) {
    resetButton1.style.minWidth = runButton1.offsetWidth + 'px';
  }


  // Locate the start and finish squares.
  for (var y = 0; y < Maze.ROWS; y++) {
    for (var x = 0; x < Maze.COLS; x++) {
      if (Maze.map[y][x] == Maze.SquareType.START) {
        Maze.start_ = {x: x, y: y};
        Maze.start1_ = {x: x, y: y};
      } else if (Maze.map[y][x] == Maze.SquareType.FINISH) {
        Maze.finish_ = {x: x, y: y};
      }
    }
  }

  Maze.reset(true);
  BlocklyInterface.workspace.addChangeListener(function() {Maze.updateCapacity();});

  document.body.addEventListener('mousemove', Maze.updatePegSpin_, true);

  BlocklyGames.bindClick('runButton', Maze.runButtonClick);
  BlocklyGames.bindClick('resetButton', Maze.resetButtonClick);


  // Add the spinning Pegman icon to the done dialog.
  // <img id="pegSpin" src="common/1x1.gif">
  var buttonDiv = document.getElementById('dialogDoneButtons');
  var pegSpin = document.createElement('img');
  pegSpin.id = 'pegSpin';
  pegSpin.src = 'common/1x1.gif';
  pegSpin.style.backgroundImage = 'url(' + Maze.SKIN.sprite + ')';
  buttonDiv.parentNode.insertBefore(pegSpin, buttonDiv);

  // Lazy-load the JavaScript interpreter.
  BlocklyInterface.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyInterface.importPrettify();
  BlocklyGames.bindClick('helpButton', Maze.showHelp);
};

/**
 * When the workspace changes, update the help as needed.
 * @param {Blockly.Events.Abstract=} opt_event Custom data for event.
 */
Maze.levelHelp = function(opt_event) {
  if (opt_event && opt_event.type == Blockly.Events.UI) {
    // Just a change to highlighting or somesuch.
    return;
  } else if (BlocklyInterface.workspace.isDragging()) {
    // Don't change helps during drags.
    return;
  } else if (Maze.result == Maze.ResultType.SUCCESS ||
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
    //           '<block type="maze_moveForward" x="10" y="10">',
    //             '<next>',
    //               '<block type="maze_moveForward"></block>',
    //             '</next>',
    //           '</block>',
    //         '</xml>'];
    //     BlocklyInterface.injectReadonly('sampleOneTopBlock', xml);
    //     content = document.getElementById('dialogHelpOneTopBlock');
    //     style = {'width': '360px', 'top': '120px'};
    //     style[rtl ? 'right' : 'left'] = '225px';
    //     origin = topBlocks[0].getSvgRoot();
    //   } else if (Maze.result == Maze.ResultType.UNSET) {
    //     // Show run help dialog.
    //     content = document.getElementById('dialogHelpRun');
    //     style = {'width': '360px', 'top': '410px'};
    //     style[rtl ? 'right' : 'left'] = '400px';
    //     origin = document.getElementById('runButton');
    //   }
    // }
  } else if (BlocklyGames.LEVEL == 2) {
    if (Maze.result != Maze.ResultType.UNSET &&
        document.getElementById('runButton').style.display == 'none') {
      content = document.getElementById('dialogHelpReset');
      style = {'width': '360px', 'top': '410px'};
      style[rtl ? 'right' : 'left'] = '400px';
      origin = document.getElementById('resetButton');
    }
  } else if (BlocklyGames.LEVEL == 3) {
    if (userBlocks.indexOf('maze_forever') == -1) {
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
        (userBlocks.indexOf('maze_forever') == -1 ||
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
        if (block.type != 'maze_forever') {
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
    if (Maze.SKIN_ID == 0 && !Maze.showPegmanMenu.activatedOnce) {
      content = document.getElementById('dialogHelpSkins');
      style = {'width': '360px', 'top': '60px'};
      style[rtl ? 'left' : 'right'] = '20px';
      origin = document.getElementById('pegmanButton');
    }
  } else if (BlocklyGames.LEVEL == 6) {
    if (userBlocks.indexOf('maze_if') == -1) {
      content = document.getElementById('dialogHelpIf');
      style = {'width': '360px', 'top': '430px'};
      style[rtl ? 'right' : 'left'] = '425px';
      origin = toolbar[4].getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL == 7) {
    if (!Maze.levelHelp.initialized7_) {
      // Create fake dropdown.
      var span = document.createElement('span');
      span.className = 'helpMenuFake';
      var options =
          [BlocklyGames.getMsg('Maze_pathAhead'),
           BlocklyGames.getMsg('Maze_pathLeft'),
           BlocklyGames.getMsg('Maze_pathRight')];
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
      Maze.levelHelp.initialized7_ = true;
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
    if (userBlocks.indexOf('maze_ifElse') == -1) {
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
Maze.changePegman = function(newSkin) {
  BlocklyInterface.saveToSessionStorage();
  location = location.protocol + '//' + location.host + location.pathname +
      '?lang=' + BlocklyGames.LANG + '&level=' + BlocklyGames.LEVEL +
      '&skin=' + newSkin;
};

/**
 * Display the Pegman skin-change menu.
 * @param {!Event} e Mouse, touch, or resize event.
 */
Maze.showPegmanMenu = function(e) {
  var menu = document.getElementById('pegmanMenu');
  if (menu.style.display == 'block') {
    // Menu is already open.  Close it.
    Maze.hidePegmanMenu(e);
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
  Maze.pegmanMenuMouse_ =
      Blockly.bindEvent_(document.body, 'mousedown', null, Maze.hidePegmanMenu);
  // Close the skin-changing hint if open.
  var hint = document.getElementById('dialogHelpSkins');
  if (hint && hint.className != 'dialogHiddenContent') {
    BlocklyDialogs.hideDialog(false);
  }
  Maze.showPegmanMenu.activatedOnce = true;
};

/**
 * Hide the Pegman skin-change menu.
 * @param {!Event} e Mouse, touch, or resize event.
 */
Maze.hidePegmanMenu = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  document.getElementById('pegmanMenu').style.display = 'none';
  document.getElementById('pegmanButton').classList.remove('buttonHover');
  if (Maze.pegmanMenuMouse_) {
    Blockly.unbindEvent_(Maze.pegmanMenuMouse_);
    delete Maze.pegmanMenuMouse_;
  }
};

/**
 * Reset the maze to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Maze.reset = function(first) {
  // Kill all tasks.
  for (var i = 0; i < Maze.pidList.length; i++) {
    clearTimeout(Maze.pidList[i]);
  }
  Maze.pidList = [];
  Maze.prevlog.clear();
  // Move Pegman into position.
  Maze.pegmanX = Maze.start1_.x;
  Maze.pegmanY = Maze.start1_.y;
  Maze.pegmanXcheck = Maze.pegmanX;
  Maze.pegmanYcheck = Maze.pegmanY;
  if (first) {
    // Opening animation.
    Maze.pegmanD = Maze.startDirection - 2;
    Maze.scheduleFinish(false);
    Maze.pidList.push(setTimeout(function() {
      Maze.stepSpeed = 130;
      //BlocklyGames.coinval = 100;
      Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                    [Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2 + 4]);
      Maze.pegmanD = Maze.startDirection;
      Maze.pegmanDcheck = Maze.pegmanD;
    }, Maze.stepSpeed * 5));
  } else {
    Maze.pegmanD = Maze.startDirection;
    Maze.pegmanDcheck = Maze.pegmanD;
    Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2);
  }

  // Move the finish icon into position.
  var finishIcon = document.getElementById('finish');
  finishIcon.setAttribute('x', Maze.SQUARE_SIZE * (Maze.finish_.x + 0.5) -
      finishIcon.getAttribute('width') / 2);
  finishIcon.setAttribute('y', Maze.SQUARE_SIZE * (Maze.finish_.y + 0.6) -
      finishIcon.getAttribute('height'));

  // Make 'look' icon invisible and promote to top.
  var lookIcon = document.getElementById('look');
  lookIcon.style.display = 'none';
  // lookIcon.parentNode.appendChild(lookIcon);
  // var paths = lookIcon.getElementsByTagName('path');
  // for (var i = 0, path; (path = paths[i]); i++) {
  //   path.setAttribute('stroke', Maze.SKIN.look);
  // }
};

/**
 * Click the run button.  Start the program.
 * @param {!Event} e Mouse or touch event.
 */
Maze.runButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  BlocklyDialogs.hideDialog(false);
  // Only allow a single top block on level 1.
  // if (BlocklyGames.LEVEL == 1 &&
  //     BlocklyInterface.workspace.getTopBlocks(false).length > 1 &&
  //     Maze.result != Maze.ResultType.SUCCESS &&
  //     !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
  //                                        BlocklyGames.LEVEL)) {
  //   // Maze.levelHelp();
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
  // Maze.reset(false);
  Maze.execute();
};

/**
 * Updates the document's 'capacity' element with a message
 * indicating how many more blocks are permitted.  The capacity
 * is retrieved from BlocklyInterface.workspace.remainingCapacity().
 */
Maze.updateCapacity = function() {
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
      var msg = BlocklyGames.getMsg('Maze_capacity0');
    } else if (cap == 1) {
      var msg = BlocklyGames.getMsg('Maze_capacity1');
    } else {
      var msg = BlocklyGames.getMsg('Maze_capacity2');
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
 * Click the reset button.  Reset the maze.
 * @param {!Event} e Mouse or touch event.
 */
Maze.resetButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  //var runButton = document.getElementById('runButton');
  //runButton.style.display = 'inline';
  //document.getElementById('resetButton').style.display = 'none';
  BlocklyInterface.workspace.highlightBlock(null);
  Maze.reset(false);
  Maze.levelHelp();
};

/**
 * Inject the Maze API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS-Interpreter.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Maze.initInterpreter = function(interpreter, globalObject) {
  // API
  var wrapper;
  wrapper = function(id) {
    Maze.move(0, id);
  };
  interpreter.setProperty(globalObject, 'moveForward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Maze.move(2, id);
  };
  interpreter.setProperty(globalObject, 'moveBackward',
      interpreter.createNativeFunction(wrapper));


  wrapper = function(id) {
    Maze.turn(0, id);
  };
  interpreter.setProperty(globalObject, 'turnNorth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Maze.turn(1, id);
  };
  interpreter.setProperty(globalObject, 'turnNorthEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Maze.turn(2, id);
  };
  interpreter.setProperty(globalObject, 'turnEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Maze.turn(3, id);
  };
  interpreter.setProperty(globalObject, 'turnSouthEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Maze.turn(4, id);
  };
  interpreter.setProperty(globalObject, 'turnSouth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Maze.turn(5, id);
  };
  interpreter.setProperty(globalObject, 'turnSouthWest',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Maze.turn(6, id);
  };
  interpreter.setProperty(globalObject, 'turnWest',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Maze.turn(7, id);
  };
  interpreter.setProperty(globalObject, 'turnNorthWest',
      interpreter.createNativeFunction(wrapper));


  wrapper = function(id) {
    return Maze.isPath(0, id);
  };
  interpreter.setProperty(globalObject, 'isPathForward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Maze.isPath(1, id);
  };
  interpreter.setProperty(globalObject, 'isPathNorth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Maze.isPath(2, id);
  };
  interpreter.setProperty(globalObject, 'isPathBackward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Maze.isPath(3, id);
  };
  interpreter.setProperty(globalObject, 'isPathEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Maze.isPath(4, id);
  };
  interpreter.setProperty(globalObject, 'isPathSouth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
        return Maze.isPath(5, id);
      };
  interpreter.setProperty(globalObject, 'isPathWest',
          interpreter.createNativeFunction(wrapper));
  wrapper = function() {
    return Maze.notDone();
  };
  interpreter.setProperty(globalObject, 'notDone',
      interpreter.createNativeFunction(wrapper));
};

/**
 * Execute the user's code.  Heaven help us...
 */
Maze.execute = function() {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Maze.execute, 250);
    return;
  }

  Maze.log = [];
  Blockly.selected && Blockly.selected.unselect();
  var code = BlocklyInterface.getJsCode();
  BlocklyInterface.executedJsCode = code;
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
  Maze.result = Maze.ResultType.UNSET;
  var interpreter = new Interpreter(code, Maze.initInterpreter);

  // Try running the user's code.  There are four possible outcomes:
  // 1. If pegman reaches the finish [SUCCESS], true is thrown.
  // 2. If the program is terminated due to running too long [TIMEOUT],
  //    false is thrown.
  // 3. If another error occurs [ERROR], that error is thrown.
  // 4. If the program ended normally but without solving the maze [FAILURE],
  //    no error or exception is thrown.
  try {
    var ticks = 10000;  // 10k ticks runs Pegman for about 8 minutes.
    while (interpreter.step()) {
      if (ticks-- == 0) {
        throw Infinity;
      }
    }
    Maze.result = Maze.notDone() ?
        Maze.ResultType.FAILURE : Maze.ResultType.SUCCESS;
  } catch (e) {
    // A boolean is thrown for normal termination.
    // Abnormal termination is a user error.
    if (e === Infinity) {
      Maze.result = Maze.ResultType.TIMEOUT;
    } else if (e === false) {
      Maze.result = Maze.ResultType.ERROR;
    } else {
      // Syntax error, can't happen.
      Maze.result = Maze.ResultType.ERROR;
      alert(e);
    }
  }

  // Fast animation if execution is successful.  Slow otherwise.
  if (Maze.result == Maze.ResultType.SUCCESS) {
    Maze.stepSpeed = 80;
    Maze.log.push(['finish', null]);
  } else {
    Maze.stepSpeed = 130;
  }
  // Maze.log now contains a transcript of all the user's actions.
  // Reset the maze and animate the transcript.
  // Maze.reset(false);
  Maze.pidList.push(setTimeout(Maze.animate, 100));
};

/**
 * Iterate through the recorded path and animate pegman's actions.
 */
Maze.prevlog = new Set();
Maze.animate = function() {
  var action = Maze.log.shift();
  if (!action) {
    BlocklyInterface.highlight(null);
    Maze.levelHelp();
    return;
  }
  if(!Maze.prevlog.has(action[1])){
    BlocklyInterface.highlight(action[1]);
    // console.log(action[0]+',' +action[1]);
    switch (action[0]) {
      case 'north':
        BlocklyGames.coinval +=10;
        Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                      [Maze.pegmanX, Maze.pegmanY - 1, Maze.pegmanD * 2]);
        Maze.pegmanY--;
        break;
      case 'northeast':
        BlocklyGames.coinval +=10;
        Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                      [Maze.pegmanX + 1, Maze.pegmanY - 1, Maze.pegmanD * 2]);
        Maze.pegmanX++;
        Maze.pegmanY--;
        break;
      case 'east':
        BlocklyGames.coinval +=10;
        Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                      [Maze.pegmanX + 1, Maze.pegmanY, Maze.pegmanD * 2]);
        Maze.pegmanX++;
        break;
      case 'southeast':
        BlocklyGames.coinval +=10;
        Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                      [Maze.pegmanX + 1, Maze.pegmanY + 1, Maze.pegmanD * 2]);
        Maze.pegmanX++;
        Maze.pegmanY++;
        break;
      case 'south':
        BlocklyGames.coinval +=10;
        Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                      [Maze.pegmanX, Maze.pegmanY + 1, Maze.pegmanD * 2]);
        Maze.pegmanY++;
        break;
      case 'southwest':
        BlocklyGames.coinval +=10;
        Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                      [Maze.pegmanX - 1, Maze.pegmanY + 1, Maze.pegmanD * 2]);
        Maze.pegmanX--;
        Maze.pegmanY++;
        break;
      case 'west':
        BlocklyGames.coinval +=10;
        Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                      [Maze.pegmanX - 1, Maze.pegmanY, Maze.pegmanD * 2]);
        Maze.pegmanX--;
        break;
      case 'northwest':
        BlocklyGames.coinval +=10;
        Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                      [Maze.pegmanX - 1, Maze.pegmanY - 1, Maze.pegmanD * 2]);
        Maze.pegmanX--;
        Maze.pegmanY--;
        break;

      case 'look_north':
        Maze.scheduleLook(Maze.DirectionType.NORTH);
        break;
      case 'look_northeast':
        Maze.scheduleLook(Maze.DirectionType.NORTHEAST);
        break;
      case 'look_east':
        Maze.scheduleLook(Maze.DirectionType.EAST);
        break;
      case 'look_southeast':
        Maze.scheduleLook(Maze.DirectionType.SOUTHEAST);
        break;
      case 'look_south':
        Maze.scheduleLook(Maze.DirectionType.SOUTH);
        break;
      case 'look_southwest':
        Maze.scheduleLook(Maze.DirectionType.SOUTHWEST);
        break;
      case 'look_west':
        Maze.scheduleLook(Maze.DirectionType.WEST);
        break;
      case 'look_northwest':
        Maze.scheduleLook(Maze.DirectionType.NORTHWEST);
        break;

      case 'fail_forward':
        BlocklyGames.coinval -=10;
        Maze.scheduleFail(true);
        break;
      case 'fail_backward':
        BlocklyGames.coinval -=10;
        Maze.scheduleFail(false);
        break;
      case 'North':
        Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                      [Maze.pegmanX, Maze.pegmanY, 2 * 2 ]);
        Maze.pegmanD = Maze.constrainDirection4(Maze.pegmanD = 2);
        break;
      case 'NorthEast':
        Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                      [Maze.pegmanX, Maze.pegmanY, 1 * 2]);
        Maze.pegmanD = Maze.constrainDirection4(Maze.pegmanD = 1);
        break;
      case 'East':
        Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                      [Maze.pegmanX, Maze.pegmanY, 0 * 2 ]);
        Maze.pegmanD = Maze.constrainDirection4(Maze.pegmanD = 0);
        break;
      case 'SouthEast':
        Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                      [Maze.pegmanX, Maze.pegmanY, 7 * 2]);
        Maze.pegmanD = Maze.constrainDirection4(Maze.pegmanD = 7);
        break;
      case 'South':
        Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                      [Maze.pegmanX, Maze.pegmanY, 6 * 2]);
        Maze.pegmanD = Maze.constrainDirection4(Maze.pegmanD = 6);
        break;
      case 'SouthWest':
        Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                      [Maze.pegmanX, Maze.pegmanY, 5 * 2]);
        Maze.pegmanD = Maze.constrainDirection4(Maze.pegmanD = 5);
        break;
      case 'West':
        Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                      [Maze.pegmanX, Maze.pegmanY, 4 * 2]);
        Maze.pegmanD = Maze.constrainDirection4(Maze.pegmanD = 4);
        break;
        case 'NorthWest':
          Maze.schedule([Maze.pegmanX, Maze.pegmanY, Maze.pegmanD * 2],
                        [Maze.pegmanX, Maze.pegmanY, 3 * 2]);
          Maze.pegmanD = Maze.constrainDirection4(Maze.pegmanD = 3);
          break;
      case 'finish':
        Maze.scheduleFinish(true);
      }
      Maze.prevlog.add(action[1]);
      var factor = Maze.timevalue;
  }
  else {
    var factor = 1;
  }
  // console.log(Maze.prevlog);
  Maze.pidList.push(setTimeout(Maze.animate, Maze.stepSpeed * factor));
};

/**
 * Point the congratulations Pegman to face the mouse.
 * @param {Event} e Mouse move event.
 * @private
 */
Maze.updatePegSpin_ = function(e) {
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
  pegSpin.style.backgroundPosition = (-quad * Maze.PEGMAN_WIDTH) + 'px 0px';
};

/**
 * Schedule the animations for a move or turn.
 * @param {!Array.<number>} startPos X, Y and direction starting points.
 * @param {!Array.<number>} endPos X, Y and direction ending points.
 */
Maze.schedule = function(startPos, endPos) {
  var deltas = [(endPos[0] - startPos[0]) ,
                (endPos[1] - startPos[1]) ,
                (endPos[2] - startPos[2])];
  deltas[2] = deltas[2] > 8 ? (deltas[2] - 16) : deltas[2];
  var factor;
  var consolation = deltas[2] < 0 ? deltas[2] : 0;
  document.getElementById('pegman').style.opacity = 1;
  if(deltas[2] > 0){
    switch (Math.abs(deltas[2])) {
      case 2:
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 1 + consolation));
        }, Maze.stepSpeed));
        factor = 2;
        break;
      case 4:
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 1 + consolation));
        }, Maze.stepSpeed));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 2 + consolation));
        }, Maze.stepSpeed * 2));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 3 + consolation));
        }, Maze.stepSpeed * 3));
        factor = 4;
        break;
      case 6:
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 1 + consolation));
        }, Maze.stepSpeed));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 2 + consolation));
        }, Maze.stepSpeed * 2));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 3 + consolation));
        }, Maze.stepSpeed * 3));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 4 + consolation));
        }, Maze.stepSpeed * 4));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 5 + consolation));
        }, Maze.stepSpeed * 5));
        factor = 6;
        break;
      case 8:
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 1 + consolation));
        }, Maze.stepSpeed));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 2 + consolation));
        }, Maze.stepSpeed * 2));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 3 + consolation));
        }, Maze.stepSpeed * 3));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 4 + consolation));
        }, Maze.stepSpeed * 4));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 5 + consolation));
        }, Maze.stepSpeed * 5));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 6 + consolation));
        }, Maze.stepSpeed * 6));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 7 + consolation));
        }, Maze.stepSpeed * 7));
        factor = 8;
        break;
    }
  }
  else if(deltas[2] < 0){
    switch (Math.abs(deltas[2])) {
      case 2:
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 1 + consolation));
        }, Maze.stepSpeed));
        factor = 2;
        break;
      case 4:
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 3 + consolation));
        }, Maze.stepSpeed));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 2 + consolation));
        }, Maze.stepSpeed * 2));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 1 + consolation));
        }, Maze.stepSpeed * 3));
        factor = 4;
        break;
      case 6:
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 5 + consolation));
        }, Maze.stepSpeed));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 4 + consolation));
        }, Maze.stepSpeed * 2));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 3 + consolation));
        }, Maze.stepSpeed * 3));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 2 + consolation));
        }, Maze.stepSpeed * 4));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 1 + consolation));
        }, Maze.stepSpeed * 5));
        factor = 6;
        break;
      case 8:
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 7 + consolation));
        }, Maze.stepSpeed));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 6 + consolation));
        }, Maze.stepSpeed * 2));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 5 + consolation));
        }, Maze.stepSpeed * 3));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 4 + consolation));
        }, Maze.stepSpeed * 4));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 3 + consolation));
        }, Maze.stepSpeed * 5));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 2 + consolation));
        }, Maze.stepSpeed * 6));
      Maze.pidList.push(setTimeout(function() {
          Maze.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Maze.constrainDirection16(startPos[2] + 1 + consolation));
        }, Maze.stepSpeed * 7));
        factor = 8;
        break;
    }
  }
  else if(deltas[2] == 0){
    var pegmanIcon = document.getElementById('pegman');
    // alert(startPos[2]);
    pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href','start/' + startPos[2] + '.png');
    for(var i=1; i <= (Math.abs(deltas[0]) * 32 || Math.abs(deltas[1]) * 32); i++ ) {
      Maze.timeout = function(val) {
        Maze.pidList.push(setTimeout(function() {
           Maze.displayPegman(startPos[0] + (deltas[0] * val / 32) ,
               (startPos[1] + deltas[1] * val / 32),
               Maze.constrainDirection16(val-1));
         }, Maze.stepSpeed * val));
      }
      Maze.timeout(i);
    }
    factor = Math.abs(deltas[0]) > Math.abs(deltas[1]) ? Math.abs(deltas[0]) * 32 + 4 : Math.abs(deltas[1]) * 32 + 4;
    Maze.pidList.push(setTimeout(function() {
        pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href','start/Idle.png');
        Maze.displayPegman(endPos[0], endPos[1],
            Maze.constrainDirection16(endPos[2]));
      }, Maze.stepSpeed * (factor - 2)));
  }
  Maze.timevalue = factor + 2;
  BlocklyGames.updatecoinvalue();
  Maze.pidList.push(setTimeout(function() {
    document.getElementById('pegman').style.opacity = 0.25;
      Maze.displayPegman(endPos[0], endPos[1],
          Maze.constrainDirection16(endPos[2]));
    }, Maze.stepSpeed * factor));

};

/**
 * Schedule the animations and sounds for a failed move.
 * @param {boolean} forward True if forward, false if backward.
 */
Maze.scheduleFail = function(forward) {
  var deltaX = 0;
  var deltaY = 0;
  // BlocklyGames.coinval -=10;
  // Maze.drawcoinval();
  BlocklyGames.updatecoinvalue();
  switch (Maze.pegmanD) {
    case Maze.DirectionType.NORTH:
      deltaY = -1;
      break;
    case Maze.DirectionType.NORTHEAST:
      deltaX = 1;
      deltaY = -1;
      break;
    case Maze.DirectionType.EAST:
      deltaX = 1;
      break;
    case Maze.DirectionType.SOUTHEAST:
      deltaX = 1;
      deltaY = 1;
      break;
    case Maze.DirectionType.SOUTH:
      deltaY = 1;
      break;
    case Maze.DirectionType.SOUTHWEST:
      deltaX = -1;
      deltaY = 1;
      break;
    case Maze.DirectionType.WEST:
      deltaX = -1;
      break;
    case Maze.DirectionType.NORTHWEST:
      deltaX = -1;
      deltaY = -1;
      break;

  }
  if (!forward) {
    deltaX = -deltaX;
    deltaY = -deltaY;
  }
  if (Maze.SKIN.crashType == Maze.CRASH_STOP) {
    // Bounce bounce.
    deltaX /= 4;
    deltaY /= 4;
    var direction16 = Maze.constrainDirection16(Maze.pegmanD * 2);
    Maze.displayPegman(Maze.pegmanX + deltaX,
                       Maze.pegmanY + deltaY,
                       direction16);
    BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    Maze.pidList.push(setTimeout(function() {
      Maze.displayPegman(Maze.pegmanX,
                         Maze.pegmanY,
                         direction16);
      }, Maze.stepSpeed));
    Maze.pidList.push(setTimeout(function() {
      Maze.displayPegman(Maze.pegmanX + deltaX,
                         Maze.pegmanY + deltaY,
                         direction16);
      BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    }, Maze.stepSpeed * 2));
    Maze.pidList.push(setTimeout(function() {
        Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, direction16);
      }, Maze.stepSpeed * 3));
  } else {
    // Add a small random delta away from the grid.
    var deltaZ = (Math.random() - 0.5) * 10;
    var deltaD = (Math.random() - 0.5) / 2;
    deltaX += (Math.random() - 0.5) / 4;
    deltaY += (Math.random() - 0.5) / 4;
    deltaX /= 8;
    deltaY /= 8;
    var acceleration = 0;
    if (Maze.SKIN.crashType == Maze.CRASH_FALL) {
      acceleration = 0.01;
    }
    Maze.pidList.push(setTimeout(function() {
      BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    }, Maze.stepSpeed * 2));
    var setPosition = function(n) {
      return function() {
        var direction16 = Maze.constrainDirection16(Maze.pegmanD * 4 +
                                                    deltaD * n);
        Maze.displayPegman(Maze.pegmanX + deltaX * n,
                           Maze.pegmanY + deltaY * n,
                           direction16,
                           deltaZ * n);
        deltaY += acceleration;
      };
    };
    // 100 frames should get Pegman offscreen.
    for (var i = 1; i < 100; i++) {
      Maze.pidList.push(setTimeout(setPosition(i),
          Maze.stepSpeed * i / 2));
    }
  }
};

/**
 * Schedule the animations and sound for a victory dance.
 * @param {boolean} sound Play the victory sound.
 */
Maze.scheduleFinish = function(sound) {
  var direction16 = Maze.constrainDirection16(Maze.pegmanD * 2);
  Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, 16);
  if (sound) {
    BlocklyInterface.workspace.getAudioManager().play('win', 0.5);
  }
  Maze.stepSpeed = 150;  // Slow down victory animation a bit.
  Maze.pidList.push(setTimeout(function() {
    Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, 18);
    }, Maze.stepSpeed));
  Maze.pidList.push(setTimeout(function() {
    Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, 16);
    }, Maze.stepSpeed * 2));
  Maze.pidList.push(setTimeout(function() {
      Maze.displayPegman(Maze.pegmanX, Maze.pegmanY, direction16);
    }, Maze.stepSpeed * 3));
};

/**
 * Display Pegman at the specified location, facing the specified direction.
 * @param {number} x Horizontal grid (or fraction thereof).
 * @param {number} y Vertical grid (or fraction thereof).
 * @param {number} d Direction (0 - 15) or dance (16 - 17).
 * @param {number=} opt_angle Optional angle (in degrees) to rotate Pegman.
 */
Maze.displayPegman = function(x, y, d, opt_angle) {
  var valueX = 0;
  var valueY = 0;
  var pegmanIcon = document.getElementById('pegman');
  pegmanIcon.setAttribute('x',
      x * Maze.SQUARE_SIZE - d * Maze.PEGMAN_WIDTH + 1 + valueX);
  pegmanIcon.setAttribute('y',
      Maze.SQUARE_SIZE * (y + 0.5) - Maze.PEGMAN_HEIGHT / 2 - 8 + valueY);
  if (opt_angle) {
    pegmanIcon.setAttribute('transform', 'rotate(' + opt_angle + ', ' +
        (x * Maze.SQUARE_SIZE + Maze.SQUARE_SIZE / 2) + ', ' +
        (y * Maze.SQUARE_SIZE + Maze.SQUARE_SIZE / 2) + ')');
  } else {
    pegmanIcon.setAttribute('transform', 'rotate(0, 0, 0)');
  }
  // Maze.scheduleLook(x , y, Maze.constrainDirection4(Maze.pegmanD));
  var clipRect = document.getElementById('clipRect');
  clipRect.setAttribute('x', x * Maze.SQUARE_SIZE + 1 +valueX);
  clipRect.setAttribute('y', pegmanIcon.getAttribute('y'));
};

/**
 * Display the look icon at Pegman's current location,
 * in the specified direction.
 * @param {!Maze.DirectionType} d Direction (0 - 3).
 */
Maze.scheduleLook = function(x, y, d) {
  x -=0.10;
  y -= 0.25;
  x *= Maze.SQUARE_SIZE;
  y *= Maze.SQUARE_SIZE;
  var deg = d * 90 - 45;

  var lookIcon = document.getElementById('look');
  lookIcon.style.opacity = '0.97';
  lookIcon.setAttribute('transform',
      'translate(' + x + ', ' + y + ') ' +
      'rotate(0 0 0) scale(1)');
  // var paths = lookIcon.getElementsByTagName('path');
  // lookIcon.style.display = 'inline';
  // for (var i = 0, path; (path = paths[i]); i++) {
  //   Maze.scheduleLookStep(path, Maze.stepSpeed * i);
  // }
};

/**
 * Schedule one of the 'look' icon's waves to appear, then disappear.
 * @param {!Element} path Element to make appear.
 * @param {number} delay Milliseconds to wait before making wave appear.
 */
Maze.scheduleLookStep = function(path, delay) {
  Maze.pidList.push(setTimeout(function() {
    path.style.display = 'inline';
    setTimeout(function() {
      path.style.display = 'none';
    }, Maze.stepSpeed * 2);
  }, delay));
};

/**
 * Keep the direction within 0-4, wrapping at both ends.
 * @param {number} d Potentially out-of-bounds direction value.
 * @return {number} Legal direction value.
 */
Maze.constrainDirection4 = function(d) {
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
Maze.constrainDirection16 = function(d) {
  d = Math.round(d) % 16;
  if (d < 0) {
    d += 16;
  }
  return d;
};

// Core functions.

/**
 * Attempt to move pegman forward or backward.
 * @param {number} direction Direction to move (0 = forward, 2 = backward).
 * @param {string} id ID of block that triggered this action.
 * @throws {true} If the end of the maze is reached.
 * @throws {false} If Pegman collides with a wall.
 */
Maze.move = function(direction, id) {
  if(!Maze.prevlog.has(id))
  {
    if (!Maze.isPath(direction, null)) {
      Maze.log.push(['fail_' + (direction ? 'backward' : 'forward'), id]);
      throw false;
    }
    // If moving backward, flip the effective direction.
    var effectiveDirection = Maze.pegmanDcheck + direction;
    var command;
    switch (Maze.constrainDirection4(effectiveDirection)) {
      case Maze.DirectionType.NORTH:
        Maze.pegmanYcheck--;
        command = 'north';
        break;
      case Maze.DirectionType.NORTHEAST:
      Maze.pegmanXcheck++;
      Maze.pegmanYcheck--;
      command = 'northeast';
      break;
      case Maze.DirectionType.EAST:
        Maze.pegmanXcheck++;
        command = 'east';
        break;
      case Maze.DirectionType.SOUTHEAST:
      Maze.pegmanXcheck++;
      Maze.pegmanYcheck++;
      command = 'southeast';
      break;
      case Maze.DirectionType.SOUTH:
        Maze.pegmanYcheck++;
        command = 'south';
        break;
      case Maze.DirectionType.SOUTHWEST:
      Maze.pegmanXcheck--;
      Maze.pegmanYcheck++;
      command = 'southwest';
      break;
      case Maze.DirectionType.WEST:
        Maze.pegmanXcheck--;
        command = 'west';
        break;
        case Maze.DirectionType.NORTHWEST:
        Maze.pegmanXcheck--;
        Maze.pegmanYcheck--;
        command = 'northwest';
        break;
    }
  }
  Maze.log.push([command, id]);
};

/**
 * Turn pegman left or right.
 * @param {number} direction Direction to turn (0 = left, 1 = right).
 * @param {string} id ID of block that triggered this action.
 */
Maze.turn = function(direction, id) {
  // if (direction) {
  //   // Right turn (clockwise).
  //   Maze.pegmanD++;
  //   Maze.log.push(['right', id]);
  // } else {
  //   // Left turn (counterclockwise).
  //   Maze.pegmanD--;
  //   Maze.log.push(['left', id]);
  // }
  if(!Maze.prevlog.has(id))
  {
    switch (direction)
    {
      case 0:
        Maze.pegmanDcheck = 2;
        Maze.log.push(['North',id]);
        break;
      case 1:
        Maze.pegmanDcheck = 1;
        Maze.log.push(['NorthEast',id]);
        break;
      case 2:
        Maze.pegmanDcheck = 0;
        Maze.log.push(['East',id]);
        break;
      case 3:
        Maze.pegmanDcheck = 7;
        Maze.log.push(['SouthEast',id]);
        break;
      case 4:
        Maze.pegmanDcheck = 6;
        Maze.log.push(['South',id]);
        break;
      case 5:
        Maze.pegmanDcheck = 5;
        Maze.log.push(['SouthWest',id]);
        break;
      case 6:
        Maze.pegmanDcheck = 4;
        Maze.log.push(['West',id]);
        break;
      case 7:
        Maze.pegmanDcheck = 3;
        Maze.log.push(['NorthWest',id]);
        break;
    }
  }
  Maze.pegmanDcheck = Maze.constrainDirection4(Maze.pegmanDcheck);
};

/**
 * Is there a path next to pegman?
 * @param {number} direction Direction to look
 *     (0 = forward, 1 = right, 2 = backward, 3 = left).
 * @param {?string} id ID of block that triggered this action.
 *     Null if called as a helper function in Maze.move().
 * @return {boolean} True if there is a path.
 */
Maze.isPath = function(direction, id) {
  if(!Maze.prevlog.has(id))
  {
    var effectiveDirection = Maze.pegmanDcheck + direction;
    var square;
    var cdirection;
    var command;
    switch (Maze.constrainDirection4(effectiveDirection)) {
      case Maze.DirectionType.NORTH:
        square = Maze.map[Maze.pegmanYcheck - 1] &&
            Maze.map[Maze.pegmanYcheck - 1][Maze.pegmanXcheck];
        command = 'look_north';
        break;
      case Maze.DirectionType.NORTHEAST:
        square = Maze.map[Maze.pegmanYcheck - 1][Maze.pegmanXcheck + 1] &&
            Maze.map[Maze.pegmanYcheck -1];
        command = 'look_northeast';
        break;
      case Maze.DirectionType.EAST:
        square = Maze.map[Maze.pegmanYcheck][Maze.pegmanXcheck + 1];
        command = 'look_east';
        break;
      case Maze.DirectionType.SOUTHEAST:
        square = Maze.map[Maze.pegmanYcheck + 1][Maze.pegmanXcheck + 1] &&
            Maze.map[Maze.pegmanYcheck + 1];
        command = 'look_southeast';
        break;
      case Maze.DirectionType.SOUTH:
        square = Maze.map[Maze.pegmanYcheck + 1] &&
            Maze.map[Maze.pegmanYcheck + 1][Maze.pegmanXcheck];
        command = 'look_south';
        break;
      case Maze.DirectionType.SOUTHWEST:
        square = Maze.map[Maze.pegmanYcheck + 1][Maze.pegmanXcheck - 1] &&
            Maze.map[Maze.pegmanYcheck + 1];
        command = 'look_southwest';
        break;
      case Maze.DirectionType.WEST:
        square = Maze.map[Maze.pegmanYcheck][Maze.pegmanXcheck - 1];
        command = 'look_west';
        break;
      case Maze.DirectionType.NORTHWEST:
        square = Maze.map[Maze.pegmanYcheck - 1][Maze.pegmanXcheck - 1] &&
            Maze.map[Maze.pegmanYcheck - 1];
        command = 'look_northwest';
        break;
    }
  }
  // alert(effectiveDirection);
  if (id) {
    Maze.log.push([command, id]);
  }
  return square !== Maze.SquareType.WALL && square !== undefined && effectiveDirection == Maze.correctdirections[Maze.pegmanYcheck][Maze.pegmanXcheck];
};

/**
 * Is the player at the finish marker?
 * @return {boolean} True if not done, false if done.
 */
Maze.notDone = function() {
  return Maze.pegmanXcheck != Maze.finish_.x || Maze.pegmanYcheck != Maze.finish_.y;
  // return Maze.pegmanXcheck != Maze.finish_.x || Maze.pegmanYcheck != Maze.finish_.y || Maze.pegmanDcheck == Maze.correctdirections[Maze.pegmanYcheck][Maze.pegmanXcheck];
};

Maze.showHelp = function() {
  var help = document.getElementById('help');
  var button = document.getElementById('helpButton');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };
  BlocklyDialogs.showDialog(help, button, true, true, style, Maze.hideHelp);
  BlocklyDialogs.bridgeDialogKeyDown();
};

Maze.hideHelp = function() {
 BlocklyDialogs.stopDialogKeyDown();
};
Maze.storymessage = function (){
  var text1 = "Congratulations on making it to the circus!!";
  var text2 = "You have done so good in all these levels may be you are close to the end let's push a bit more for that Treasure";
  var text3 = "You walked a bit more after the last puzzle and found yourself in another maze but the inscribings on the wall say this one is a bit tricky let's solve this one and reach to the end.";
  var text4 = "(Quick tip : Use help commands whenever you are stuck on what to do!!)";
  document.getElementById('p1').textContent = text1;
  document.getElementById('p2').textContent = text2;
  document.getElementById('p3').textContent = text3;
  document.getElementById('p4').textContent = text4;
  document.getElementById('p2').style.top = document.getElementById('p1').offsetTop + document.getElementById('p1').offsetHeight + 'px';
  document.getElementById('p3').style.top = document.getElementById('p2').offsetTop + document.getElementById('p2').offsetHeight + 'px';
  function startlevel (){
    document.getElementById('storyMessageM2').style.display = 'none';
    Maze.init();
  };
  document.getElementById('cross').addEventListener("click",startlevel);
  document.getElementById('cross').addEventListener("touchend",startlevel);
};

window.addEventListener('load', Maze.storymessage);
