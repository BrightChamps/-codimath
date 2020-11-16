/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Mazeangle game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Mazeangle');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Trashcan');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.math');
goog.require('Blockly.utils.string');
goog.require('Blockly.VerticalFlyout');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Mazeangle.Blocks');
goog.require('Mazeangle.soy');


BlocklyGames.NAME = 'mazeangle';

/**
 * Go to the next level.  Add skin parameter.
 * @suppress {duplicate}
 */

Mazeangle.MAX_BLOCKS = [undefined, // Level 0.
    Infinity, Infinity, 2, 5, 5, 5, 5, 10, 7, 10][BlocklyGames.LEVEL];

// Crash type constants.
Mazeangle.CRASH_STOP = 1;
Mazeangle.CRASH_SPIN = 2;
Mazeangle.CRASH_FALL = 3;

Mazeangle.SKINS = [
  // sprite: A 1029x51 set of 21 avatar images.
  // tiles: A 250x200 set of 20 map images.
  // marker: A 20x34 goal image.
  // background: An optional 400x450 background image, or false.
  // look: Colour of sonar-like look icon.
  // winSound: List of sounds (in various formats) to play when the player wins.
  // crashSound: List of sounds (in various formats) for player crashes.
  // crashType: Behaviour when player crashes (stop, spin, or fall).
  {
    sprite: 'mazeangle/pegman.png',
    tiles: 'mazeangle/mazeangle-2.png',
    idlesprite: 'mazeangle/Idle.png',
    marker: 'mazeangle/marker.png',
    background: 'mazeangle/T3.png',
    look: '#000',
    coin: 'mazeangle/coin-sprite.png',
    winSound: ['mazeangle/win.mp3', 'mazeangle/win.ogg'],
    crashSound: ['mazeangle/fail_pegman.mp3', 'mazeangle/fail_pegman.ogg'],
    crashType: Mazeangle.CRASH_STOP
  },
  {
    sprite: 'mazeangle/astro.png',
    tiles: 'mazeangle/tiles_astro.png',
    marker: 'mazeangle/marker.png',
    background: 'mazeangle/bg_astro.jpg',
    // Coma star cluster, photo by George Hatfield, used with permission.
    look: '#fff',
    coin: 'mazeangle/coin.png',
    winSound: ['mazeangle/win.mp3', 'mazeangle/win.ogg'],
    crashSound: ['mazeangle/fail_astro.mp3', 'mazeangle/fail_astro.ogg'],
    crashType: Mazeangle.CRASH_SPIN
  },
  {
    sprite: 'mazeangle/panda.png',
    tiles: 'mazeangle/tiles_panda.png',
    marker: 'mazeangle/marker.png',
    background: 'mazeangle/bg_panda.jpg',
    // Spring canopy, photo by Rupert Fleetingly, CC licensed for reuse.
    look: '#000',
    coin: 'mazeangle/coin.png',
    winSound: ['mazeangle/win.mp3', 'mazeangle/win.ogg'],
    crashSound: ['mazeangle/fail_panda.mp3', 'mazeangle/fail_panda.ogg'],
    crashType: Mazeangle.CRASH_FALL
  }
];
Mazeangle.SKIN_ID = BlocklyGames.getNumberParamFromUrl('skin', 0, Mazeangle.SKINS.length);
Mazeangle.SKIN = Mazeangle.SKINS[Mazeangle.SKIN_ID];

/**
 * Milliseconds between each animation frame.
 */
Mazeangle.stepSpeed;

// BlocklyGames.coinval = 100;

/**
 * The types of squares in the mazeangle, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
Mazeangle.SquareType = {
  WALL: 0,
  OPEN: 1,
  START: 2,
  FINISH: 3
};
// Mazeangle.correctdirections = [2, 0, 14, 2, 0, 12, 12, 8, 10, 6, 10, 14, 0, 0, 0];
Mazeangle.correctdirections = [[-1, -1, -1, 7, -1, -1],
                          [-1, 0, 1, -1, 7, -1],
                          [1, -1, 5, -1, 5, 4],
                          [2, -1, -1, 6, -1, -1],
                          [-1, 3, -1, 0, 0, 16]];
// The mazeangle square constants defined above are inlined here
// for ease of reading and writing the static mazeangles.
Mazeangle.map = [
// Level 0.
 undefined,
// Level 1.
 [[0, 0, 0, 1, 0, 0],
  [0, 1, 1, 0, 1, 0],
  [1, 0, 0, 0, 1, 1],
  [1, 0, 0, 1, 0, 0],
  [0, 2, 0, 1, 1, 3]],
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
 * This is intentionally done so users see the mazeangle is about getting from
 * the start to the goal and not necessarily about moving over every part of
 * the mazeangle, 'mowing the lawn' as Neil calls it.
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
 * Measure mazeangle dimensions and set sizes.
 * ROWS: Number of tiles down.
 * COLS: Number of tiles across.
 * SQUARE_SIZE: Pixel height and width of each mazeangle square (i.e. tile).
 */
Mazeangle.ROWS = Mazeangle.map.length;
Mazeangle.COLS = Mazeangle.map[0].length;
Mazeangle.SQUARE_SIZE = (200);
Mazeangle.PEGMAN_HEIGHT = 80;
Mazeangle.PEGMAN_WIDTH = 80;
// console.log(Mazeangle.ROWS + ',' + Mazeangle.COLS);
// console.log(Mazeangle.MAZE_WIDTH + ',' + Mazeangle.MAZE_HEIGHT);
Mazeangle.PATH_WIDTH = Mazeangle.SQUARE_SIZE / 3;
Mazeangle.factorX = window.innerWidth;
Mazeangle.factorY = window.innerHeight;
var temp = Mazeangle.factorX / 2133 > Mazeangle.factorY/ 1084 ? Mazeangle.factorY/ 1084 : Mazeangle.factorX / 2133;

/**
 * Constants for cardinal directions.  Subsequent code assumes these are
 * in the range 0..3 and that opposites have an absolute difference of 2.
 * @enum {number}
 */
Mazeangle.DirectionType = {
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
Mazeangle.ResultType = {
  UNSET: 0,
  SUCCESS: 1,
  FAILURE: -1,
  TIMEOUT: 2,
  ERROR: -2
};

/**
 * Result of last execution.
 */
Mazeangle.result = Mazeangle.ResultType.UNSET;

/**
 * Starting direction.
 */
Mazeangle.startDirection = Mazeangle.DirectionType.EAST;

/**
 * PIDs of animation tasks currently executing.
 */
Mazeangle.pidList = [];

// Map each possible shape to a sprite.
// Input: Binary string representing Centre/North/West/South/East squares.
// Output: [x, y] coordinates of each tile's sprite in tiles.png.
Mazeangle.tile_SHAPES = {
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
Mazeangle.drawMap = function() {
  var svg = document.getElementById('svgMazeangle');
  var scale = Math.max(Mazeangle.ROWS, Mazeangle.COLS) * Mazeangle.SQUARE_SIZE;
  // svg.setAttribute('viewBox', '0 0 ' + scale + ' ' + scale);
  svg.style.width = Mazeangle.MAZE_WIDTH + 'px';
  svg.style.height = Mazeangle.MAZE_HEIGHT + 'px';
  svg.setAttribute('viewBox', '0 0 ' + Mazeangle.MAZE_WIDTH + ' ' + Mazeangle.MAZE_HEIGHT);
  // Draw the outer square.
  Blockly.utils.dom.createSvgElement('rect', {
      'height': Mazeangle.MAZE_HEIGHT,
      'width': Mazeangle.MAZE_WIDTH,
      'fill': '#F1EEE7',
      'stroke-width': 1,
      'stroke': '#CCB'
    }, svg);

  if (Mazeangle.SKIN.background) {
    var tile = Blockly.utils.dom.createSvgElement('image', {
        'height': Mazeangle.MAZE_HEIGHT,
        'width': Mazeangle.MAZE_WIDTH,
        // 'x': +Mazeangle.SQUARE_SIZE /6,
        // 'y': +Mazeangle.SQUARE_SIZE /12
        'x': 0,
        'y': 0
      }, svg);
    tile.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
        Mazeangle.SKIN.background);
  }

  // Draw the tiles making up the mazeangle map.

  // Return a value of '0' if the specified square is wall or out of bounds,
  // '1' otherwise (empty, start, finish).
  // var normalize = function(x, y) {
  //   if (x < 0 || x >= Mazeangle.COLS || y < 0 || y >= Mazeangle.ROWS) {
  //     return '0';
  //   }
  //   return (Mazeangle.map[y][x] == Mazeangle.SquareType.WALL) ? '0' : '1';
  // };
  //
  // // Compute and draw the tile for each square.
  // var tileId = 0;
  // for (var y = 0; y < Mazeangle.ROWS; y++) {
  //   for (var x = 0; x < Mazeangle.COLS; x++) {
  //     var tileShape = x.toString() + ',' + y.toString();
  //     var left = Mazeangle.tile_SHAPES[tileShape][0];
  //     var top = Mazeangle.tile_SHAPES[tileShape][1];
  //     // Tile's clipPath element.
  //     var tileClip = Blockly.utils.dom.createSvgElement('clipPath', {
  //         'id': 'tileClipPath' + tileId
  //       }, svg);
  //     Blockly.utils.dom.createSvgElement('rect', {
  //         'height': Mazeangle.SQUARE_SIZE,
  //         'width': Mazeangle.SQUARE_SIZE,
  //         'x': x * Mazeangle.SQUARE_SIZE,
  //         'y': y * Mazeangle.SQUARE_SIZE
  //       }, tileClip);
  //     // Tile sprite.
  //     var tile = Blockly.utils.dom.createSvgElement('image', {
  //         'height': Mazeangle.SQUARE_SIZE * 4,
  //         'width': Mazeangle.SQUARE_SIZE * 5,
  //         'clip-path': 'url(#tileClipPath' + tileId + ')',
  //         'x': (x - left) * Mazeangle.SQUARE_SIZE,
  //         'y': (y - top) * Mazeangle.SQUARE_SIZE
  //       }, svg);
  //     tile.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
  //         Mazeangle.SKIN.tiles);
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
      Mazeangle.SKIN.marker);

  // Pegman's clipPath element, whose (x, y) is reset by Mazeangle.displayPegman
  var pegmanClip = Blockly.utils.dom.createSvgElement('clipPath', {
      'id': 'pegmanClipPath'
    }, svg);
  Blockly.utils.dom.createSvgElement('rect', {
      'id': 'clipRect',
      'height': Mazeangle.PEGMAN_HEIGHT,
      'width': Mazeangle.PEGMAN_WIDTH
    }, pegmanClip);

  // Add Pegman.
  var pegmanIcon = Blockly.utils.dom.createSvgElement('image', {
      'id': 'pegman',
      'height': Mazeangle.PEGMAN_HEIGHT,
      'width': Mazeangle.PEGMAN_WIDTH * 16, // 49 * 21 = 1029
      'clip-path': 'url(#pegmanClipPath)',
      // 'opacity': '0.6'
    }, svg);
  pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      Mazeangle.SKIN.idlesprite);

};

/**
 * Initialize Blockly and the mazeangle.  Called on page load.
 */
Mazeangle.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Mazeangle.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       skin: Mazeangle.SKIN_ID,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init();

  // Setup the Pegman menu.
  var pegmanImg = document.querySelector('#pegmanButton>img');
  pegmanImg.style.backgroundImage = 'url(' + Mazeangle.SKIN.sprite + ')';
  var pegmanMenu = document.getElementById('pegmanMenu');
  var handlerFactory = function(n) {
    return function() {
      Mazeangle.changePegman(n);
    };
  };
  for (var i = 0; i < Mazeangle.SKINS.length; i++) {
    if (i == Mazeangle.SKIN_ID) {
      continue;
    }
    var div = document.createElement('div');
    var img = document.createElement('img');
    img.src = 'common/1x1.gif';
    img.style.backgroundImage = 'url(' + Mazeangle.SKINS[i].sprite + ')';
    div.appendChild(img);
    pegmanMenu.appendChild(div);
    Blockly.bindEvent_(div, 'mousedown', null, handlerFactory(i));
  }
  Blockly.bindEvent_(window, 'resize', null, Mazeangle.hidePegmanMenu);
  var pegmanButton = document.getElementById('pegmanButton');
  Blockly.bindEvent_(pegmanButton, 'mousedown', null, Mazeangle.showPegmanMenu);
  var pegmanButtonArrow = document.getElementById('pegmanButtonArrow');
  var arrow = document.createTextNode(Blockly.FieldDropdown.ARROW_CHAR);
  pegmanButtonArrow.appendChild(arrow);

  var rtl = BlocklyGames.isRtl();
  Mazeangle.SQUARE_SIZE = Mazeangle.SQUARE_SIZE * BlocklyGames.factor;
  Mazeangle.MAZE_WIDTH = Mazeangle.SQUARE_SIZE * Mazeangle.COLS;
  Mazeangle.MAZE_HEIGHT = Mazeangle.SQUARE_SIZE * Mazeangle.ROWS;
  Mazeangle.PEGMAN_HEIGHT = 130 * BlocklyGames.factor;
  Mazeangle.PEGMAN_WIDTH = 130 * BlocklyGames.factor;

  var blocklyDiv = document.getElementById('blockly');
  var visualization = document.getElementById('visualization');
  var top = visualization.offsetTop;
  var buttontable = document.getElementById('buttontable');
  var onresize = function(e) {
    var top = visualization.offsetTop;
    blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
    blocklyDiv.style.left = rtl ? '10px' : (Mazeangle.MAZE_WIDTH + 20) + 'px';
    blocklyDiv.style.width = (window.innerWidth - (Mazeangle.MAZE_WIDTH + 40)) + 'px';
    blocklyDiv.style.paddingBottom = 10 * BlocklyGames.factor + 'px';
  buttontable.style.left = blocklyDiv.offsetLeft + 'px';
  buttontable.style.width = (window.innerWidth - (Mazeangle.MAZE_WIDTH + 40)) + 'px';
  buttontable.style.top = blocklyDiv.offsetTop + Mazeangle.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('runButton').style.left = blocklyDiv.offsetLeft + 'px';
  document.getElementById('runButton').style.top = blocklyDiv.offsetTop + Mazeangle.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('resetButton').style.left = document.getElementById('runButton').offsetLeft + document.getElementById('runButton').offsetWidth + 'px';
  document.getElementById('resetButton').style.top = blocklyDiv.offsetTop + Mazeangle.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('resetButton').style.marginRight = '0px';
  };
  window.addEventListener('scroll', function() {
    onresize(null);
    Blockly.svgResize(BlocklyInterface.workspace);
    buttontable.style.left = blocklyDiv.offsetLeft + 'px';
    buttontable.style.width = (window.innerWidth - (Mazeangle.MAZE_WIDTH + 40)) + 'px';
    buttontable.style.top = blocklyDiv.offsetTop + Mazeangle.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('runButton').style.left = blocklyDiv.offsetLeft + 'px';
    document.getElementById('runButton').style.top = blocklyDiv.offsetTop + Mazeangle.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('resetButton').style.left = document.getElementById('runButton').offsetLeft + document.getElementById('runButton').offsetWidth + 'px';
    document.getElementById('resetButton').style.top = blocklyDiv.offsetTop + Mazeangle.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('resetButton').style.marginRight = '0px';
  });
  window.addEventListener('resize', onresize);
  onresize(null);
  Mazeangle.SQUARE_SIZE = Mazeangle.SQUARE_SIZE / BlocklyGames.factor;
  Mazeangle.MAZE_WIDTH = Mazeangle.SQUARE_SIZE / Mazeangle.COLS;
  Mazeangle.MAZE_HEIGHT = Mazeangle.SQUARE_SIZE / Mazeangle.ROWS;
  Mazeangle.PEGMAN_HEIGHT = 130 / BlocklyGames.factor;
  Mazeangle.PEGMAN_WIDTH = 130 / BlocklyGames.factor;

  Mazeangle.SQUARE_SIZE = Mazeangle.SQUARE_SIZE * BlocklyGames.factor;
  Mazeangle.MAZE_WIDTH = Mazeangle.SQUARE_SIZE * Mazeangle.COLS;
  Mazeangle.MAZE_HEIGHT = Mazeangle.SQUARE_SIZE * Mazeangle.ROWS;
  Mazeangle.PEGMAN_HEIGHT = 130 * BlocklyGames.factor;
  Mazeangle.PEGMAN_WIDTH = 130 * BlocklyGames.factor;

  // Scale the workspace so level 1 = 1.3, and level 10 = 1.0.
  // var scale = 1 + (1 - (BlocklyGames.LEVEL / BlocklyGames.MAX_LEVEL)) / 3;
  var scale = 1;
  BlocklyInterface.injectBlockly(
      {'maxBlocks': Mazeangle.MAX_BLOCKS,
       'rtl': rtl,
       'trashcan': true,
       'zoom': {'startScale': scale}});
  BlocklyInterface.workspace.getAudioManager().load(Mazeangle.SKIN.winSound, 'win');
  BlocklyInterface.workspace.getAudioManager().load(Mazeangle.SKIN.crashSound, 'fail');
  // Not really needed, there are no user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('moveForward,moveBackward,' +
      'turnRight,turnLeft,isPathForward,isPathRight,isPathBackward,isPathLeft');

  Mazeangle.drawMap();
  // Mazeangle.drawCoin();
  // Mazeangle.drawcoinval();
  var runButton1 = document.getElementById('runButton');
  var resetButton1 = document.getElementById('resetButton');

  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton1.style.minWidth) {
    resetButton1.style.minWidth = runButton1.offsetWidth + 'px';
  }


  // Locate the start and finish squares.
  for (var y = 0; y < Mazeangle.ROWS; y++) {
    for (var x = 0; x < Mazeangle.COLS; x++) {
      if (Mazeangle.map[y][x] == Mazeangle.SquareType.START) {
        Mazeangle.start_ = {x: x, y: y};
        Mazeangle.start1_ = {x: x, y: y};
      } else if (Mazeangle.map[y][x] == Mazeangle.SquareType.FINISH) {
        Mazeangle.finish_ = {x: x, y: y};
      }
    }
  }

  Mazeangle.reset(true);
  BlocklyInterface.workspace.addChangeListener(function() {Mazeangle.updateCapacity();});

  document.body.addEventListener('mousemove', Mazeangle.updatePegSpin_, true);

  BlocklyGames.bindClick('runButton', Mazeangle.runButtonClick);
  BlocklyGames.bindClick('resetButton', Mazeangle.resetButtonClick);


  // Add the spinning Pegman icon to the done dialog.
  // <img id="pegSpin" src="common/1x1.gif">
  var buttonDiv = document.getElementById('dialogDoneButtons');
  var pegSpin = document.createElement('img');
  pegSpin.id = 'pegSpin';
  pegSpin.src = 'common/1x1.gif';
  pegSpin.style.backgroundImage = 'url(' + Mazeangle.SKIN.sprite + ')';
  buttonDiv.parentNode.insertBefore(pegSpin, buttonDiv);

  // Lazy-load the JavaScript interpreter.
  BlocklyInterface.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyInterface.importPrettify();
  BlocklyGames.bindClick('helpButton', Mazeangle.showHelp);
};

/**
 * When the workspace changes, update the help as needed.
 * @param {Blockly.Events.Abstract=} opt_event Custom data for event.
 */
Mazeangle.levelHelp = function(opt_event) {
  if (opt_event && opt_event.type == Blockly.Events.UI) {
    // Just a change to highlighting or somesuch.
    return;
  } else if (BlocklyInterface.workspace.isDragging()) {
    // Don't change helps during drags.
    return;
  } else if (Mazeangle.result == Mazeangle.ResultType.SUCCESS ||
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
    //           '<block type="mazeangle_moveForward" x="10" y="10">',
    //             '<next>',
    //               '<block type="mazeangle_moveForward"></block>',
    //             '</next>',
    //           '</block>',
    //         '</xml>'];
    //     BlocklyInterface.injectReadonly('sampleOneTopBlock', xml);
    //     content = document.getElementById('dialogHelpOneTopBlock');
    //     style = {'width': '360px', 'top': '120px'};
    //     style[rtl ? 'right' : 'left'] = '225px';
    //     origin = topBlocks[0].getSvgRoot();
    //   } else if (Mazeangle.result == Mazeangle.ResultType.UNSET) {
    //     // Show run help dialog.
    //     content = document.getElementById('dialogHelpRun');
    //     style = {'width': '360px', 'top': '410px'};
    //     style[rtl ? 'right' : 'left'] = '400px';
    //     origin = document.getElementById('runButton');
    //   }
    // }
  } else if (BlocklyGames.LEVEL == 2) {
    if (Mazeangle.result != Mazeangle.ResultType.UNSET &&
        document.getElementById('runButton').style.display == 'none') {
      content = document.getElementById('dialogHelpReset');
      style = {'width': '360px', 'top': '410px'};
      style[rtl ? 'right' : 'left'] = '400px';
      origin = document.getElementById('resetButton');
    }
  } else if (BlocklyGames.LEVEL == 3) {
    if (userBlocks.indexOf('mazeangle_forever') == -1) {
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
        (userBlocks.indexOf('mazeangle_forever') == -1 ||
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
        if (block.type != 'mazeangle_forever') {
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
    if (Mazeangle.SKIN_ID == 0 && !Mazeangle.showPegmanMenu.activatedOnce) {
      content = document.getElementById('dialogHelpSkins');
      style = {'width': '360px', 'top': '60px'};
      style[rtl ? 'left' : 'right'] = '20px';
      origin = document.getElementById('pegmanButton');
    }
  } else if (BlocklyGames.LEVEL == 6) {
    if (userBlocks.indexOf('mazeangle_if') == -1) {
      content = document.getElementById('dialogHelpIf');
      style = {'width': '360px', 'top': '430px'};
      style[rtl ? 'right' : 'left'] = '425px';
      origin = toolbar[4].getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL == 7) {
    if (!Mazeangle.levelHelp.initialized7_) {
      // Create fake dropdown.
      var span = document.createElement('span');
      span.className = 'helpMenuFake';
      var options =
          [BlocklyGames.getMsg('Mazeangle_pathAhead'),
           BlocklyGames.getMsg('Mazeangle_pathLeft'),
           BlocklyGames.getMsg('Mazeangle_pathRight')];
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
      Mazeangle.levelHelp.initialized7_ = true;
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
    if (userBlocks.indexOf('mazeangle_ifElse') == -1) {
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
Mazeangle.changePegman = function(newSkin) {
  BlocklyInterface.saveToSessionStorage();
  location = location.protocol + '//' + location.host + location.pathname +
      '?lang=' + BlocklyGames.LANG + '&level=' + BlocklyGames.LEVEL +
      '&skin=' + newSkin;
};

/**
 * Display the Pegman skin-change menu.
 * @param {!Event} e Mouse, touch, or resize event.
 */
Mazeangle.showPegmanMenu = function(e) {
  var menu = document.getElementById('pegmanMenu');
  if (menu.style.display == 'block') {
    // Menu is already open.  Close it.
    Mazeangle.hidePegmanMenu(e);
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
  Mazeangle.pegmanMenuMouse_ =
      Blockly.bindEvent_(document.body, 'mousedown', null, Mazeangle.hidePegmanMenu);
  // Close the skin-changing hint if open.
  var hint = document.getElementById('dialogHelpSkins');
  if (hint && hint.className != 'dialogHiddenContent') {
    BlocklyDialogs.hideDialog(false);
  }
  Mazeangle.showPegmanMenu.activatedOnce = true;
};

/**
 * Hide the Pegman skin-change menu.
 * @param {!Event} e Mouse, touch, or resize event.
 */
Mazeangle.hidePegmanMenu = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  document.getElementById('pegmanMenu').style.display = 'none';
  document.getElementById('pegmanButton').classList.remove('buttonHover');
  if (Mazeangle.pegmanMenuMouse_) {
    Blockly.unbindEvent_(Mazeangle.pegmanMenuMouse_);
    delete Mazeangle.pegmanMenuMouse_;
  }
};

/**
 * Reset the mazeangle to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Mazeangle.reset = function(first) {
  // Kill all tasks.
  for (var i = 0; i < Mazeangle.pidList.length; i++) {
    clearTimeout(Mazeangle.pidList[i]);
  }
  Mazeangle.pidList = [];
  Mazeangle.prevlog.clear();
  // Move Pegman into position.
  Mazeangle.pegmanX = Mazeangle.start1_.x;
  Mazeangle.pegmanY = Mazeangle.start1_.y;
  Mazeangle.pegmanXcheck = Mazeangle.pegmanX;
  Mazeangle.pegmanYcheck = Mazeangle.pegmanY;
  if (first) {
    // Opening animation.
    Mazeangle.pegmanD = Mazeangle.startDirection - 2;
    Mazeangle.scheduleFinish(false);
    Mazeangle.pidList.push(setTimeout(function() {
      Mazeangle.stepSpeed = 130;
      //BlocklyGames.coinval = 100;
      Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                    [Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2 + 4]);
      Mazeangle.pegmanD = Mazeangle.startDirection;
      Mazeangle.pegmanDcheck = Mazeangle.pegmanD;
    }, Mazeangle.stepSpeed * 5));
  } else {
    Mazeangle.pegmanD = Mazeangle.startDirection;
    Mazeangle.pegmanDcheck = Mazeangle.pegmanD;
    Mazeangle.displayPegman(Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2);
  }

  // Move the finish icon into position.
  var finishIcon = document.getElementById('finish');
  finishIcon.setAttribute('x', Mazeangle.SQUARE_SIZE * (Mazeangle.finish_.x + 0.5) -
      finishIcon.getAttribute('width') / 2);
  finishIcon.setAttribute('y', Mazeangle.SQUARE_SIZE * (Mazeangle.finish_.y + 0.6) -
      finishIcon.getAttribute('height'));

  // Make 'look' icon invisible and promote to top.
  var lookIcon = document.getElementById('look');
  lookIcon.style.display = 'none';
  // lookIcon.parentNode.appendChild(lookIcon);
  // var paths = lookIcon.getElementsByTagName('path');
  // for (var i = 0, path; (path = paths[i]); i++) {
  //   path.setAttribute('stroke', Mazeangle.SKIN.look);
  // }
};

/**
 * Click the run button.  Start the program.
 * @param {!Event} e Mouse or touch event.
 */
Mazeangle.runButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  BlocklyDialogs.hideDialog(false);
  // Only allow a single top block on level 1.
  // if (BlocklyGames.LEVEL == 1 &&
  //     BlocklyInterface.workspace.getTopBlocks(false).length > 1 &&
  //     Mazeangle.result != Mazeangle.ResultType.SUCCESS &&
  //     !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
  //                                        BlocklyGames.LEVEL)) {
  //   // Mazeangle.levelHelp();
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
  // Mazeangle.reset(false);
  Mazeangle.execute();
};

/**
 * Updates the document's 'capacity' element with a message
 * indicating how many more blocks are permitted.  The capacity
 * is retrieved from BlocklyInterface.workspace.remainingCapacity().
 */
Mazeangle.updateCapacity = function() {
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
      var msg = BlocklyGames.getMsg('Mazeangle_capacity0');
    } else if (cap == 1) {
      var msg = BlocklyGames.getMsg('Mazeangle_capacity1');
    } else {
      var msg = BlocklyGames.getMsg('Mazeangle_capacity2');
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
 * Click the reset button.  Reset the mazeangle.
 * @param {!Event} e Mouse or touch event.
 */
Mazeangle.resetButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  //var runButton = document.getElementById('runButton');
  //runButton.style.display = 'inline';
  //document.getElementById('resetButton').style.display = 'none';
  BlocklyInterface.workspace.highlightBlock(null);
  Mazeangle.reset(false);
  Mazeangle.levelHelp();
};

/**
 * Inject the Mazeangle API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS-Interpreter.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Mazeangle.initInterpreter = function(interpreter, globalObject) {
  // API
  var wrapper;
  wrapper = function(id) {
    Mazeangle.move(0, id);
  };
  interpreter.setProperty(globalObject, 'moveForward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Mazeangle.move(2, id);
  };
  interpreter.setProperty(globalObject, 'moveBackward',
      interpreter.createNativeFunction(wrapper));


  wrapper = function(id) {
    Mazeangle.turn(0, id);
  };
  interpreter.setProperty(globalObject, 'turnNorth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Mazeangle.turn(1, id);
  };
  interpreter.setProperty(globalObject, 'turnNorthEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Mazeangle.turn(2, id);
  };
  interpreter.setProperty(globalObject, 'turnEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Mazeangle.turn(3, id);
  };
  interpreter.setProperty(globalObject, 'turnSouthEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Mazeangle.turn(4, id);
  };
  interpreter.setProperty(globalObject, 'turnSouth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Mazeangle.turn(5, id);
  };
  interpreter.setProperty(globalObject, 'turnSouthWest',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Mazeangle.turn(6, id);
  };
  interpreter.setProperty(globalObject, 'turnWest',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Mazeangle.turn(7, id);
  };
  interpreter.setProperty(globalObject, 'turnNorthWest',
      interpreter.createNativeFunction(wrapper));


  wrapper = function(id) {
    return Mazeangle.isPath(0, id);
  };
  interpreter.setProperty(globalObject, 'isPathForward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Mazeangle.isPath(1, id);
  };
  interpreter.setProperty(globalObject, 'isPathNorth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Mazeangle.isPath(2, id);
  };
  interpreter.setProperty(globalObject, 'isPathBackward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Mazeangle.isPath(3, id);
  };
  interpreter.setProperty(globalObject, 'isPathEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Mazeangle.isPath(4, id);
  };
  interpreter.setProperty(globalObject, 'isPathSouth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
        return Mazeangle.isPath(5, id);
      };
  interpreter.setProperty(globalObject, 'isPathWest',
          interpreter.createNativeFunction(wrapper));
  wrapper = function() {
    return Mazeangle.notDone();
  };
  interpreter.setProperty(globalObject, 'notDone',
      interpreter.createNativeFunction(wrapper));
};

/**
 * Execute the user's code.  Heaven help us...
 */
Mazeangle.execute = function() {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Mazeangle.execute, 250);
    return;
  }

  Mazeangle.log = [];
  Blockly.selected && Blockly.selected.unselect();
  var code = BlocklyInterface.getJsCode();
  BlocklyInterface.executedJsCode = code;
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
  Mazeangle.result = Mazeangle.ResultType.UNSET;
  var interpreter = new Interpreter(code, Mazeangle.initInterpreter);

  // Try running the user's code.  There are four possible outcomes:
  // 1. If pegman reaches the finish [SUCCESS], true is thrown.
  // 2. If the program is terminated due to running too long [TIMEOUT],
  //    false is thrown.
  // 3. If another error occurs [ERROR], that error is thrown.
  // 4. If the program ended normally but without solving the mazeangle [FAILURE],
  //    no error or exception is thrown.
  try {
    var ticks = 10000;  // 10k ticks runs Pegman for about 8 minutes.
    while (interpreter.step()) {
      if (ticks-- == 0) {
        throw Infinity;
      }
    }
    Mazeangle.result = Mazeangle.notDone() ?
        Mazeangle.ResultType.FAILURE : Mazeangle.ResultType.SUCCESS;
  } catch (e) {
    // A boolean is thrown for normal termination.
    // Abnormal termination is a user error.
    if (e === Infinity) {
      Mazeangle.result = Mazeangle.ResultType.TIMEOUT;
    } else if (e === false) {
      Mazeangle.result = Mazeangle.ResultType.ERROR;
    } else {
      // Syntax error, can't happen.
      Mazeangle.result = Mazeangle.ResultType.ERROR;
      alert(e);
    }
  }

  // Fast animation if execution is successful.  Slow otherwise.
  if (Mazeangle.result == Mazeangle.ResultType.SUCCESS) {
    Mazeangle.stepSpeed = 80;
    Mazeangle.log.push(['finish', null]);
  } else {
    Mazeangle.stepSpeed = 130;
  }
  // Mazeangle.log now contains a transcript of all the user's actions.
  // Reset the mazeangle and animate the transcript.
  // Mazeangle.reset(false);
  Mazeangle.pidList.push(setTimeout(Mazeangle.animate, 100));
};

/**
 * Iterate through the recorded path and animate pegman's actions.
 */
Mazeangle.prevlog = new Set();
Mazeangle.animate = function() {
  var action = Mazeangle.log.shift();
  if (!action) {
    BlocklyInterface.highlight(null);
    Mazeangle.levelHelp();
    return;
  }
  if(!Mazeangle.prevlog.has(action[1])){
    BlocklyInterface.highlight(action[1]);
    // console.log(action[0]+',' +action[1]);
    switch (action[0]) {
      case 'north':
        BlocklyGames.coinval +=10;
        Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                      [Mazeangle.pegmanX, Mazeangle.pegmanY - 1, Mazeangle.pegmanD * 2]);
        Mazeangle.pegmanY--;
        break;
      case 'northeast':
        BlocklyGames.coinval +=10;
        Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                      [Mazeangle.pegmanX + 1, Mazeangle.pegmanY - 1, Mazeangle.pegmanD * 2]);
        Mazeangle.pegmanX++;
        Mazeangle.pegmanY--;
        break;
      case 'east':
        BlocklyGames.coinval +=10;
        Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                      [Mazeangle.pegmanX + 1, Mazeangle.pegmanY, Mazeangle.pegmanD * 2]);
        Mazeangle.pegmanX++;
        break;
      case 'southeast':
        BlocklyGames.coinval +=10;
        Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                      [Mazeangle.pegmanX + 1, Mazeangle.pegmanY + 1, Mazeangle.pegmanD * 2]);
        Mazeangle.pegmanX++;
        Mazeangle.pegmanY++;
        break;
      case 'south':
        BlocklyGames.coinval +=10;
        Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                      [Mazeangle.pegmanX, Mazeangle.pegmanY + 1, Mazeangle.pegmanD * 2]);
        Mazeangle.pegmanY++;
        break;
      case 'southwest':
        BlocklyGames.coinval +=10;
        Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                      [Mazeangle.pegmanX - 1, Mazeangle.pegmanY + 1, Mazeangle.pegmanD * 2]);
        Mazeangle.pegmanX--;
        Mazeangle.pegmanY++;
        break;
      case 'west':
        BlocklyGames.coinval +=10;
        Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                      [Mazeangle.pegmanX - 1, Mazeangle.pegmanY, Mazeangle.pegmanD * 2]);
        Mazeangle.pegmanX--;
        break;
      case 'northwest':
        BlocklyGames.coinval +=10;
        Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                      [Mazeangle.pegmanX - 1, Mazeangle.pegmanY - 1, Mazeangle.pegmanD * 2]);
        Mazeangle.pegmanX--;
        Mazeangle.pegmanY--;
        break;

      case 'look_north':
        Mazeangle.scheduleLook(Mazeangle.DirectionType.NORTH);
        break;
      case 'look_northeast':
        Mazeangle.scheduleLook(Mazeangle.DirectionType.NORTHEAST);
        break;
      case 'look_east':
        Mazeangle.scheduleLook(Mazeangle.DirectionType.EAST);
        break;
      case 'look_southeast':
        Mazeangle.scheduleLook(Mazeangle.DirectionType.SOUTHEAST);
        break;
      case 'look_south':
        Mazeangle.scheduleLook(Mazeangle.DirectionType.SOUTH);
        break;
      case 'look_southwest':
        Mazeangle.scheduleLook(Mazeangle.DirectionType.SOUTHWEST);
        break;
      case 'look_west':
        Mazeangle.scheduleLook(Mazeangle.DirectionType.WEST);
        break;
      case 'look_northwest':
        Mazeangle.scheduleLook(Mazeangle.DirectionType.NORTHWEST);
        break;

      case 'fail_forward':
        BlocklyGames.coinval -=10;
        Mazeangle.scheduleFail(true);
        break;
      case 'fail_backward':
        BlocklyGames.coinval -=10;
        Mazeangle.scheduleFail(false);
        break;
      case 'North':
        Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                      [Mazeangle.pegmanX, Mazeangle.pegmanY, 2 * 2 ]);
        Mazeangle.pegmanD = Mazeangle.constrainDirection4(Mazeangle.pegmanD = 2);
        break;
      case 'NorthEast':
        Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                      [Mazeangle.pegmanX, Mazeangle.pegmanY, 1 * 2]);
        Mazeangle.pegmanD = Mazeangle.constrainDirection4(Mazeangle.pegmanD = 1);
        break;
      case 'East':
        Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                      [Mazeangle.pegmanX, Mazeangle.pegmanY, 0 * 2 ]);
        Mazeangle.pegmanD = Mazeangle.constrainDirection4(Mazeangle.pegmanD = 0);
        break;
      case 'SouthEast':
        Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                      [Mazeangle.pegmanX, Mazeangle.pegmanY, 7 * 2]);
        Mazeangle.pegmanD = Mazeangle.constrainDirection4(Mazeangle.pegmanD = 7);
        break;
      case 'South':
        Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                      [Mazeangle.pegmanX, Mazeangle.pegmanY, 6 * 2]);
        Mazeangle.pegmanD = Mazeangle.constrainDirection4(Mazeangle.pegmanD = 6);
        break;
      case 'SouthWest':
        Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                      [Mazeangle.pegmanX, Mazeangle.pegmanY, 5 * 2]);
        Mazeangle.pegmanD = Mazeangle.constrainDirection4(Mazeangle.pegmanD = 5);
        break;
      case 'West':
        Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                      [Mazeangle.pegmanX, Mazeangle.pegmanY, 4 * 2]);
        Mazeangle.pegmanD = Mazeangle.constrainDirection4(Mazeangle.pegmanD = 4);
        break;
        case 'NorthWest':
          Mazeangle.schedule([Mazeangle.pegmanX, Mazeangle.pegmanY, Mazeangle.pegmanD * 2],
                        [Mazeangle.pegmanX, Mazeangle.pegmanY, 3 * 2]);
          Mazeangle.pegmanD = Mazeangle.constrainDirection4(Mazeangle.pegmanD = 3);
          break;
      case 'finish':
        Mazeangle.scheduleFinish(true);
        setTimeout(BlocklyInterface.nextLevel, 1000);
      }
      Mazeangle.prevlog.add(action[1]);
      var factor = Mazeangle.timevalue;
  }
  else {
    var factor = 1;
  }
  // console.log(Mazeangle.prevlog);
  Mazeangle.pidList.push(setTimeout(Mazeangle.animate, Mazeangle.stepSpeed * factor));
};

/**
 * Point the congratulations Pegman to face the mouse.
 * @param {Event} e Mouse move event.
 * @private
 */
Mazeangle.updatePegSpin_ = function(e) {
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
  pegSpin.style.backgroundPosition = (-quad * Mazeangle.PEGMAN_WIDTH) + 'px 0px';
};

/**
 * Schedule the animations for a move or turn.
 * @param {!Array.<number>} startPos X, Y and direction starting points.
 * @param {!Array.<number>} endPos X, Y and direction ending points.
 */
Mazeangle.schedule = function(startPos, endPos) {
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
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 1 + consolation));
        }, Mazeangle.stepSpeed));
        factor = 2;
        break;
      case 4:
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 1 + consolation));
        }, Mazeangle.stepSpeed));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 2 + consolation));
        }, Mazeangle.stepSpeed * 2));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 3 + consolation));
        }, Mazeangle.stepSpeed * 3));
        factor = 4;
        break;
      case 6:
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 1 + consolation));
        }, Mazeangle.stepSpeed));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 2 + consolation));
        }, Mazeangle.stepSpeed * 2));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 3 + consolation));
        }, Mazeangle.stepSpeed * 3));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 4 + consolation));
        }, Mazeangle.stepSpeed * 4));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 5 + consolation));
        }, Mazeangle.stepSpeed * 5));
        factor = 6;
        break;
      case 8:
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 1 + consolation));
        }, Mazeangle.stepSpeed));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 2 + consolation));
        }, Mazeangle.stepSpeed * 2));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 3 + consolation));
        }, Mazeangle.stepSpeed * 3));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 4 + consolation));
        }, Mazeangle.stepSpeed * 4));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 5 + consolation));
        }, Mazeangle.stepSpeed * 5));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 6 + consolation));
        }, Mazeangle.stepSpeed * 6));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 7 + consolation));
        }, Mazeangle.stepSpeed * 7));
        factor = 8;
        break;
    }
  }
  else if(deltas[2] < 0){
    switch (Math.abs(deltas[2])) {
      case 2:
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 1 + consolation));
        }, Mazeangle.stepSpeed));
        factor = 2;
        break;
      case 4:
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 3 + consolation));
        }, Mazeangle.stepSpeed));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 2 + consolation));
        }, Mazeangle.stepSpeed * 2));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 1 + consolation));
        }, Mazeangle.stepSpeed * 3));
        factor = 4;
        break;
      case 6:
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 5 + consolation));
        }, Mazeangle.stepSpeed));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 4 + consolation));
        }, Mazeangle.stepSpeed * 2));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 3 + consolation));
        }, Mazeangle.stepSpeed * 3));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 2 + consolation));
        }, Mazeangle.stepSpeed * 4));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 1 + consolation));
        }, Mazeangle.stepSpeed * 5));
        factor = 6;
        break;
      case 8:
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 7 + consolation));
        }, Mazeangle.stepSpeed));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 6 + consolation));
        }, Mazeangle.stepSpeed * 2));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 5 + consolation));
        }, Mazeangle.stepSpeed * 3));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 4 + consolation));
        }, Mazeangle.stepSpeed * 4));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 3 + consolation));
        }, Mazeangle.stepSpeed * 5));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 2 + consolation));
        }, Mazeangle.stepSpeed * 6));
      Mazeangle.pidList.push(setTimeout(function() {
          Mazeangle.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Mazeangle.constrainDirection16(startPos[2] + 1 + consolation));
        }, Mazeangle.stepSpeed * 7));
        factor = 8;
        break;
    }
  }
  else if(deltas[2] == 0){
    var pegmanIcon = document.getElementById('pegman');
    // alert(startPos[2]);
    pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href','start/' + startPos[2] + '.png');
    for(var i=1; i <= (Math.abs(deltas[0]) * 32 || Math.abs(deltas[1]) * 32); i++ ) {
      Mazeangle.timeout = function(val) {
        Mazeangle.pidList.push(setTimeout(function() {
           Mazeangle.displayPegman(startPos[0] + (deltas[0] * val / 32) ,
               (startPos[1] + deltas[1] * val / 32),
               Mazeangle.constrainDirection16(val-1));
         }, Mazeangle.stepSpeed * val));
      }
      Mazeangle.timeout(i);
    }
    factor = Math.abs(deltas[0]) > Math.abs(deltas[1]) ? Math.abs(deltas[0]) * 32 + 4 : Math.abs(deltas[1]) * 32 + 4;
    Mazeangle.pidList.push(setTimeout(function() {
        pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href','start/Idle.png');
        Mazeangle.displayPegman(endPos[0], endPos[1],
            Mazeangle.constrainDirection16(endPos[2]));
      }, Mazeangle.stepSpeed * (factor - 2)));
  }
  Mazeangle.timevalue = factor + 2;
  BlocklyGames.updatecoinvalue();
  Mazeangle.pidList.push(setTimeout(function() {
    document.getElementById('pegman').style.opacity = 0.5;
      Mazeangle.displayPegman(endPos[0], endPos[1],
          Mazeangle.constrainDirection16(endPos[2]));
    }, Mazeangle.stepSpeed * factor));

};

/**
 * Schedule the animations and sounds for a failed move.
 * @param {boolean} forward True if forward, false if backward.
 */
Mazeangle.scheduleFail = function(forward) {
  var deltaX = 0;
  var deltaY = 0;
  // BlocklyGames.coinval -=10;
  // Mazeangle.drawcoinval();
  BlocklyGames.updatecoinvalue();
  switch (Mazeangle.pegmanD) {
    case Mazeangle.DirectionType.NORTH:
      deltaY = -1;
      break;
    case Mazeangle.DirectionType.NORTHEAST:
      deltaX = 1;
      deltaY = -1;
      break;
    case Mazeangle.DirectionType.EAST:
      deltaX = 1;
      break;
    case Mazeangle.DirectionType.SOUTHEAST:
      deltaX = 1;
      deltaY = 1;
      break;
    case Mazeangle.DirectionType.SOUTH:
      deltaY = 1;
      break;
    case Mazeangle.DirectionType.SOUTHWEST:
      deltaX = -1;
      deltaY = 1;
      break;
    case Mazeangle.DirectionType.WEST:
      deltaX = -1;
      break;
    case Mazeangle.DirectionType.NORTHWEST:
      deltaX = -1;
      deltaY = -1;
      break;

  }
  if (!forward) {
    deltaX = -deltaX;
    deltaY = -deltaY;
  }
  if (Mazeangle.SKIN.crashType == Mazeangle.CRASH_STOP) {
    // Bounce bounce.
    deltaX /= 4;
    deltaY /= 4;
    var direction16 = Mazeangle.constrainDirection16(Mazeangle.pegmanD * 2);
    Mazeangle.displayPegman(Mazeangle.pegmanX + deltaX,
                       Mazeangle.pegmanY + deltaY,
                       direction16);
    BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    Mazeangle.pidList.push(setTimeout(function() {
      Mazeangle.displayPegman(Mazeangle.pegmanX,
                         Mazeangle.pegmanY,
                         direction16);
      }, Mazeangle.stepSpeed));
    Mazeangle.pidList.push(setTimeout(function() {
      Mazeangle.displayPegman(Mazeangle.pegmanX + deltaX,
                         Mazeangle.pegmanY + deltaY,
                         direction16);
      BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    }, Mazeangle.stepSpeed * 2));
    Mazeangle.pidList.push(setTimeout(function() {
        Mazeangle.displayPegman(Mazeangle.pegmanX, Mazeangle.pegmanY, direction16);
      }, Mazeangle.stepSpeed * 3));
  } else {
    // Add a small random delta away from the grid.
    var deltaZ = (Math.random() - 0.5) * 10;
    var deltaD = (Math.random() - 0.5) / 2;
    deltaX += (Math.random() - 0.5) / 4;
    deltaY += (Math.random() - 0.5) / 4;
    deltaX /= 8;
    deltaY /= 8;
    var acceleration = 0;
    if (Mazeangle.SKIN.crashType == Mazeangle.CRASH_FALL) {
      acceleration = 0.01;
    }
    Mazeangle.pidList.push(setTimeout(function() {
      BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    }, Mazeangle.stepSpeed * 2));
    var setPosition = function(n) {
      return function() {
        var direction16 = Mazeangle.constrainDirection16(Mazeangle.pegmanD * 4 +
                                                    deltaD * n);
        Mazeangle.displayPegman(Mazeangle.pegmanX + deltaX * n,
                           Mazeangle.pegmanY + deltaY * n,
                           direction16,
                           deltaZ * n);
        deltaY += acceleration;
      };
    };
    // 100 frames should get Pegman offscreen.
    for (var i = 1; i < 100; i++) {
      Mazeangle.pidList.push(setTimeout(setPosition(i),
          Mazeangle.stepSpeed * i / 2));
    }
  }
};

/**
 * Schedule the animations and sound for a victory dance.
 * @param {boolean} sound Play the victory sound.
 */
Mazeangle.scheduleFinish = function(sound) {
  var direction16 = Mazeangle.constrainDirection16(Mazeangle.pegmanD * 2);
  Mazeangle.displayPegman(Mazeangle.pegmanX, Mazeangle.pegmanY, 16);
  if (sound) {
    BlocklyInterface.workspace.getAudioManager().play('win', 0.5);
  }
  Mazeangle.stepSpeed = 150;  // Slow down victory animation a bit.
  Mazeangle.pidList.push(setTimeout(function() {
    Mazeangle.displayPegman(Mazeangle.pegmanX, Mazeangle.pegmanY, 18);
    }, Mazeangle.stepSpeed));
  Mazeangle.pidList.push(setTimeout(function() {
    Mazeangle.displayPegman(Mazeangle.pegmanX, Mazeangle.pegmanY, 16);
    }, Mazeangle.stepSpeed * 2));
  Mazeangle.pidList.push(setTimeout(function() {
      Mazeangle.displayPegman(Mazeangle.pegmanX, Mazeangle.pegmanY, direction16);
    }, Mazeangle.stepSpeed * 3));
};

/**
 * Display Pegman at the specified location, facing the specified direction.
 * @param {number} x Horizontal grid (or fraction thereof).
 * @param {number} y Vertical grid (or fraction thereof).
 * @param {number} d Direction (0 - 15) or dance (16 - 17).
 * @param {number=} opt_angle Optional angle (in degrees) to rotate Pegman.
 */
Mazeangle.displayPegman = function(x, y, d, opt_angle) {
  var valueX = 0;
  var valueY = 0;
  var pegmanIcon = document.getElementById('pegman');
  pegmanIcon.setAttribute('x',
      x * Mazeangle.SQUARE_SIZE - d * Mazeangle.PEGMAN_WIDTH + 1 + valueX);
  pegmanIcon.setAttribute('y',
      Mazeangle.SQUARE_SIZE * (y + 0.5) - Mazeangle.PEGMAN_HEIGHT / 2 - 8 + valueY);
  if (opt_angle) {
    pegmanIcon.setAttribute('transform', 'rotate(' + opt_angle + ', ' +
        (x * Mazeangle.SQUARE_SIZE + Mazeangle.SQUARE_SIZE / 2) + ', ' +
        (y * Mazeangle.SQUARE_SIZE + Mazeangle.SQUARE_SIZE / 2) + ')');
  } else {
    pegmanIcon.setAttribute('transform', 'rotate(0, 0, 0)');
  }
  // Mazeangle.scheduleLook(x , y, Mazeangle.constrainDirection4(Mazeangle.pegmanD));
  var clipRect = document.getElementById('clipRect');
  clipRect.setAttribute('x', x * Mazeangle.SQUARE_SIZE + 1 +valueX);
  clipRect.setAttribute('y', pegmanIcon.getAttribute('y'));
};

/**
 * Display the look icon at Pegman's current location,
 * in the specified direction.
 * @param {!Mazeangle.DirectionType} d Direction (0 - 3).
 */
Mazeangle.scheduleLook = function(x, y, d) {
  x -=0.10;
  y -= 0.25;
  x *= Mazeangle.SQUARE_SIZE;
  y *= Mazeangle.SQUARE_SIZE;
  var deg = d * 90 - 45;

  var lookIcon = document.getElementById('look');
  lookIcon.style.opacity = '0.97';
  lookIcon.setAttribute('transform',
      'translate(' + x + ', ' + y + ') ' +
      'rotate(0 0 0) scale(1)');
  // var paths = lookIcon.getElementsByTagName('path');
  // lookIcon.style.display = 'inline';
  // for (var i = 0, path; (path = paths[i]); i++) {
  //   Mazeangle.scheduleLookStep(path, Mazeangle.stepSpeed * i);
  // }
};

/**
 * Schedule one of the 'look' icon's waves to appear, then disappear.
 * @param {!Element} path Element to make appear.
 * @param {number} delay Milliseconds to wait before making wave appear.
 */
Mazeangle.scheduleLookStep = function(path, delay) {
  Mazeangle.pidList.push(setTimeout(function() {
    path.style.display = 'inline';
    setTimeout(function() {
      path.style.display = 'none';
    }, Mazeangle.stepSpeed * 2);
  }, delay));
};

/**
 * Keep the direction within 0-4, wrapping at both ends.
 * @param {number} d Potentially out-of-bounds direction value.
 * @return {number} Legal direction value.
 */
Mazeangle.constrainDirection4 = function(d) {
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
Mazeangle.constrainDirection16 = function(d) {
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
 * @throws {true} If the end of the mazeangle is reached.
 * @throws {false} If Pegman collides with a wall.
 */
Mazeangle.move = function(direction, id) {
  if(!Mazeangle.prevlog.has(id))
  {
    if (!Mazeangle.isPath(direction, null)) {
      Mazeangle.log.push(['fail_' + (direction ? 'backward' : 'forward'), id]);
      throw false;
    }
    // If moving backward, flip the effective direction.
    var effectiveDirection = Mazeangle.pegmanDcheck + direction;
    var command;
    switch (Mazeangle.constrainDirection4(effectiveDirection)) {
      case Mazeangle.DirectionType.NORTH:
        Mazeangle.pegmanYcheck--;
        command = 'north';
        break;
      case Mazeangle.DirectionType.NORTHEAST:
      Mazeangle.pegmanXcheck++;
      Mazeangle.pegmanYcheck--;
      command = 'northeast';
      break;
      case Mazeangle.DirectionType.EAST:
        Mazeangle.pegmanXcheck++;
        command = 'east';
        break;
      case Mazeangle.DirectionType.SOUTHEAST:
      Mazeangle.pegmanXcheck++;
      Mazeangle.pegmanYcheck++;
      command = 'southeast';
      break;
      case Mazeangle.DirectionType.SOUTH:
        Mazeangle.pegmanYcheck++;
        command = 'south';
        break;
      case Mazeangle.DirectionType.SOUTHWEST:
      Mazeangle.pegmanXcheck--;
      Mazeangle.pegmanYcheck++;
      command = 'southwest';
      break;
      case Mazeangle.DirectionType.WEST:
        Mazeangle.pegmanXcheck--;
        command = 'west';
        break;
        case Mazeangle.DirectionType.NORTHWEST:
        Mazeangle.pegmanXcheck--;
        Mazeangle.pegmanYcheck--;
        command = 'northwest';
        break;
    }
  }
  Mazeangle.log.push([command, id]);
};

/**
 * Turn pegman left or right.
 * @param {number} direction Direction to turn (0 = left, 1 = right).
 * @param {string} id ID of block that triggered this action.
 */
Mazeangle.turn = function(direction, id) {
  // if (direction) {
  //   // Right turn (clockwise).
  //   Mazeangle.pegmanD++;
  //   Mazeangle.log.push(['right', id]);
  // } else {
  //   // Left turn (counterclockwise).
  //   Mazeangle.pegmanD--;
  //   Mazeangle.log.push(['left', id]);
  // }
  if(!Mazeangle.prevlog.has(id))
  {
    switch (direction)
    {
      case 0:
        Mazeangle.pegmanDcheck = 2;
        Mazeangle.log.push(['North',id]);
        break;
      case 1:
        Mazeangle.pegmanDcheck = 1;
        Mazeangle.log.push(['NorthEast',id]);
        break;
      case 2:
        Mazeangle.pegmanDcheck = 0;
        Mazeangle.log.push(['East',id]);
        break;
      case 3:
        Mazeangle.pegmanDcheck = 7;
        Mazeangle.log.push(['SouthEast',id]);
        break;
      case 4:
        Mazeangle.pegmanDcheck = 6;
        Mazeangle.log.push(['South',id]);
        break;
      case 5:
        Mazeangle.pegmanDcheck = 5;
        Mazeangle.log.push(['SouthWest',id]);
        break;
      case 6:
        Mazeangle.pegmanDcheck = 4;
        Mazeangle.log.push(['West',id]);
        break;
      case 7:
        Mazeangle.pegmanDcheck = 3;
        Mazeangle.log.push(['NorthWest',id]);
        break;
    }
  }
  Mazeangle.pegmanDcheck = Mazeangle.constrainDirection4(Mazeangle.pegmanDcheck);
};

/**
 * Is there a path next to pegman?
 * @param {number} direction Direction to look
 *     (0 = forward, 1 = right, 2 = backward, 3 = left).
 * @param {?string} id ID of block that triggered this action.
 *     Null if called as a helper function in Mazeangle.move().
 * @return {boolean} True if there is a path.
 */
Mazeangle.isPath = function(direction, id) {
  if(!Mazeangle.prevlog.has(id))
  {
    var effectiveDirection = Mazeangle.pegmanDcheck + direction;
    var square;
    var cdirection;
    var command;
    switch (Mazeangle.constrainDirection4(effectiveDirection)) {
      case Mazeangle.DirectionType.NORTH:
        square = Mazeangle.map[Mazeangle.pegmanYcheck - 1] &&
            Mazeangle.map[Mazeangle.pegmanYcheck - 1][Mazeangle.pegmanXcheck];
        command = 'look_north';
        break;
      case Mazeangle.DirectionType.NORTHEAST:
        square = Mazeangle.map[Mazeangle.pegmanYcheck - 1][Mazeangle.pegmanXcheck + 1] &&
            Mazeangle.map[Mazeangle.pegmanYcheck -1];
        command = 'look_northeast';
        break;
      case Mazeangle.DirectionType.EAST:
        square = Mazeangle.map[Mazeangle.pegmanYcheck][Mazeangle.pegmanXcheck + 1];
        command = 'look_east';
        break;
      case Mazeangle.DirectionType.SOUTHEAST:
        square = Mazeangle.map[Mazeangle.pegmanYcheck + 1][Mazeangle.pegmanXcheck + 1] &&
            Mazeangle.map[Mazeangle.pegmanYcheck + 1];
        command = 'look_southeast';
        break;
      case Mazeangle.DirectionType.SOUTH:
        square = Mazeangle.map[Mazeangle.pegmanYcheck + 1] &&
            Mazeangle.map[Mazeangle.pegmanYcheck + 1][Mazeangle.pegmanXcheck];
        command = 'look_south';
        break;
      case Mazeangle.DirectionType.SOUTHWEST:
        square = Mazeangle.map[Mazeangle.pegmanYcheck + 1][Mazeangle.pegmanXcheck - 1] &&
            Mazeangle.map[Mazeangle.pegmanYcheck + 1];
        command = 'look_southwest';
        break;
      case Mazeangle.DirectionType.WEST:
        square = Mazeangle.map[Mazeangle.pegmanYcheck][Mazeangle.pegmanXcheck - 1];
        command = 'look_west';
        break;
      case Mazeangle.DirectionType.NORTHWEST:
        square = Mazeangle.map[Mazeangle.pegmanYcheck - 1][Mazeangle.pegmanXcheck - 1] &&
            Mazeangle.map[Mazeangle.pegmanYcheck - 1];
        command = 'look_northwest';
        break;
    }
  }
  // alert(effectiveDirection);
  if (id) {
    Mazeangle.log.push([command, id]);
  }
  return square !== Mazeangle.SquareType.WALL && square !== undefined && effectiveDirection == Mazeangle.correctdirections[Mazeangle.pegmanYcheck][Mazeangle.pegmanXcheck];
};

/**
 * Is the player at the finish marker?
 * @return {boolean} True if not done, false if done.
 */
Mazeangle.notDone = function() {
  return Mazeangle.pegmanXcheck != Mazeangle.finish_.x || Mazeangle.pegmanYcheck != Mazeangle.finish_.y;
  // return Mazeangle.pegmanXcheck != Mazeangle.finish_.x || Mazeangle.pegmanYcheck != Mazeangle.finish_.y || Mazeangle.pegmanDcheck == Mazeangle.correctdirections[Mazeangle.pegmanYcheck][Mazeangle.pegmanXcheck];
};

Mazeangle.showHelp = function() {
  var help = document.getElementById('help');
  var button = document.getElementById('helpButton');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };
  BlocklyDialogs.showDialog(help, button, true, true, style, Mazeangle.hideHelp);
  BlocklyDialogs.bridgeDialogKeyDown();
};

Mazeangle.hideHelp = function() {
 BlocklyDialogs.stopDialogKeyDown();
};

window.addEventListener('load', Mazeangle.init);
