/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Bridge game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Bridge');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Trashcan');
goog.require('Blockly.Toolbox');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.math');
goog.require('Blockly.utils.string');
goog.require('Blockly.VerticalFlyout');
goog.require('BlocklyDialogs');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Bridge.Blocks');
goog.require('Bridge.soy');


BlocklyGames.NAME = 'bridge';

/**
 * Go to the next level.  Add skin parameter.
 * @suppress {duplicate}
 */
Bridge.MAX_BLOCKS = [undefined, // Level 0.
    Infinity, Infinity, 2, 5, 5, 5, 5, 10, 7, 10][BlocklyGames.LEVEL];

// Crash type constants.
Bridge.CRASH_STOP = 1;
Bridge.CRASH_SPIN = 2;
Bridge.CRASH_FALL = 3;

Bridge.SKINS = [
  // sprite: A 1029x51 set of 21 avatar images.
  // tiles: A 250x200 set of 20 map images.
  // marker: A 20x34 goal image.
  // background: An optional 400x450 background image, or false.
  // look: Colour of sonar-like look icon.
  // winSound: List of sounds (in various formats) to play when the player wins.
  // crashSound: List of sounds (in various formats) for player crashes.
  // crashType: Behaviour when player crashes (stop, spin, or fall).
  {
    sprite: 'bridge/pegman.png',
    idlesprite: 'bridge/Idle.png',
    tiles: 'bridge/tiles_path.png',
    emptytiles : 'bridge/empty.png',
    bridgemarker: 'bridge/circus.png',
    marker: 'bridge/empty.png',
    background: 'bridge/BridgeF4.png',
    backgroundwater: 'bridge/river-wave.png',
    look: '#000',
    coin: 'bridge/coin-sprite.png',
    winSound: ['bridge/win.mp3', 'bridge/win.ogg'],
    crashSound: ['bridge/fail_pegman.mp3', 'bridge/fail_pegman.ogg'],
    crashType: Bridge.CRASH_STOP
  },
  {
    sprite: 'bridge/astro.png',
    tiles: 'bridge/tiles_astro.png',
    marker: 'bridge/marker.png',
    background: 'bridge/bg_astro.jpg',
    // Coma star cluster, photo by George Hatfield, used with permission.
    look: '#fff',
    coin: 'bridge/coin.png',
    winSound: ['bridge/win.mp3', 'bridge/win.ogg'],
    crashSound: ['bridge/fail_astro.mp3', 'bridge/fail_astro.ogg'],
    crashType: Bridge.CRASH_SPIN
  },
  {
    sprite: 'bridge/panda.png',
    tiles: 'bridge/tiles_panda.png',
    marker: 'bridge/marker.png',
    background: 'bridge/bg_panda.jpg',
    // Spring canopy, photo by Rupert Fleetingly, CC licensed for reuse.
    look: '#000',
    coin: 'bridge/coin.png',
    winSound: ['bridge/win.mp3', 'bridge/win.ogg'],
    crashSound: ['bridge/fail_panda.mp3', 'bridge/fail_panda.ogg'],
    crashType: Bridge.CRASH_FALL
  }
];
Bridge.SKIN_ID = BlocklyGames.getNumberParamFromUrl('skin', 0, Bridge.SKINS.length);
Bridge.SKIN = Bridge.SKINS[Bridge.SKIN_ID];

/**
 * Milliseconds between each animation frame.
 */
Bridge.stepSpeed;

// BlocklyGames.coinval = 100;

/**
 * The types of squares in the bridge, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
Bridge.SquareType = {
  WALL: 0,
  OPEN: 1,
  START: 2,
  COINPOS: 3,
  FINISH: 4
};

// The bridge square constants defined above are inlined here
// for ease of reading and writing the static bridges.
Bridge.map = [
// Level 0.
 undefined,
// Level 1.
 [[0, 0, 0, 4, 0, 0],
  [1, 1, 1, 1, 1, 1],
  [2, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1]],
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
 * Note, the path continues past the bridge and the goal in both directions.
 * This is intentionally done so users see the bridge is about getting from
 * the bridge to the goal and not necessarily about moving over every part of
 * the bridge, 'mowing the lawn' as Neil calls it.
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
 * Measure bridge dimensions and set sizes.
 * ROWS: Number of tiles down.
 * COLS: Number of tiles across.
 * SQUARE_SIZE: Pixel height and width of each bridge square (i.e. tile).
 */
Bridge.ROWS = Bridge.map.length;
Bridge.COLS = Bridge.map[0].length;
Bridge.SQUARE_SIZE = (200);
Bridge.PEGMAN_HEIGHT = 80;
Bridge.PEGMAN_WIDTH = 80;
Bridge.Finishtimes = 0;
// console.log(Bridge.ROWS + ',' + Bridge.COLS);
// console.log(Bridge.MAZE_WIDTH + ',' + Bridge.MAZE_HEIGHT);
Bridge.PATH_WIDTH = Bridge.SQUARE_SIZE / 3;
Bridge.factorX = window.innerWidth;
Bridge.factorY = window.innerHeight;
var temp = Bridge.factorX / 2133 > Bridge.factorY/ 1084 ? Bridge.factorY/ 1084 : Bridge.factorX / 2133;

/**
 * Constants for cardinal directions.  Subsequent code assumes these are
 * in the range 0..3 and that opposites have an absolute difference of 2.
 * @enum {number}
 */
Bridge.DirectionType = {
  EAST: 0,
  NORTHEAST: 1,
  NORTH: 2,
  NORTHWEST: 3,
  WEST: 4,
  SOUTHWEST: 5,
  SOUTH: 6,
  SOUTHEAST: 7,
};

/**
 * Outcomes of running the user program.
 */
Bridge.ResultType = {
  UNSET: 0,
  SUCCESS: 1,
  FAILURE: -1,
  TIMEOUT: 2,
  ERROR: -2
};

/**
 * Result of last execution.
 */
Bridge.result = Bridge.ResultType.UNSET;

/**
 * Bridgeing direction.
 */
Bridge.bridgeDirection = Bridge.DirectionType.SOUTHEAST;

/**
 * PIDs of animation tasks currently executing.
 */
Bridge.pidList = [];

// Map each possible shape to a sprite.
// Input: Binary string representing Centre/North/West/South/East squares.
// Output: [x, y] coordinates of each tile's sprite in tiles.png.
Bridge.tile_SHAPES = {
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

Bridge.tile_SHAPES_path = {
  '10010': [4, 0],  // Dead ends
  '10001': [3, 3],
  '11000': [0, 1],
  '10100': [0, 2],
  '11010': [4, 1],  // Vertical
  '10101': [3, 2],  // Horizontal
  '10110': [0, 0],  // Elbows
  '10011': [2, 0],
  '11001': [4, 2],
  '11100': [2, 3],
  '11110': [1, 1],  // Junctions
  '10111': [1, 0],
  '11011': [2, 1],
  '11101': [1, 2],
  '11111': [2, 2],  // Cross
  'null0': [4, 3],  // Empty
  'null1': [3, 0],
  'null2': [3, 1],
  'null3': [0, 3],
  'null4': [1, 3]
};

/**
 * Create and layout all the nodes for the path, scenery, Pegman, and goal.
 */
Bridge.drawMap = function() {
  var svg = document.getElementById('svgBridge');
  var scale = Math.min(Bridge.ROWS, Bridge.COLS) * Bridge.SQUARE_SIZE;
  // svg.setAttribute('viewBox', '0 0 ' + scale + ' ' + scale);
  svg.style.width = Bridge.MAZE_WIDTH + 'px';
  svg.style.height = Bridge.MAZE_HEIGHT + 'px';
  svg.setAttribute('viewBox', '0 0 ' + Bridge.MAZE_WIDTH + ' ' + Bridge.MAZE_HEIGHT);
  // Draw the outer square.
  Blockly.utils.dom.createSvgElement('rect', {
      'height': Bridge.MAZE_HEIGHT,
      'width': Bridge.MAZE_WIDTH,
      'fill': '#F1EEE7',
      'stroke-width': 1,
      'stroke': '#CCB'
    }, svg);

  var bgwaterClip = Blockly.utils.dom.createSvgElement('clipPath', {
      'id': 'bgwaterClipPath'
    }, svg);
  Blockly.utils.dom.createSvgElement('rect', {
      'height': Bridge.MAZE_HEIGHT,
      'width': Bridge.MAZE_WIDTH,
      'x': 0,
      'y': 0
    }, bgwaterClip);

  var tile = Blockly.utils.dom.createSvgElement('image', {
      'id' : 'backgroundwater',
      'height': Bridge.MAZE_HEIGHT,
      'width': Bridge.MAZE_WIDTH * 10,
      // 'y': 0,
      // 'x':   1 * Bridge.SQUARE_SIZE  - 7 * Bridge.SQUARE_SIZE + 1,
      'clip-path': 'url(#bgwaterClipPath)'
    }, svg);
  tile.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      Bridge.SKIN.backgroundwater);
    var normalize = function(x, y) {
      if (x < 0 || x >= Bridge.COLS || y < 0 || y >= Bridge.ROWS) {
        return '0';
      }
      return (Bridge.map[y][x] == Bridge.SquareType.WALL) ? '0' : '1';
    };
  //
    // Compute and draw the tile for each square.
    var tileId = 0;
    for (var y = 0; y < Bridge.ROWS; y++) {
      for (var x = 0; x < Bridge.COLS + 1; x++) {
        Blockly.utils.dom.createSvgElement('rect', {
            'height': Bridge.SQUARE_SIZE,
            'width': Bridge.SQUARE_SIZE,
            'fill': 'none',
            'stroke-width': 1,
            'stroke': '#1E90FF',
            'stroke-dasharray' : 10,
            'x': (x - 1)  * Bridge.SQUARE_SIZE + Bridge.SQUARE_SIZE/2,
            'y': (y) * Bridge.SQUARE_SIZE
          }, svg);
      }
    }
    var bgClip = Blockly.utils.dom.createSvgElement('clipPath', {
        'id': 'bgClipPath'
      }, svg);
    Blockly.utils.dom.createSvgElement('rect', {
        'height': Bridge.MAZE_HEIGHT,
        'width': Bridge.MAZE_WIDTH,
        'x': 0,
        'y': 0
      }, bgClip);

    var tile = Blockly.utils.dom.createSvgElement('image', {
        'id' : 'background',
        'height': Bridge.MAZE_HEIGHT * 2,
        'width': Bridge.MAZE_WIDTH,
        'x': 0 ,
        'y': 1 * Bridge.SQUARE_SIZE - 6 * Bridge.PEGMAN_WIDTH + 1,
        'clip-path': 'url(#bgClipPath)'
      }, svg);
    tile.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
        Bridge.SKIN.background);
    for (var y = 0; y < Bridge.ROWS; y++) {
      for (var x = 0; x < Bridge.COLS + 1; x++) {
        Blockly.utils.dom.createSvgElement('rect', {
            'id':'ID' + x.toString()+ ',' + y.toString(),
            'height': Bridge.SQUARE_SIZE,
            'width': Bridge.SQUARE_SIZE,
            'fill': 'none',
            'stroke-width': 1,
            'stroke': '#00cc00',
            'stroke-dasharray' : 10,
            'x': (x - 1)  * Bridge.SQUARE_SIZE + Bridge.SQUARE_SIZE/2,
            'y': (y) * Bridge.SQUARE_SIZE + Bridge.SQUARE_SIZE * 0.725
          }, svg);
      }
    }
  // Add finish marker.
  var finishMarker = Blockly.utils.dom.createSvgElement('image', {
      'id': 'finish',
      'height': 180 * BlocklyGames.factor,
      'width': 180 * BlocklyGames.factor
    }, svg);
  finishMarker.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      Bridge.SKIN.marker);

  var bridgeMarker = Blockly.utils.dom.createSvgElement('image', {
      'id': 'bridge',
      'height': 180 * BlocklyGames.factor,
      'width': 180 * BlocklyGames.factor
    }, svg);
  bridgeMarker.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      Bridge.SKIN.bridgemarker);


  // Pegman's clipPath element, whose (x, y) is reset by Bridge.displayPegman
  var pegmanClip = Blockly.utils.dom.createSvgElement('clipPath', {
      'id': 'pegmanClipPath'
    }, svg);
  Blockly.utils.dom.createSvgElement('rect', {
      'id': 'clipRect',
      'height': Bridge.PEGMAN_HEIGHT,
      'width': Bridge.PEGMAN_WIDTH
    }, pegmanClip);

  // Add Pegman.
  var pegmanIcon = Blockly.utils.dom.createSvgElement('image', {
      'id': 'pegman',
      'height': Bridge.PEGMAN_HEIGHT,
      'width': Bridge.PEGMAN_WIDTH * 16, // 49 * 21 = 1029
      'clip-path': 'url(#pegmanClipPath)'
    }, svg);
  pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      Bridge.SKIN.idlesprite);
//
};
Bridge.shiftscreen = function() {
  for (var y = 0; y < Bridge.ROWS; y++) {
    for (var x = 0; x < Bridge.COLS + 1; x++) {
        document.getElementById('ID' + x.toString()+ ',' + y.toString()).style.display = 'none';
    }
  }
  // BlocklyInterface.workspace.clear();
  var background = document.getElementById('background');
  var pegmanIcon = document.getElementById('pegman');
  document.getElementById('bridge').style.display = 'none';
  var finaly = Bridge.MAZE_HEIGHT / 30;
  for(var i=1; i <= 60; i++) {
    Bridge.timeout = function(val) {
      setTimeout(function() {
        background.setAttribute('y',1 * Bridge.SQUARE_SIZE - 6 * Bridge.PEGMAN_WIDTH + 1 + (5 * val/60) * Bridge.PEGMAN_WIDTH );
         Bridge.displayPegman(Bridge.pegmanX,
             (Bridge.pegmanY + (4 * val/60)),
             Bridge.constrainDirection16(4));
       }, 100 * val);
    }
    Bridge.timeout(i);
  }
  setTimeout(function() {
    Bridge.pegmanXcheck = Bridge.pegmanX;
    Bridge.pegmanY = 4;
    Bridge.pegmanYcheck = Bridge.pegmanY;
    Bridge.pegmanD = 2;
    Bridge.pegmanDcheck = Bridge.pegmanD;
  }, 100 * 60.2);
}
Bridge.animateWaterE2W = function() {
  // document.getElementById('background').style.display = 'none';
  var tile = document.getElementById('backgroundwater');
  var value = Bridge.passvalue > 0 ? Bridge.passvalue : 0;
  var frames = 4634 * 2 / Bridge.SQUARE_SIZE;
  function update() {
    value = ++value % frames;
  }
  function draw() {
    update();
    tile.setAttribute('x',
        // 1 * Bridge.SQUARE_SIZE/2 + value * Bridge.SQUARE_SIZE/2 - 4634 - 5 * Bridge.SQUARE_SIZE);
        1 * Bridge.SQUARE_SIZE/2 - value * Bridge.SQUARE_SIZE/2 - Bridge.MAZE_WIDTH);
    tile.setAttribute('y',0);
  }
  function timercode() {
    if(!Bridge.waterstop){
      draw();
      setTimeout(timercode,150);
    }
    else {
      Bridge.passvalue = value;
    }
  }
  setTimeout(timercode, 150);
}
Bridge.animateWaterW2E = function() {
  // document.getElementById('background').style.display = 'none';
  var tile = document.getElementById('backgroundwater');
  var value = Bridge.passvalue > 0 ? Bridge.passvalue : 0;
  var frames = 4634 * 2 / Bridge.SQUARE_SIZE;
  function update() {
    value = ++value % frames;
  }
  function draw() {
    update();
    tile.setAttribute('x',
        1 * Bridge.SQUARE_SIZE/2 + value * Bridge.SQUARE_SIZE/2 - 4634 - 5 * Bridge.SQUARE_SIZE);
        // 1 * Bridge.SQUARE_SIZE/2 - value * Bridge.SQUARE_SIZE/2 - Bridge.MAZE_WIDTH);
    tile.setAttribute('y',0);
  }
  function timercode() {
    if(!Bridge.waterstop){
      draw();
      setTimeout(timercode,150);
    }
    else {
      Bridge.passvalue = value;
    }
  }
  setTimeout(timercode, 150);
}

/**
 * Initialize Blockly and the bridge.  Called on page load.
 */
Bridge.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Bridge.soy.bridge({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       skin: Bridge.SKIN_ID,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init();
  document.getElementById('dive').style.display = 'none';
  // Setup the Pegman menu.
  var pegmanImg = document.querySelector('#pegmanButton>img');
  pegmanImg.style.backgroundImage = 'url(' + Bridge.SKIN.sprite + ')';
  var pegmanMenu = document.getElementById('pegmanMenu');
  var handlerFactory = function(n) {
    return function() {
      Bridge.changePegman(n);
    };
  };
  for (var i = 0; i < Bridge.SKINS.length; i++) {
    if (i == Bridge.SKIN_ID) {
      continue;
    }
    var div = document.createElement('div');
    var img = document.createElement('img');
    img.src = 'common/1x1.gif';
    img.style.backgroundImage = 'url(' + Bridge.SKINS[i].sprite + ')';
    div.appendChild(img);
    pegmanMenu.appendChild(div);
    Blockly.bindEvent_(div, 'mousedown', null, handlerFactory(i));
  }
  Blockly.bindEvent_(window, 'resize', null, Bridge.hidePegmanMenu);
  var pegmanButton = document.getElementById('pegmanButton');
  Blockly.bindEvent_(pegmanButton, 'mousedown', null, Bridge.showPegmanMenu);
  var pegmanButtonArrow = document.getElementById('pegmanButtonArrow');
  var arrow = document.createTextNode(Blockly.FieldDropdown.ARROW_CHAR);
  pegmanButtonArrow.appendChild(arrow);

  var rtl = BlocklyGames.isRtl();
  Bridge.SQUARE_SIZE = Bridge.SQUARE_SIZE * BlocklyGames.factor;
  Bridge.MAZE_WIDTH = Bridge.SQUARE_SIZE * Bridge.COLS;
  Bridge.MAZE_HEIGHT = Bridge.SQUARE_SIZE * Bridge.ROWS;
  Bridge.PEGMAN_HEIGHT = 200 * BlocklyGames.factor;
  Bridge.PEGMAN_WIDTH = 200 * BlocklyGames.factor;

  var blocklyDiv = document.getElementById('blockly');
  var visualization = document.getElementById('visualization');
  var top = visualization.offsetTop;
  var buttontable = document.getElementById('buttontable');

  var onresize = function(e) {
    var top = visualization.offsetTop;
    blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
    blocklyDiv.style.left = rtl ? '10px' : (Bridge.MAZE_WIDTH + 20) + 'px';
    blocklyDiv.style.width = (window.innerWidth - (Bridge.MAZE_WIDTH + 40)) + 'px';
    blocklyDiv.style.paddingBottom = 10 * BlocklyGames.factor + 'px';
  buttontable.style.left = blocklyDiv.offsetLeft + 'px';
  buttontable.style.width = (window.innerWidth - (Bridge.MAZE_WIDTH + 40)) + 'px';
  buttontable.style.top = blocklyDiv.offsetTop + Bridge.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('runButton').style.left = blocklyDiv.offsetLeft + 'px';
  document.getElementById('runButton').style.top = blocklyDiv.offsetTop + Bridge.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('resetButton').style.left = document.getElementById('runButton').offsetLeft + document.getElementById('runButton').offsetWidth + 'px';
  document.getElementById('resetButton').style.top = blocklyDiv.offsetTop + Bridge.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('resetButton').style.marginRight = '0px';
  document.getElementById('resetBridgeButton').style.left = document.getElementById('resetButton').offsetLeft + document.getElementById('resetButton').offsetWidth + 'px';
  document.getElementById('resetBridgeButton').style.top = blocklyDiv.offsetTop + Bridge.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('resetBridgeButton').style.marginRight = '0px';
  // document.getElementById('resetBridgeButton').stye.display = 'none';
  };
  window.addEventListener('scroll', function() {
    onresize(null);
    Blockly.svgResize(BlocklyInterface.workspace);
    buttontable.style.left = blocklyDiv.offsetLeft + 'px';
    buttontable.style.width = (window.innerWidth - (Bridge.MAZE_WIDTH + 40)) + 'px';
    buttontable.style.top = blocklyDiv.offsetTop + Bridge.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('runButton').style.left = blocklyDiv.offsetLeft + 'px';
    document.getElementById('runButton').style.top = blocklyDiv.offsetTop + Bridge.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('resetButton').style.left = document.getElementById('runButton').offsetLeft + document.getElementById('runButton').offsetWidth + 'px';
    document.getElementById('resetButton').style.top = blocklyDiv.offsetTop + Bridge.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('resetButton').style.marginRight = '0px';
    document.getElementById('resetBridgeButton').style.left = document.getElementById('resetButton').offsetLeft + document.getElementById('resetButton').offsetWidth + 'px';
    document.getElementById('resetBridgeButton').style.top = blocklyDiv.offsetTop + Bridge.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('resetBridgeButton').style.marginRight = '0px';
    document.getElementById('resetBridgeButton').stye.display = 'none';
  });
  window.addEventListener('resize', onresize);
  onresize(null);
  Bridge.SQUARE_SIZE = Bridge.SQUARE_SIZE / BlocklyGames.factor;
  Bridge.MAZE_WIDTH = Bridge.SQUARE_SIZE / Bridge.COLS;
  Bridge.MAZE_HEIGHT = Bridge.SQUARE_SIZE / Bridge.ROWS;
  Bridge.PEGMAN_HEIGHT = 200 / BlocklyGames.factor;
  Bridge.PEGMAN_WIDTH = 200 / BlocklyGames.factor;

  Bridge.SQUARE_SIZE = Bridge.SQUARE_SIZE * BlocklyGames.factor;
  Bridge.MAZE_WIDTH = Bridge.SQUARE_SIZE * Bridge.COLS;
  Bridge.MAZE_HEIGHT = Bridge.SQUARE_SIZE * Bridge.ROWS;
  Bridge.PEGMAN_HEIGHT = 200 * BlocklyGames.factor;
  Bridge.PEGMAN_WIDTH = 200 * BlocklyGames.factor;
  Bridge.PATH_WIDTH = Bridge.SQUARE_SIZE / 3;
  var mloader = document.getElementById('miniloader');
  mloader.style.height = Bridge.MAZE_HEIGHT + 'px';
  mloader.style.width = Bridge.MAZE_WIDTH + 'px';
  mloader.style.left = visualization.offsetLeft + 'px';
  mloader.style.top = visualization.offsetTop + 'px';
  // Scale the workspace so level 1 = 1.3, and level 10 = 1.0.
  // var scale = 1 + (1 - (BlocklyGames.LEVEL / BlocklyGames.MAX_LEVEL)) / 3;
  var scale = 1;
  BlocklyInterface.injectBlockly(
      {'maxBlocks': Bridge.MAX_BLOCKS,
       'rtl': rtl,
       'trashcan': true,
       'zoom': {'bridgeScale': scale}});
  BlocklyInterface.workspace.getAudioManager().load(Bridge.SKIN.winSound, 'win');
  BlocklyInterface.workspace.getAudioManager().load(Bridge.SKIN.crashSound, 'fail');
  // Not really needed, there are no user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('moveForward,moveBackward,' +
      'turnRight,turnLeft,isPathForward,isPathRight,isPathBackward,isPathLeft');

      var svg = document.getElementById('svgBridge');
      svg.style.width = Bridge.MAZE_WIDTH + 'px';
      svg.style.height = Bridge.MAZE_HEIGHT + 'px';
  Bridge.flowdire = -1;
  Bridge.passvalue = 0;
  Bridge.waterstop = false;
  Bridge.drawMap();
  // document.getElementById('background').style.display = 'none';
  Bridge.animateWaterE2W();
  var pegmanIcon = document.getElementById('pegman');
  pegmanIcon.style.display = "none";
  var runButton1 = document.getElementById('runButton');
  var resetButton1 = document.getElementById('resetButton');
  var resetBridgeButton1 = document.getElementById('resetBridgeButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton1.style.minWidth) {
    resetButton1.style.minWidth = runButton1.offsetWidth + 'px';
    resetBridgeButton1.style.minWidth = runButton1.offsetWidth + 'px';
  }

  // BlocklyInterface.loadBlocks(defaultXml, false);

  // Locate the bridge and finish squares.
  for (var y = 0; y < Bridge.ROWS; y++) {
    for (var x = 0; x < Bridge.COLS; x++) {
      if (Bridge.map[y][x] == Bridge.SquareType.START) {
        Bridge.bridge_ = {x: x, y: y};
        Bridge.bridge1_ = {x: x, y: y};
      } else if (Bridge.map[y][x] == Bridge.SquareType.FINISH) {
        Bridge.finish_ = {x: x, y: y};
      }
    }
  }
  // Bridge.boyenteringcircus();
  // Bridge.coindisplay();
  // alert(Bridge.finish_.x);
  // alert(Bridge.finish_.y);
  // Bridge.levelHelp()
  Bridge.reset(true);
  BlocklyInterface.workspace.addChangeListener(function() {Bridge.updateCapacity();});

  document.body.addEventListener('mousemove', Bridge.updatePegSpin_, true);

  BlocklyGames.bindClick('runButton', Bridge.runButtonClick);
  BlocklyGames.bindClick('resetButton', Bridge.resetButtonClick);
  BlocklyGames.bindClick('resetBridgeButton', Bridge.resetBridgeButtonClick);
  if (BlocklyGames.LEVEL == 10) {
    if (!BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
                                          BlocklyGames.LEVEL)) {
      // Level 10 gets an introductory modal dialog.
      // Skip the dialog if the user has already won.
      var content = document.getElementById('dialogHelpWallFollow');
      var style = {
        'width': '30%',
        'left': '35%',
        'top': '12em'
      };
      BlocklyDialogs.showDialog(content, null, false, true, style,
          BlocklyDialogs.stopDialogKeyDown);
      BlocklyDialogs.bridgeDialogKeyDown();
      setTimeout(BlocklyDialogs.abortOffer, 5 * 60 * 1000);
    }
  } else {
    // All other levels get interactive help.  But wait 5 seconds for the
    // user to think a bit before they are told what to do.
  }

  // Add the spinning Pegman icon to the done dialog.
  // <img id="pegSpin" src="common/1x1.gif">
  // var buttonDiv = document.getElementById('dialogDoneButtons');
  // var pegSpin = document.createElement('img');
  // pegSpin.id = 'pegSpin';
  // pegSpin.src = 'common/1x1.gif';
  // pegSpin.style.backgroundImage = 'url(' + Bridge.SKIN.sprite + ')';
  // buttonDiv.parentNode.insertBefore(pegSpin, buttonDiv);

  // Lazy-load the JavaScript interpreter.
  BlocklyInterface.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyInterface.importPrettify();
  BlocklyGames.bindClick('helpButton', Bridge.showHelp);

};
Bridge.diveanimation = function() {
  var sheetWidth = 7380;
  var sheetHeight = 1230;
  var frame = 18;
  var currentframe = 0;
  var width = sheetWidth / frame;
  var srcX;
  var srcY;
  var x = 0;
  var y = 0;
  var topval = (Bridge.pegmanY+1) * Bridge.SQUARE_SIZE - Bridge.SQUARE_SIZE;
  document.getElementById('pegman').style.display = 'none';
  var dive = document.getElementById('dive');
  dive.style.display = 'initial';
  dive.style.top =  (Bridge.pegmanY+1) * Bridge.SQUARE_SIZE - Bridge.SQUARE_SIZE +'px';
  dive.style.left =  document.getElementById('visualization').offsetLeft + Bridge.pegmanX * Bridge.SQUARE_SIZE + 'px';
  document.getElementById('finishanimation').style.width = Bridge.PEGMAN_WIDTH * 3/4 + 'px';
  document.getElementById('finishanimation').style.height = Bridge.PEGMAN_HEIGHT * 2.5 + 'px';
  var ctx = document.getElementById('finishanimation').getContext('2d');
  var img = new Image();
  img.src = 'bridge/Dive.png';
  function update() {
    srcY = 0;
    currentframe = ++currentframe % frame;
    srcX = currentframe * width;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  function draw() {
    update();
    topval += Bridge.SQUARE_SIZE/36;
    dive.style.top = topval + 'px';
    ctx.drawImage(img, srcX, srcY, width, sheetHeight, ctx.canvas.width/12, ctx.canvas.height/20, ctx.canvas.width*3/4, ctx.canvas.height*3/4);
  }
  for(var i=1; i <= 18; i++) {
    Bridge.timeout = function(val) {
      setTimeout(function() {
        draw();
      }, 120 * val);
    }
    Bridge.timeout(i);
  }
  setTimeout(function() {
    document.getElementById('dive').style.display = 'none';
  }, 120 * 18.01);
  Bridge.timevalue = 120 * 18.01 / Bridge.stepSpeed;
}
Bridge.swimanimation = function(angle) {
  var sheetWidth = 5330;
  var sheetHeight = 306;
  var frame = 13;
  var currentframe = 0;
  var width = sheetWidth / frame;
  var srcX;
  var srcY;
  var x = 0;
  var y = 0;
  var characterspeed = 2;
  var characterspeedX = characterspeed * Math.sin(-angle * Math.PI / 180);
  var characterspeedY = characterspeed * Math.cos(angle * Math.PI / 180);
  var riverspeed = Bridge.flowdire * Math.sqrt(2);
  document.getElementById('pegman').style.display = 'none';
  var topval = Bridge.pegmanY * Bridge.SQUARE_SIZE + Bridge.SQUARE_SIZE/2;
  var leftval = Bridge.pegmanX * Bridge.SQUARE_SIZE;
  var dive = document.getElementById('dive');
  dive.style.display = 'initial';
  dive.style.top =  topval +'px';
  dive.style.left =  document.getElementById('visualization').offsetLeft + leftval + 'px';
  document.getElementById('finishanimation').style.width = Bridge.PEGMAN_WIDTH + 'px';
  document.getElementById('finishanimation').style.height = Bridge.PEGMAN_HEIGHT + 'px';
  var ctx = document.getElementById('finishanimation').getContext('2d');
  var img = new Image();
  img.src = 'bridge/swim-sprite1.png';
  dive.style.transformOrigin = "50% 50%";
  dive.style.transform = "rotate(" + (angle) + "deg)";
  function update() {
    currentframe = ++currentframe % frame;
    srcX = currentframe * width;
    srcY =(frame -currentframe)*11;
    topval -=characterspeedY;
    leftval += (-characterspeedX + riverspeed);
    dive.style.left =  document.getElementById('visualization').offsetLeft + leftval + 'px';
    dive.style.top =  topval +'px';
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  function draw() {
    update();
    ctx.drawImage(img, srcX, srcY, width, sheetHeight, 0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  function timercode () {
    if(topval >= 1 * Bridge.SQUARE_SIZE){
      draw();
      setTimeout(timercode, 120);
    }
    else {
      setTimeout(function(){
        dive.style.display = 'none';
        document.getElementById('pegman').style.display = 'initial';
      }, 50);
      setTimeout(function(){
        if((-characterspeedX + riverspeed) >= 0)
          Bridge.pegmanX += Math.floor(Math.abs((-characterspeedX + riverspeed))* 3  / characterspeedY);
        else
        {
          Bridge.pegmanX -= Math.floor(Math.abs((-characterspeedX + riverspeed))* 3  / characterspeedY);
        }
        Bridge.pegmanXcheck = Bridge.pegmanX;
        Bridge.pegmanY = 0;
        Bridge.pegmanYcheck = 0;
        Bridge.pegmanD = 2;
        Bridge.pegmanDcheck = Bridge.pegmanD;
        Bridge.schedule([Bridge.pegmanX, 0.5, 4], [Bridge.pegmanX, 0, 4], 0);
      }, 100);
      setTimeout(function(){
        document.getElementById('pegman').style.display = 'initial';
      }, 105);
      if(Bridge.timesbridge == 1) {
        Bridge.timesbridge ++;
        var svg = document.getElementById('svgBridge');
          Blockly.utils.dom.createSvgElement('rect', {
              'id': 'RectID1',
              'height': Bridge.SQUARE_SIZE/20,
              'width': Bridge.SQUARE_SIZE/20,
              'x': 3 * Bridge.SQUARE_SIZE + Bridge.SQUARE_SIZE/2 -1,
              'y': 4 * Bridge.SQUARE_SIZE - 1
            }, svg);
          Blockly.utils.dom.createSvgElement('rect', {
              'id': 'RectID2',
              'height': Bridge.SQUARE_SIZE/20,
              'width': Bridge.SQUARE_SIZE/20,
              'x': 3 * Bridge.SQUARE_SIZE + Bridge.SQUARE_SIZE/2 -1,
              'y': 1 * Bridge.SQUARE_SIZE + Bridge.SQUARE_SIZE/8
            }, svg);
          Blockly.utils.dom.createSvgElement('rect', {
              'id': 'RectID3',
              'height': Bridge.SQUARE_SIZE/20,
              'width': Bridge.SQUARE_SIZE/20,
              'x': 1 * Bridge.SQUARE_SIZE + Bridge.SQUARE_SIZE/2 -1,
              'y': 1 * Bridge.SQUARE_SIZE + Bridge.SQUARE_SIZE/8
            }, svg);

        setTimeout(function(){
          Bridge.areaanswer = (3 / 2 ) * Math.floor(Math.abs((-characterspeedX + riverspeed))* 3  / characterspeedY);
          Bridge.questionsquiz();
          document.getElementById('resetBridgeButton').style.display = 'initial';
        }, 150);
      }
      else if(Bridge.timesbridge != 1 && angle * Bridge.flowdire == -45)
        Bridge.questionsquiz();
        document.getElementById('resetBridgeButton').style.display = 'initial';
    }
  }
  setTimeout(timercode,150);
}
/**
 * When the workspace changes, update the help as needed.
 * @param {Blockly.Events.Abstract=} opt_event Custom data for event.
 */
Bridge.levelHelp = function(opt_event) {
  if (opt_event && opt_event.type == Blockly.Events.UI) {
    // Just a change to highlighting or somesuch.
    return;
  } else if (BlocklyInterface.workspace.isDragging()) {
    // Don't change helps during drags.
    return;
  } else if (Bridge.result == Bridge.ResultType.SUCCESS ||
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
  //   if (BlocklyInterface.workspace.getAllBlocks().length < 2) {
  //     content = document.getElementById('dialogHelpStack');
  //     style = {'width': '370px', 'top': '130px'};
  //     style[rtl ? 'right' : 'left'] = '215px';
  //     origin = toolbar[0].getSvgRoot();
  //   }
    // else {
    //   var topBlocks = BlocklyInterface.workspace.getTopBlocks(true);
    //   if (topBlocks.length > 1) {
    //     var xml = [
    //         '<xml>',
    //           '<block type="bridge_moveForward" x="10" y="10">',
    //             '<next>',
    //               '<block type="bridge_moveForward"></block>',
    //             '</next>',
    //           '</block>',
    //         '</xml>'];
    //     BlocklyInterface.injectReadonly('sampleOneTopBlock', xml);
    //     content = document.getElementById('dialogHelpOneTopBlock');
    //     style = {'width': '360px', 'top': '120px'};
    //     style[rtl ? 'right' : 'left'] = '225px';
    //     origin = topBlocks[0].getSvgRoot();
    //   } else if (Bridge.result == Bridge.ResultType.UNSET) {
    //     // Show run help dialog.
    //     content = document.getElementById('dialogHelpRun');
    //     style = {'width': '360px', 'top': '410px'};
    //     style[rtl ? 'right' : 'left'] = '400px';
    //     origin = document.getElementById('runButton');
    //   }
    // }
  } else if (BlocklyGames.LEVEL == 2) {
    if (Bridge.result != Bridge.ResultType.UNSET &&
        document.getElementById('runButton').style.display == 'none') {
      content = document.getElementById('dialogHelpReset');
      style = {'width': '360px', 'top': '410px'};
      style[rtl ? 'right' : 'left'] = '400px';
      origin = document.getElementById('resetButton');
    }
  } else if (BlocklyGames.LEVEL == 3) {
    if (userBlocks.indexOf('bridge_forever') == -1) {
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
        (userBlocks.indexOf('bridge_forever') == -1 ||
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
        if (block.type != 'bridge_forever') {
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
    if (Bridge.SKIN_ID == 0 && !Bridge.showPegmanMenu.activatedOnce) {
      content = document.getElementById('dialogHelpSkins');
      style = {'width': '360px', 'top': '60px'};
      style[rtl ? 'left' : 'right'] = '20px';
      origin = document.getElementById('pegmanButton');
    }
  } else if (BlocklyGames.LEVEL == 6) {
    if (userBlocks.indexOf('bridge_if') == -1) {
      content = document.getElementById('dialogHelpIf');
      style = {'width': '360px', 'top': '430px'};
      style[rtl ? 'right' : 'left'] = '425px';
      origin = toolbar[4].getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL == 7) {
    if (!Bridge.levelHelp.initialized7_) {
      // Create fake dropdown.
      var span = document.createElement('span');
      span.className = 'helpMenuFake';
      var options =
          [BlocklyGames.getMsg('Bridge_pathAhead'),
           BlocklyGames.getMsg('Bridge_pathLeft'),
           BlocklyGames.getMsg('Bridge_pathRight')];
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
      Bridge.levelHelp.initialized7_ = true;
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
    if (userBlocks.indexOf('bridge_ifElse') == -1) {
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
Bridge.changePegman = function(newSkin) {
  BlocklyInterface.saveToSessionStorage();
  location = location.protocol + '//' + location.host + location.pathname +
      '?lang=' + BlocklyGames.LANG + '&level=' + BlocklyGames.LEVEL +
      '&skin=' + newSkin;
};

/**
 * Display the Pegman skin-change menu.
 * @param {!Event} e Mouse, touch, or resize event.
 */
Bridge.showPegmanMenu = function(e) {
  var menu = document.getElementById('pegmanMenu');
  if (menu.style.display == 'block') {
    // Menu is already open.  Close it.
    Bridge.hidePegmanMenu(e);
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
  Bridge.pegmanMenuMouse_ =
      Blockly.bindEvent_(document.body, 'mousedown', null, Bridge.hidePegmanMenu);
  // Close the skin-changing hint if open.
  var hint = document.getElementById('dialogHelpSkins');
  if (hint && hint.className != 'dialogHiddenContent') {
    BlocklyDialogs.hideDialog(false);
  }
  Bridge.showPegmanMenu.activatedOnce = true;
};

/**
 * Hide the Pegman skin-change menu.
 * @param {!Event} e Mouse, touch, or resize event.
 */
Bridge.hidePegmanMenu = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  document.getElementById('pegmanMenu').style.display = 'none';
  document.getElementById('pegmanButton').classList.remove('buttonHover');
  if (Bridge.pegmanMenuMouse_) {
    Blockly.unbindEvent_(Bridge.pegmanMenuMouse_);
    delete Bridge.pegmanMenuMouse_;
  }
};

/**
 * Reset the bridge to the bridge position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Bridge.reset = function(first) {
  // Kill all tasks.
  for (var i = 0; i < Bridge.pidList.length; i++) {
    clearTimeout(Bridge.pidList[i]);
  }
  document.getElementById('pegman').style.display = 'none';
  // document.getElementById('runButton').style.display = 'none';
  // document.getElementById('resetButton').style.display = 'none';
  Bridge.pidList = [];
  Bridge.prevlog.clear();
  // Move Pegman into position.
  Bridge.drawclone = true;
  Bridge.pegmanX = Bridge.bridge1_.x;
  Bridge.pegmanY = Bridge.bridge1_.y;
  Bridge.pegmanXcheck = Bridge.pegmanX;
  Bridge.pegmanYcheck = Bridge.pegmanY;
  Bridge.pathdire = 4;
  Bridge.pathlength = 0;
  Bridge.Finishtimes = 0;
  Bridge.timevalue = 0;
  Bridge.shiftdone = false;
  Bridge.timesbridge = 1;
  Bridge.flowdire = -1;
  Bridge.passvalue = 0;
  Bridge.waterstop = false;
  document.getElementById('background').setAttribute('y',1*Bridge.SQUARE_SIZE - 6 * Bridge.PEGMAN_WIDTH + 1);
  document.getElementById('dive').style.display = 'none';
  document.getElementById('bridge').style.display = 'initial';
  document.getElementById('resetBridgeButton').style.display = 'none';
  Bridge.question = 1;
  if (first) {
    // Opening animation.
    Bridge.pegmanD = Bridge.bridgeDirection;
    Bridge.scheduleFinish(false);
    Bridge.pidList.push(setTimeout(function() {
      Bridge.stepSpeed = 120;

      Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                    [Bridge.pegmanX + 1, Bridge.pegmanY + 1, Bridge.pegmanD * 2], 0);
      Bridge.pegmanD = Bridge.bridgeDirection;
      Bridge.pegmanDcheck = Bridge.pegmanD;
      Bridge.pegmanX = Bridge.pegmanX + 1;
      Bridge.pegmanY = Bridge.pegmanY + 1;
      Bridge.pegmanXcheck = Bridge.pegmanX;
      Bridge.pegmanYcheck = Bridge.pegmanY;
        // Bridge.diveanimation();
    }, Bridge.stepSpeed * 5));
  } else {
    // BlocklyGames.coinval = BlocklyGames.coinval - Bridge.coinscollected * 30;
    BlocklyGames.updatecoinvalue();
    Bridge.pegmanD = Bridge.bridgeDirection;
    Bridge.pegmanDcheck = Bridge.pegmanD;
    Bridge.pidList.push(setTimeout(function() {
      Bridge.stepSpeed = 130;
      Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                    [Bridge.pegmanX + 1, Bridge.pegmanY + 1, Bridge.pegmanD * 2], 0);
      Bridge.pegmanD = Bridge.bridgeDirection;
      Bridge.pegmanDcheck = Bridge.pegmanD;
      Bridge.pegmanX = Bridge.pegmanX + 1;
      Bridge.pegmanY = Bridge.pegmanY + 1;
      Bridge.pegmanXcheck = Bridge.pegmanX;
      Bridge.pegmanYcheck = Bridge.pegmanY;
    }, Bridge.stepSpeed * 5));
  }

  // Move the finish icon into position.
  var finishIcon = document.getElementById('finish');
  finishIcon.style.display = 'none';
  finishIcon.setAttribute('x', Bridge.SQUARE_SIZE * (Bridge.finish_.x + 0.5) -
      finishIcon.getAttribute('width') / 2);
  finishIcon.setAttribute('y', Bridge.SQUARE_SIZE * (Bridge.finish_.y + 0.6) -
      finishIcon.getAttribute('height'));

  var bridgeIcon = document.getElementById('bridge');
  bridgeIcon.setAttribute('x', Bridge.SQUARE_SIZE * (Bridge.bridge_.x + 0.5) -
      bridgeIcon.getAttribute('width') / 2);
  bridgeIcon.setAttribute('y', Bridge.SQUARE_SIZE * (Bridge.bridge_.y + 0.6) -
      bridgeIcon.getAttribute('height') / 2);
  // var bg = document.getElementById('background');
  // bg.setAttribute('x', Bridge.SQUARE_SIZE * (0) -
  //     bg.getAttribute('width') / 2);
  // bg.setAttribute('y', Bridge.SQUARE_SIZE * (0) -
  //     bg.getAttribute('height') / 2);

  // Make 'look' icon invisible and promote to top.
  var lookIcon = document.getElementById('look');
  lookIcon.style.display = 'none';
  lookIcon.parentNode.appendChild(lookIcon);
  // var paths = lookIcon.getElementsByTagName('path');
  // for (var i = 0, path; (path = paths[i]); i++) {
  //   path.setAttribute('stroke', Bridge.SKIN.look);
  // }
};

/**
 * Click the run button.  Bridge the program.
 * @param {!Event} e Mouse or touch event.
 */
Bridge.runButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  // document.getElementById('runButton').style.display = 'none';
  // document.getElementById('resetButton').style.display = 'none';
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  BlocklyDialogs.hideDialog(false);
  // Only allow a single top block on level 1.
  // if (BlocklyGames.LEVEL == 1 &&
  //     BlocklyInterface.workspace.getTopBlocks(false).length > 1 &&
  //     Bridge.result != Bridge.ResultType.SUCCESS &&
  //     !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
  //                                        BlocklyGames.LEVEL)) {
  //   // Bridge.levelHelp();
  //   return;
  // }
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  var resetBridgeButton = document.getElementById('resetBridgeButton');

  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
    resetBridgeButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  // runButton.style.display = 'none';
  // resetButton.style.display = 'inline';
  // Bridge.reset(false);
  Bridge.execute();
};
Bridge.resetBridge = function() {
  // Kill all tasks.
  for (var i = 0; i < Bridge.pidList.length; i++) {
    clearTimeout(Bridge.pidList[i]);
  }
  document.getElementById('RectID1').style.display = 'none';
  document.getElementById('RectID2').style.display = 'none';
  document.getElementById('RectID3').style.display = 'none';
  document.getElementById('pegman').style.display = 'initial';
  Bridge.pidList = [];
  Bridge.drawclone = true;
  Bridge.pegmanX = Bridge.finish_.x;
  Bridge.pegmanY = 4;
  Bridge.pegmanXcheck = Bridge.pegmanX;
  Bridge.pegmanYcheck = Bridge.pegmanY;
  Bridge.pathdire = 4;
  Bridge.pathlength = 0;
  Bridge.timevalue = 0;
  Bridge.shiftdone = true;
  Bridge.flowdire = -1;
  Bridge.waterstop = true;
  document.getElementById('dive').style.display = 'none';
  document.getElementById('dive').style.transform = "rotate(0deg)";

    BlocklyGames.updatecoinvalue();
    Bridge.pegmanD = 2;
    Bridge.pegmanDcheck = Bridge.pegmanD;
    Bridge.pidList.push(setTimeout(function() {
      Bridge.stepSpeed = 130;
      Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                    [Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2], 0);
      Bridge.pegmanD = Bridge.bridgeDirection;
      Bridge.pegmanDcheck = Bridge.pegmanD;
    }, Bridge.stepSpeed * 5));
};

/**
 * Click the run button.  Bridge the program.
 * @param {!Event} e Mouse or touch event.
 */
Bridge.runButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  // document.getElementById('runButton').style.display = 'none';
  // document.getElementById('resetButton').style.display = 'none';
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  BlocklyDialogs.hideDialog(false);
  // Only allow a single top block on level 1.
  // if (BlocklyGames.LEVEL == 1 &&
  //     BlocklyInterface.workspace.getTopBlocks(false).length > 1 &&
  //     Bridge.result != Bridge.ResultType.SUCCESS &&
  //     !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
  //                                        BlocklyGames.LEVEL)) {
  //   // Bridge.levelHelp();
  //   return;
  // }
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  var resetBridgeButton = document.getElementById('resetBridgeButton');

  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
    resetBridgeButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  if(Bridge.waterstop == true){
    if(Math.floor(Math.random() * 10) % 2 == 0){
      Bridge.flowdire = -1;
      Bridge.waterstop = false;
      Bridge.animateWaterE2W();
    }
    else {
      Bridge.flowdire = 1;
      Bridge.waterstop = false;
      Bridge.animateWaterW2E();
    }
  }
  // runButton.style.display = 'none';
  // resetButton.style.display = 'inline';
  // Bridge.reset(false);
  Bridge.execute();
};

/**
 * Updates the document's 'capacity' element with a message
 * indicating how many more blocks are permitted.  The capacity
 * is retrieved from BlocklyInterface.workspace.remainingCapacity().
 */
Bridge.updateCapacity = function() {
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
      var msg = BlocklyGames.getMsg('Bridge_capacity0');
    } else if (cap == 1) {
      var msg = BlocklyGames.getMsg('Bridge_capacity1');
    } else {
      var msg = BlocklyGames.getMsg('Bridge_capacity2');
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
 * Click the reset button.  Reset the bridge.
 * @param {!Event} e Mouse or touch event.
 */
Bridge.resetButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  // document.getElementById('runButton').style.display = 'none';
  // document.getElementById('resetButton').style.display = 'none';
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  //var runButton = document.getElementById('runButton');
  //runButton.style.display = 'inline';
  //document.getElementById('resetButton').style.display = 'none';
  BlocklyInterface.workspace.highlightBlock(null);
  Bridge.reset(false);
};

Bridge.resetBridgeButtonClick = function(e) {
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  //var runButton = document.getElementById('runButton');
  //runButton.style.display = 'inline';
  document.getElementById('miniloader').style.display = 'initial';
  window.miniloader();
  BlocklyInterface.workspace.highlightBlock(null);
  Bridge.resetBridge();
}
/**
 * Inject the Bridge API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS-Interpreter.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Bridge.initInterpreter = function(interpreter, globalObject) {
  // API
  var wrapper;
  wrapper = function(id) {
    Bridge.move(0, id);
  };
  interpreter.setProperty(globalObject, 'moveForward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Bridge.move(2, id);
  };
  interpreter.setProperty(globalObject, 'moveBackward',
      interpreter.createNativeFunction(wrapper));


  wrapper = function(id) {
    Bridge.turn(0, id);
  };
  interpreter.setProperty(globalObject, 'turnNorth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Bridge.turn(1, id);
  };
  interpreter.setProperty(globalObject, 'turnNorthEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Bridge.turn(2, id);
  };
  interpreter.setProperty(globalObject, 'turnEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Bridge.turn(3, id);
  };
  interpreter.setProperty(globalObject, 'turnSouthEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Bridge.turn(4, id);
  };
  interpreter.setProperty(globalObject, 'turnSouth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Bridge.turn(5, id);
  };
  interpreter.setProperty(globalObject, 'turnSouthWest',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Bridge.turn(6, id);
  };
  interpreter.setProperty(globalObject, 'turnWest',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Bridge.turn(7, id);
  };
  interpreter.setProperty(globalObject, 'turnNorthWest',
      interpreter.createNativeFunction(wrapper));


  wrapper = function(id) {
    return Bridge.isPath(0, id);
  };
  interpreter.setProperty(globalObject, 'isPathForward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Bridge.isPath(1, id);
  };
  interpreter.setProperty(globalObject, 'isPathNorth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Bridge.isPath(2, id);
  };
  interpreter.setProperty(globalObject, 'isPathBackward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Bridge.isPath(3, id);
  };
  interpreter.setProperty(globalObject, 'isPathEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Bridge.isPath(4, id);
  };
  interpreter.setProperty(globalObject, 'isPathSouth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
        return Bridge.isPath(5, id);
      };
  interpreter.setProperty(globalObject, 'isPathWest',
          interpreter.createNativeFunction(wrapper));
    wrapper = function(id) {
      return Bridge.dive(id);
    };
    interpreter.setProperty(globalObject, 'dive',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(degree, id) {
      return Bridge.swim(degree, id);
    };
    interpreter.setProperty(globalObject, 'swim',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(id) {
      return Bridge.Riverdirection(1,id);
    };
    interpreter.setProperty(globalObject, 'isRiverDirectionEasttoWest',
        interpreter.createNativeFunction(wrapper));
    wrapper = function(id) {
      return Bridge.Riverdirection(2,id);
    };
    interpreter.setProperty(globalObject, 'isRiverDirectionWesttoEast',
        interpreter.createNativeFunction(wrapper));

  // wrapper = function(times) {
  //   return Bridge.notDone();
  // };
  // interpreter.setProperty(globalObject, 'repeat',
  //     interpreter.createNativeFunction(wrapper));
};

/**
 * Execute the user's code.  Heaven help us...
 */
Bridge.execute = function() {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Bridge.execute, 250);
    return;
  }

  Bridge.log = [];
  Blockly.selected && Blockly.selected.unselect();
  var code = BlocklyInterface.getJsCode();
  BlocklyInterface.executedJsCode = code;
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
  Bridge.result = Bridge.ResultType.UNSET;
  var interpreter = new Interpreter(code, Bridge.initInterpreter);

  // Try running the user's code.  There are four possible outcomes:
  // 1. If pegman reaches the finish [SUCCESS], true is thrown.
  // 2. If the program is terminated due to running too long [TIMEOUT],
  //    false is thrown.
  // 3. If another error occurs [ERROR], that error is thrown.
  // 4. If the program ended normally but without solving the bridge [FAILURE],
  //    no error or exception is thrown.
  try {
    var ticks = 10000;  // 10k ticks runs Pegman for about 8 minutes.
    while (interpreter.step()) {
      if (ticks-- == 0) {
        throw Infinity;
      }
    }
    Bridge.result = Bridge.notDone() ?
        Bridge.ResultType.FAILURE : Bridge.ResultType.SUCCESS;
  } catch (e) {
    // A boolean is thrown for normal termination.
    // Abnormal termination is a user error.
    if (e === Infinity) {
      Bridge.result = Bridge.ResultType.TIMEOUT;
    } else if (e === false) {
      Bridge.result = Bridge.ResultType.ERROR;
    } else {
      // Syntax error, can't happen.
      Bridge.result = Bridge.ResultType.ERROR;
      alert(e);
    }
  }

  // Fast animation if execution is successful.  Slow otherwise.
  if (Bridge.result == Bridge.ResultType.SUCCESS) {
    Bridge.stepSpeed = 100;
    Bridge.log.push(['finish', null]);
  } else {
    Bridge.stepSpeed = 130;
  }
  // Bridge.log now contains a transcript of all the user's actions.
  // Reset the bridge and animate the transcript.
  // Bridge.reset(false);
  Bridge.pidList.push(setTimeout(Bridge.animate, 100));
};
/**
 * Iterate through the recorded path and animate pegman's actions.
 */
Bridge.prevlog = new Set();
Bridge.animate = function() {
  var action = Bridge.log.shift();
  if (!action) {
    BlocklyInterface.highlight(null);
    // Bridge.levelHelp();
    return;
  }
  // alert(action);
  if(!Bridge.prevlog.has(action[1])) {
    BlocklyInterface.highlight(action[1]);
    // console.log(action[0]+',' +action[1]);
    switch (action[0]) {
      case 'north':
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                      [Bridge.pegmanX, Bridge.pegmanY - 1, Bridge.pegmanD * 2], 0);
        Bridge.pegmanY--;
        break;
      case 'northeast':
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                      [Bridge.pegmanX + 1, Bridge.pegmanY - 1, Bridge.pegmanD * 2], 0);
        Bridge.pegmanX++;
        Bridge.pegmanY--;
        break;
      case 'east':
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                      [Bridge.pegmanX + 1, Bridge.pegmanY, Bridge.pegmanD * 2], 0);
        Bridge.pegmanX++;
        break;
      case 'southeast':
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                      [Bridge.pegmanX + 1, Bridge.pegmanY + 1, Bridge.pegmanD * 2], 0);
        Bridge.pegmanX++;
        Bridge.pegmanY++;
        break;
      case 'south':
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                      [Bridge.pegmanX, Bridge.pegmanY + 1, Bridge.pegmanD * 2], 0);
        Bridge.pegmanY++;
        break;
      case 'southwest':
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                      [Bridge.pegmanX - 1, Bridge.pegmanY + 1, Bridge.pegmanD * 2], 0);
        Bridge.pegmanX--;
        Bridge.pegmanY++;
        break;
      case 'west':
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                      [Bridge.pegmanX - 1, Bridge.pegmanY, Bridge.pegmanD * 2], 0);
        Bridge.pegmanX--;
        break;
      case 'northwest':
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                      [Bridge.pegmanX - 1, Bridge.pegmanY - 1, Bridge.pegmanD * 2], 0);
        Bridge.pegmanX--;
        Bridge.pegmanY--;
        break;

      case 'look_north':
        Bridge.scheduleLook(Bridge.DirectionType.NORTH);
        break;
      case 'look_northeast':
        Bridge.scheduleLook(Bridge.DirectionType.NORTHEAST);
        break;
      case 'look_east':
        Bridge.scheduleLook(Bridge.DirectionType.EAST);
        break;
      case 'look_southeast':
        Bridge.scheduleLook(Bridge.DirectionType.SOUTHEAST);
        break;
      case 'look_south':
        Bridge.scheduleLook(Bridge.DirectionType.SOUTH);
        break;
      case 'look_southwest':
        Bridge.scheduleLook(Bridge.DirectionType.SOUTHWEST);
        break;
      case 'look_west':
        Bridge.scheduleLook(Bridge.DirectionType.WEST);
        break;
      case 'look_northwest':
        Bridge.scheduleLook(Bridge.DirectionType.NORTHWEST);
        break;

      case 'fail_forward':
        BlocklyGames.coinval -=10;
        Bridge.scheduleFail(true);
        break;
      case 'fail_backward':
        BlocklyGames.coinval -=10;
        Bridge.scheduleFail(false);
        break;
      case 'North':
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                      [Bridge.pegmanX, Bridge.pegmanY, 2 * 2 ], 0);
        Bridge.pegmanD = Bridge.constrainDirection4(Bridge.pegmanD = 2);
        break;
      case 'NorthEast':
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                      [Bridge.pegmanX, Bridge.pegmanY, 1 * 2], 0);
        Bridge.pegmanD = Bridge.constrainDirection4(Bridge.pegmanD = 1);
        break;
      case 'East':
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                      [Bridge.pegmanX, Bridge.pegmanY, 0 * 2 ], 0);
        Bridge.pegmanD = Bridge.constrainDirection4(Bridge.pegmanD = 0);
        break;
      case 'SouthEast':
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                      [Bridge.pegmanX, Bridge.pegmanY, 7 * 2], 0);
        Bridge.pegmanD = Bridge.constrainDirection4(Bridge.pegmanD = 7);
        break;
      case 'South':
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                      [Bridge.pegmanX, Bridge.pegmanY, 6 * 2], 0);
        Bridge.pegmanD = Bridge.constrainDirection4(Bridge.pegmanD = 6);
        break;
      case 'SouthWest':
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                      [Bridge.pegmanX, Bridge.pegmanY, 5 * 2], 0);
        Bridge.pegmanD = Bridge.constrainDirection4(Bridge.pegmanD = 5);
        break;
      case 'West':
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                      [Bridge.pegmanX, Bridge.pegmanY, 4 * 2], 0);
        Bridge.pegmanD = Bridge.constrainDirection4(Bridge.pegmanD = 4);
        break;
        case 'NorthWest':
          Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
                        [Bridge.pegmanX, Bridge.pegmanY, 3 * 2], 0);
          Bridge.pegmanD = Bridge.constrainDirection4(Bridge.pegmanD = 3);
          break;
      case 'Dive':
        // Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, Bridge.pegmanD * 2],
        //               [Bridge.pegmanX, Bridge.pegmanY, 2 * 2], 0);
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, 2 * 2],
                      [Bridge.pegmanX, Bridge.pegmanY, 2 * 2], 1);

        Bridge.pegmanY -=1;
        Bridge.pegmanD = Bridge.constrainDirection4(Bridge.pegmanD = 2);
        break;
        case 'Swim':
        Bridge.schedule([Bridge.pegmanX, Bridge.pegmanY, 2 * 2],
                      [Bridge.pegmanX, Bridge.pegmanY, 2 * 2], 2);

          break;
      case 'finish':
        Bridge.scheduleFinish(true);
        Bridge.questionsquiz();
        // BlocklyInterface.saveToLocalStorage();
      }
      if(Bridge.log[0] == null || Bridge.log[0][1] != action[1])
        Bridge.prevlog.add(action[1]);
      var factor = Bridge.timevalue;
  }
  else {
    var factor = 1;
  }
  // console.log(Bridge.prevlog);
  Bridge.pidList.push(setTimeout(Bridge.animate, Bridge.stepSpeed * factor));
  if(Bridge.Finishtimes == 1 && Bridge.log.length == 0 && !Bridge.shiftdone){
    //reorder the canvas
    Bridge.shiftdone = true;
    setTimeout(Bridge.shiftscreen,Bridge.stepSpeed * (factor + 1));
  }
  Bridge.timevalue = 0;
};

/**
 * Point the congratulations Pegman to face the mouse.
 * @param {Event} e Mouse move event.
 * @private
 */
Bridge.updatePegSpin_ = function(e) {
  if (document.getElementById('dialogDone').className ==
      'dialogHiddenContent') {
    return;
  }
};

/**
 * Schedule the animations for a move or turn.
 * @param {!Array.<number>} bridgePos X, Y and direction bridgeing points.
 * @param {!Array.<number>} endPos X, Y and direction ending points.
 */

Bridge.schedule = function(bridgePos, endPos, type) {
  if(type == 0){
    var deltas = [(endPos[0] - bridgePos[0]) ,
                  (endPos[1] - bridgePos[1]) ,
                  (endPos[2] - bridgePos[2])];
    deltas[2] = deltas[2] > 0 ? (deltas[2] > 8 ? (deltas[2] - 16) : deltas[2]) : (deltas[2] < -8 ? (deltas[2] + 16) : deltas[2]);
    var factor;
    var consolation = deltas[2] < 0 ? deltas[2] : 0;
    if(deltas[2] > 0){
      switch (Math.abs(deltas[2])) {
        case 2:
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 1 + consolation));
          }, Bridge.stepSpeed));
          factor = 2;
          break;
        case 4:
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 1 + consolation));
          }, Bridge.stepSpeed));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 2 + consolation));
          }, Bridge.stepSpeed * 2));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 3 + consolation));
              }, Bridge.stepSpeed * 3));
          factor = 4;
          break;
        case 6:
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 1 + consolation));
          }, Bridge.stepSpeed));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 2 + consolation));
          }, Bridge.stepSpeed * 2));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 3 + consolation));
          }, Bridge.stepSpeed * 3));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 4 + consolation));
          }, Bridge.stepSpeed * 4));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 5 + consolation));
          }, Bridge.stepSpeed * 5));
          factor = 6;
          break;
        case 8:
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 1 + consolation));
          }, Bridge.stepSpeed));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 2 + consolation));
          }, Bridge.stepSpeed * 2));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 3 + consolation));
          }, Bridge.stepSpeed * 3));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 4 + consolation));
          }, Bridge.stepSpeed * 4));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 5 + consolation));
          }, Bridge.stepSpeed * 5));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 6 + consolation));
          }, Bridge.stepSpeed * 6));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 7 + consolation));
          }, Bridge.stepSpeed * 7));
          factor = 8;
          break;
      }
      var dire = Bridge.constrainDirection16(endPos[2]);
      Bridge.pathdire = dire /2;
    }
    else if(deltas[2] < 0){
      switch (Math.abs(deltas[2])) {
        case 2:
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 1 + consolation));
          }, Bridge.stepSpeed));
          factor = 2;
          break;
        case 4:
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 3 + consolation));


          }, Bridge.stepSpeed));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 2 + consolation));


          }, Bridge.stepSpeed * 2));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 1 + consolation));


          }, Bridge.stepSpeed * 3));
          factor = 4;
          break;
        case 6:
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 5 + consolation));


          }, Bridge.stepSpeed));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 4 + consolation));


          }, Bridge.stepSpeed * 2));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 3 + consolation));


          }, Bridge.stepSpeed * 3));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 2 + consolation));


          }, Bridge.stepSpeed * 4));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 1 + consolation));


          }, Bridge.stepSpeed * 5));
          factor = 6;
          break;
        case 8:
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 7 + consolation));


          }, Bridge.stepSpeed));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 6 + consolation));


          }, Bridge.stepSpeed * 2));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 5 + consolation));


          }, Bridge.stepSpeed * 3));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 4 + consolation));


          }, Bridge.stepSpeed * 4));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 3 + consolation));


          }, Bridge.stepSpeed * 5));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 2 + consolation));


          }, Bridge.stepSpeed * 6));
        Bridge.pidList.push(setTimeout(function() {
            Bridge.displayPegman(bridgePos[0] + deltas[0] * 2,
                bridgePos[1] + deltas[1] * 2,
                Bridge.constrainDirection16(bridgePos[2] + 1 + consolation));


          }, Bridge.stepSpeed * 7));
          factor = 8;
          break;
      }
      var dire = Bridge.constrainDirection16(endPos[2]);
      Bridge.pathdire = dire / 2;
    }
    else if(deltas[2] == 0){
      var pegmanIcon = document.getElementById('pegman');
      // alert(bridgePos[2]);
      // Bridge.pathlength += Math.sqrt((endPos[0] - bridgePos[0]) * (endPos[0] - bridgePos[0]) + (endPos[1] - bridgePos[1]) * (endPos[1] - bridgePos[1]))
      Bridge.pathlength += Math.max(Math.abs(endPos[0] - bridgePos[0]), Math.abs(endPos[1] - bridgePos[1]));
      pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href','bridge/' + bridgePos[2] + '.png');
      var bridge_height = Bridge.PEGMAN_HEIGHT / 4;
      var end_height = Bridge.PEGMAN_HEIGHT;
      var heightfactor = Bridge.PEGMAN_HEIGHT * 3 / (4 *  Math.max((Math.abs(deltas[0]) * 32 || Math.abs(deltas[1]) * 32)) );
      for(var i=1; i <= (Math.abs(deltas[0]) * 32 || Math.abs(deltas[1]) * 32); i++) {
        Bridge.timeout = function(val) {
          Bridge.pidList.push(setTimeout(function() {
            if(bridgePos[0] == Bridge.bridge_.x && bridgePos[1] == Bridge.bridge_.y && val == 9)
              pegmanIcon.style.display = 'initial';
             Bridge.displayPegman(bridgePos[0] + (deltas[0] * val / 32) ,
                 (bridgePos[1] + deltas[1] * val / 32),
                 Bridge.constrainDirection16(val-1));
             // Bridge.displayPegman(bridgePos[0],
             //     (bridgePos[1]),
             //     Bridge.constrainDirection16(val-1));
           }, Bridge.stepSpeed * val));
        }
        Bridge.timeout(i);
      }
      factor = Math.abs(deltas[0]) > Math.abs(deltas[1]) ? Math.abs(deltas[0]) * 32 + 4 : Math.abs(deltas[1]) * 32 + 4;
      Bridge.pidList.push(setTimeout(function() {
          pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href','bridge/Idle.png');
          Bridge.displayPegman(endPos[0], endPos[1],
              Bridge.constrainDirection16(endPos[2]));
        }, Bridge.stepSpeed * (factor - 2)));
    }
    Bridge.timevalue = factor + 2;
    Bridge.pidList.push(setTimeout(function() {
        Bridge.displayPegman(endPos[0], endPos[1],
            Bridge.constrainDirection16(endPos[2]));
      }, Bridge.stepSpeed * (factor + 1)));
  }
  else if(type == 1){
    Bridge.pidList.push(setTimeout(function() {
      Bridge.diveanimation();
    }, Bridge.stepSpeed * (Bridge.timevalue)));
  }
  else if(type == 2){
    Bridge.pidList.push(setTimeout(function() {
        Bridge.swimanimation(Bridge.angletoswim);
    }, Bridge.stepSpeed * (Bridge.timevalue)));
  }
};

/**
 * Schedule the animations and sounds for a failed move.
 * @param {boolean} forward True if forward, false if backward.
 */
Bridge.scheduleFail = function(forward) {
  var deltaX = 0;
  var deltaY = 0;
  // BlocklyGames.coinval -=10;
  // Bridge.drawcoinval();
  BlocklyGames.updatecoinvalue();
  switch (Bridge.pegmanD) {
    case Bridge.DirectionType.NORTH:
      deltaY = -1;
      break;
    case Bridge.DirectionType.NORTHEAST:
      deltaX = 1;
      deltaY = -1;
      break;
    case Bridge.DirectionType.EAST:
      deltaX = 1;
      break;
    case Bridge.DirectionType.SOUTHEAST:
      deltaX = 1;
      deltaY = 1;
      break;
    case Bridge.DirectionType.SOUTH:
      deltaY = 1;
      break;
    case Bridge.DirectionType.SOUTHWEST:
      deltaX = -1;
      deltaY = 1;
      break;
    case Bridge.DirectionType.WEST:
      deltaX = -1;
      break;
    case Bridge.DirectionType.NORTHWEST:
      deltaX = -1;
      deltaY = -1;
      break;

  }
  if (!forward) {
    deltaX = -deltaX;
    deltaY = -deltaY;
  }
  if (Bridge.SKIN.crashType == Bridge.CRASH_STOP) {
    // Bounce bounce.
    deltaX /= 4;
    deltaY /= 4;
    var direction16 = Bridge.constrainDirection16(Bridge.pegmanD * 2);
    Bridge.displayPegman(Bridge.pegmanX + deltaX,
                       Bridge.pegmanY + deltaY,
                       direction16);


    BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    Bridge.pidList.push(setTimeout(function() {
      Bridge.displayPegman(Bridge.pegmanX,
                         Bridge.pegmanY,
                         direction16);


      }, Bridge.stepSpeed));
    Bridge.pidList.push(setTimeout(function() {
      Bridge.displayPegman(Bridge.pegmanX + deltaX,
                         Bridge.pegmanY + deltaY,
                         direction16);


      BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    }, Bridge.stepSpeed * 2));
    Bridge.pidList.push(setTimeout(function() {
        Bridge.displayPegman(Bridge.pegmanX, Bridge.pegmanY, direction16);


      }, Bridge.stepSpeed * 3));
  } else {
    // Add a small random delta away from the grid.
    var deltaZ = (Math.random() - 0.5) * 10;
    var deltaD = (Math.random() - 0.5) / 2;
    deltaX += (Math.random() - 0.5) / 4;
    deltaY += (Math.random() - 0.5) / 4;
    deltaX /= 8;
    deltaY /= 8;
    var acceleration = 0;
    if (Bridge.SKIN.crashType == Bridge.CRASH_FALL) {
      acceleration = 0.01;
    }
    Bridge.pidList.push(setTimeout(function() {
      BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    }, Bridge.stepSpeed * 2));
    var setPosition = function(n) {
      return function() {
        var direction16 = Bridge.constrainDirection16(Bridge.pegmanD * 4 +
                                                    deltaD * n);
        Bridge.displayPegman(Bridge.pegmanX + deltaX * n,
                           Bridge.pegmanY + deltaY * n,
                           direction16,
                           deltaZ * n);


        deltaY += acceleration;
      };
    };
    // 100 frames should get Pegman offscreen.
    for (var i = 1; i < 100; i++) {
      Bridge.pidList.push(setTimeout(setPosition(i),
          Bridge.stepSpeed * i / 2));
    }
  }
};

/**
 * Schedule the animations and sound for a victory dance.
 * @param {boolean} sound Play the victory sound.
 */
Bridge.scheduleFinish = function(sound) {
  var direction16 = Bridge.constrainDirection16(Bridge.pegmanD * 2);
  Bridge.displayPegman(Bridge.pegmanX, Bridge.pegmanY, 16);


  if (sound) {
    BlocklyInterface.workspace.getAudioManager().play('win', 0.5);
  }
  Bridge.stepSpeed = 100;  // Slow down victory animation a bit.
  Bridge.pidList.push(setTimeout(function() {
    Bridge.displayPegman(Bridge.pegmanX, Bridge.pegmanY, 18);


    }, Bridge.stepSpeed));
  Bridge.pidList.push(setTimeout(function() {
    Bridge.displayPegman(Bridge.pegmanX, Bridge.pegmanY, 16);


    }, Bridge.stepSpeed * 2));
  Bridge.pidList.push(setTimeout(function() {
      Bridge.displayPegman(Bridge.pegmanX, Bridge.pegmanY, direction16);


    }, Bridge.stepSpeed * 3));
};

/**
 * Display Pegman at the specified location, facing the specified direction.
 * @param {number} x Horizontal grid (or fraction thereof).
 * @param {number} y Vertical grid (or fraction thereof).
 * @param {number} d Direction (0 - 15) or dance (16 - 17).
 * @param {number=} opt_angle Optional angle (in degrees) to rotate Pegman.
 */
Bridge.displayPegman = function(x, y, d, opt_angle) {
  var pegmanIcon = document.getElementById('pegman');
  pegmanIcon.setAttribute('x',
      x * Bridge.SQUARE_SIZE - d * Bridge.PEGMAN_WIDTH + 1);
  var clipRect = document.getElementById('clipRect');
  if(opt_angle == 1){
    // alert("a");
    pegmanIcon.setAttribute('y', Bridge.SQUARE_SIZE * (y + 0.5) - (d/18) * (Bridge.PEGMAN_HEIGHT/2) - 1);
  }
  else {
    pegmanIcon.setAttribute('y',
        Bridge.SQUARE_SIZE * (y + 0.5) - Bridge.PEGMAN_HEIGHT / 2 - 8);
    clipRect.setAttribute('x', x * Bridge.SQUARE_SIZE + 1);
    clipRect.setAttribute('y', pegmanIcon.getAttribute('y'));
  }
  // Bridge.scheduleLook(x , y, Bridge.constrainDirection4(Bridge.pegmanD));
};

/**
 * Display the look icon at Pegman's current location,
 * in the specified direction.
 * @param {!Bridge.DirectionType} d Direction (0 - 3).
 */
Bridge.scheduleLook = function(x , y , d) {
  x -=0.25
  y -= 0.35;
  x *= Bridge.SQUARE_SIZE;
  y *= Bridge.SQUARE_SIZE;
  var deg = d * 90 - 45;

  var lookIcon = document.getElementById('look');
  lookIcon.setAttribute('transform',
      'translate(' + x + ', ' + y + ') ' +
      'rotate(0 0 0) scale(1)');
};

/**
 * Schedule one of the 'look' icon's waves to appear, then disappear.
 * @param {!Element} path Element to make appear.
 * @param {number} delay Milliseconds to wait before making wave appear.
 */
Bridge.scheduleLookStep = function(path, delay) {
  Bridge.pidList.push(setTimeout(function() {
    path.style.display = 'inline';
    setTimeout(function() {
      // path.style.display = 'none';
    }, Bridge.stepSpeed * 2);
  }, delay));
};

/**
 * Keep the direction within 0-4, wrapping at both ends.
 * @param {number} d Potentially out-of-bounds direction value.
 * @return {number} Legal direction value.
 */
Bridge.constrainDirection4 = function(d) {
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
Bridge.constrainDirection16 = function(d) {
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
 * @throws {true} If the end of the bridge is reached.
 * @throws {false} If Pegman collides with a wall.
 */
Bridge.move = function(direction, id) {
  if(!Bridge.prevlog.has(id))
  {
    if (!Bridge.isPath(direction, null)) {
      Bridge.log.push(['fail_' + (direction ? 'backward' : 'forward'), id]);
      throw false;
    }
    // If moving backward, flip the effective direction.
    var effectiveDirection = Bridge.pegmanDcheck + direction;
    var command;
    switch (Bridge.constrainDirection4(effectiveDirection)) {
      case Bridge.DirectionType.NORTH:
        Bridge.pegmanYcheck--;
        command = 'north';
        break;
      case Bridge.DirectionType.NORTHEAST:
      Bridge.pegmanXcheck++;
      Bridge.pegmanYcheck--;
      command = 'northeast';
      break;
      case Bridge.DirectionType.EAST:
        Bridge.pegmanXcheck++;
        command = 'east';
        break;
      case Bridge.DirectionType.SOUTHEAST:
      Bridge.pegmanXcheck++;
      Bridge.pegmanYcheck++;
      command = 'southeast';
      break;
      case Bridge.DirectionType.SOUTH:
        Bridge.pegmanYcheck++;
        command = 'south';
        break;
      case Bridge.DirectionType.SOUTHWEST:
      Bridge.pegmanXcheck--;
      Bridge.pegmanYcheck++;
      command = 'southwest';
      break;
      case Bridge.DirectionType.WEST:
        Bridge.pegmanXcheck--;
        command = 'west';
        break;
        case Bridge.DirectionType.NORTHWEST:
        Bridge.pegmanXcheck--;
        Bridge.pegmanYcheck--;
        command = 'northwest';
        break;
    }
    Bridge.log.push([command, id]);
  }
};

/**
 * Turn pegman left or right.
 * @param {number} direction Direction to turn (0 = left, 1 = right).
 * @param {string} id ID of block that triggered this action.
 */
Bridge.turn = function(direction, id) {
  if(!Bridge.prevlog.has(id))
  {
    switch (direction)
    {
      case 0:
        Bridge.pegmanDcheck = 2;
        Bridge.log.push(['North',id]);
        break;
      case 1:
        Bridge.pegmanDcheck = 1;
        Bridge.log.push(['NorthEast',id]);
        break;
      case 2:
        Bridge.pegmanDcheck = 0;
        Bridge.log.push(['East',id]);
        break;
      case 3:
        Bridge.pegmanDcheck = 7;
        Bridge.log.push(['SouthEast',id]);
        break;
      case 4:
        Bridge.pegmanDcheck = 6;
        Bridge.log.push(['South',id]);
        break;
      case 5:
        Bridge.pegmanDcheck = 5;
        Bridge.log.push(['SouthWest',id]);
        break;
      case 6:
        Bridge.pegmanDcheck = 4;
        Bridge.log.push(['West',id]);
        break;
      case 7:
        Bridge.pegmanDcheck = 3;
        Bridge.log.push(['NorthWest',id]);
        break;
    }
  }
  Bridge.pegmanDcheck = Bridge.constrainDirection4(Bridge.pegmanDcheck);
};
Bridge.swim = function(degree, id){
  Bridge.angletoswim = degree;
 Bridge.log.push(['Swim',id]);
}
Bridge.dive = function(id) {
  Bridge.pegmanYcheck -=1;
  Bridge.pegmanDcheck = 2;
  Bridge.log.push(['Dive',id]);
}
/**
 * Is there a path next to pegman?
 * @param {number} direction Direction to look
 *     (0 = forward, 1 = right, 2 = backward, 3 = left).
 * @param {?string} id ID of block that triggered this action.
 *     Null if called as a helper function in Bridge.move().
 * @return {boolean} True if there is a path.
 */
Bridge.isPath = function(direction, id) {
  if(!Bridge.prevlog.has(id))
  {
    var effectiveDirection = Bridge.pegmanDcheck + direction;
    var square;
    var command;
    switch (Bridge.constrainDirection4(effectiveDirection)) {
      case Bridge.DirectionType.NORTH:
        square = Bridge.map[Bridge.pegmanYcheck - 1] &&
            Bridge.map[Bridge.pegmanYcheck - 1][Bridge.pegmanXcheck];
        command = 'look_north';
        break;
      case Bridge.DirectionType.NORTHEAST:
        square = Bridge.map[Bridge.pegmanYcheck - 1] &&
            Bridge.map[Bridge.pegmanYcheck - 1][Bridge.pegmanXcheck + 1];
        command = 'look_northeast';
        break;
      case Bridge.DirectionType.EAST:
        square = Bridge.map[Bridge.pegmanYcheck][Bridge.pegmanXcheck + 1];
        command = 'look_east';
        break;
      case Bridge.DirectionType.SOUTHEAST:
        square = Bridge.map[Bridge.pegmanYcheck + 1] &&
            Bridge.map[Bridge.pegmanYcheck + 1][Bridge.pegmanXcheck + 1];
        command = 'look_southeast';
        break;
      case Bridge.DirectionType.SOUTH:
        square = Bridge.map[Bridge.pegmanYcheck + 1] &&
            Bridge.map[Bridge.pegmanYcheck + 1][Bridge.pegmanXcheck];
        command = 'look_south';
        break;
      case Bridge.DirectionType.SOUTHWEST:
        square = Bridge.map[Bridge.pegmanYcheck + 1] &&
            Bridge.map[Bridge.pegmanYcheck + 1][Bridge.pegmanXcheck - 1];
        command = 'look_southwest';
        break;
      case Bridge.DirectionType.WEST:
        square = Bridge.map[Bridge.pegmanYcheck][Bridge.pegmanXcheck - 1];
        command = 'look_west';
        break;
      case Bridge.DirectionType.NORTHWEST:
        square = Bridge.map[Bridge.pegmanYcheck - 1] &&
            Bridge.map[Bridge.pegmanYcheck - 1][Bridge.pegmanXcheck - 1];
        command = 'look_northwest';
        break;
    }
  }
  if (id) {
    Bridge.log.push([command, id]);
  }
  return square !== Bridge.SquareType.WALL && square !== undefined;
};


Bridge.Riverdirection = function (direction,id){
  switch(direction){
    case 1:
      if(Bridge.flowdire == -1)
        return true;
      else
        return false;
      break;
    case 2:
      if(Bridge.flowdire == 1)
        return true;
      else
        return false;
      break;
  }
}
/**
 * Is the player at the finish marker?
 * @return {boolean} True if not done, false if done.
 */
Bridge.notDone = function() {
  if(Bridge.pegmanXcheck == Bridge.finish_.x && Bridge.pegmanYcheck == Bridge.finish_.y){
    Bridge.Finishtimes ++;
  }
  return Bridge.pegmanXcheck != Bridge.finish_.x || Bridge.pegmanYcheck != Bridge.finish_.y || Bridge.Finishtimes !=2;
};

Bridge.showHelp = function() {
  var help = document.getElementById('help');
  var button = document.getElementById('helpButton');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };
  BlocklyDialogs.showDialog(help, button, true, true, style, Bridge.hideHelp);
  BlocklyDialogs.startDialogKeyDown();
};

/**
 * Hide the help pop-up.
 */
Bridge.hideHelp = function() {
  BlocklyDialogs.stopDialogKeyDown();
};

Bridge.questionsquiz = function(val) {
  var content = document.getElementById('Quiz');
  var style = {
    width: '40%',
    left: '50%',
    top: '3em'
  };
  var text;
  var text1;
  var cancel = document.getElementById('doneSubmit1');
  if(Bridge.question == 1) {
    text = 'What is the area of the triangle formed by the points shown with Black squares (Assume 1 block is 1*1 in dimmensions)';
    text1 = "Sorry you entered wrong answer please try again!"
  }
  else if(Bridge.question == 2){
    text = 'What is the value of the angle you used to reach the point opposite to start point';
    text1 = "Sorry you entered wrong answer please try again!"
  }
    var linesText = document.getElementById('dialogLinesText1');
    linesText.textContent = '';
    linesText.appendChild(document.createTextNode(text));

  cancel.addEventListener('click', Bridge.checkinput);
  // cancel.addEventListener('touchend', BlocklyDialogs.checkinput, val);
  var ok = document.getElementById('doneOk1');
  ok.style.display = "none";
  ok.addEventListener('click', BlocklyDialogs.congratulations, true);
  ok.addEventListener('touchend', BlocklyDialogs.congratulations, true);

  BlocklyDialogs.showDialog(content, null, false, true, style,
      function() {
        document.body.removeEventListener('keydown',
            Bridge.congratulationsKeyDown, true);
        });
  document.body.addEventListener('keydown',
      Bridge.congratulationsKeyDown, true);
  document.getElementById('dialogDoneText1').style.display = "none";
  document.getElementById('dialogDoneText1').textContent = text1;
};
Bridge.checkinput = function(){
  if(Bridge.question == 1) {
    if(document.getElementById('containerCode1').value == (Bridge.areaanswer))
    {
      document.getElementById('dialogDoneText1').style.display = "none";
      BlocklyDialogs.hideDialog(true);
      Bridge.question ++;
      BlocklyGames.coinval += 30;
      BlocklyGames.updatecoinvalue();
      var helptext = document.getElementById("helptext");
      helptext.setAttribute('style', 'white-space: pre;');
      var text = " Use Reset button to take the character at the begining of the bridge and use Dive and Swim \r\n commands to find the angle at wich charcter must swim so that he reaches the opposite end \r\n of the starting points.\r\n \r\n"
                  + " Given: Earlier river direction was East to west but now it is randomly generated when you \r\n click run. So for accounting that use If-Else blocks for swiming. \r\n"
                  + " Charcter speed is 2 and River speed is 2^½.";
      helptext.textContent = text;
      Bridge.showHelp();
    }
    else {
      document.getElementById('dialogDoneText1').style.display = "initial";
    }
  }
  else if(Bridge.question == 2){
    if(document.getElementById('containerCode1').value == (45))
    {
      BlocklyGames.coinval += 30;
      BlocklyGames.updatecoinvalue();
      document.getElementById('dialogDoneText1').style.display = "none";
      document.getElementById('doneOk1').style.display = 'initial';
      document.getElementById('doneSubmit1').style.display = 'none';
    }
    else {
      document.getElementById('dialogDoneText1').style.display = "initial";
    }
  }
}
Bridge.congratulationsKeyDown = function(e) {
  if (e.keyCode == 13 ||
      e.keyCode == 27 ||
      e.keyCode == 32) {
    e.stopPropagation();
    e.preventDefault();
  }
};

Bridge.storymessage = function (){
  var text1 = "Congratulations on making it so far into the game!!";
  var text2 = "You are a decent human helping others in their time of need. You helped circus people build their ring and for that they were very thankfull of you! But let's not get distracted and continue our search for treasure.";
  var text3 = "According to the page in the book you have to cross the bridge and make it to the beach on the other side, but will this be so simple let's find out.";
  var text4 = "(Quick tip : Use help commands whenever you are stuck on what to do!!)";
  document.getElementById('p1').textContent = text1;
  document.getElementById('p2').textContent = text2;
  document.getElementById('p3').textContent = text3;
  document.getElementById('p4').textContent = text4;
  document.getElementById('p2').style.top = document.getElementById('p1').offsetTop + document.getElementById('p1').offsetHeight + 'px';
  document.getElementById('p3').style.top = document.getElementById('p2').offsetTop + document.getElementById('p2').offsetHeight + 'px';
  function startlevel (){
    document.getElementById('storyMessageB').style.display = 'none';
    Bridge.init();
  };
  document.getElementById('cross').addEventListener("click",startlevel);
  document.getElementById('cross').addEventListener("touchend",startlevel);
};
window.addEventListener('load', Bridge.storymessage);
