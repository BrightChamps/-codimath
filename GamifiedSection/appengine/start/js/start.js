/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Start game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Start');

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
goog.require('Start.Blocks');
goog.require('Start.soy');


BlocklyGames.NAME = 'start';
/**
 * Go to the next level.  Add skin parameter.
 * @suppress {duplicate}
 */
Start.MAX_BLOCKS = [undefined, // Level 0.
    Infinity, Infinity, 2, 5, 5, 5, 5, 10, 7, 10][BlocklyGames.LEVEL];

// Crash type constants.
Start.CRASH_STOP = 1;
Start.CRASH_SPIN = 2;
Start.CRASH_FALL = 3;

Start.SKINS = [
  // sprite: A 1029x51 set of 21 avatar images.
  // tiles: A 250x200 set of 20 map images.
  // marker: A 20x34 goal image.
  // background: An optional 400x450 background image, or false.
  // look: Colour of sonar-like look icon.
  // winSound: List of sounds (in various formats) to play when the player wins.
  // crashSound: List of sounds (in various formats) for player crashes.
  // crashType: Behaviour when player crashes (stop, spin, or fall).
  {
    sprite: 'start/pegman.png',
    idlesprite: 'start/Idle.png',
    tiles: 'start/tiles_path.png',
    emptytiles : 'start/empty.png',
    startmarker: 'start/house1.png',
    marker: 'start/circus1.png',
    background: 'start/bg_park.jpg',
    look: '#000',
    coin: 'start/coin-sprite.png',
    winSound: ['start/win.mp3', 'start/win.ogg'],
    crashSound: ['start/fail_pegman.mp3', 'start/fail_pegman.ogg'],
    crashType: Start.CRASH_STOP
  },
  {
    sprite: 'start/astro.png',
    tiles: 'start/tiles_astro.png',
    marker: 'start/marker.png',
    background: 'start/bg_astro.jpg',
    // Coma star cluster, photo by George Hatfield, used with permission.
    look: '#fff',
    coin: 'start/coin.png',
    winSound: ['start/win.mp3', 'start/win.ogg'],
    crashSound: ['start/fail_astro.mp3', 'start/fail_astro.ogg'],
    crashType: Start.CRASH_SPIN
  },
  {
    sprite: 'start/panda.png',
    tiles: 'start/tiles_panda.png',
    marker: 'start/marker.png',
    background: 'start/bg_panda.jpg',
    // Spring canopy, photo by Rupert Fleetingly, CC licensed for reuse.
    look: '#000',
    coin: 'start/coin.png',
    winSound: ['start/win.mp3', 'start/win.ogg'],
    crashSound: ['start/fail_panda.mp3', 'start/fail_panda.ogg'],
    crashType: Start.CRASH_FALL
  }
];
Start.SKIN_ID = BlocklyGames.getNumberParamFromUrl('skin', 0, Start.SKINS.length);
Start.SKIN = Start.SKINS[Start.SKIN_ID];

/**
 * Milliseconds between each animation frame.
 */
Start.stepSpeed;

// BlocklyGames.coinval = 100;

/**
 * The types of squares in the start, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
Start.SquareType = {
  WALL: 0,
  OPEN: 1,
  START: 2,
  COINPOS: 3,
  FINISH: 4
};

// The start square constants defined above are inlined here
// for ease of reading and writing the static starts.
Start.map = [
// Level 0.
 undefined,
// Level 1.
 [[3, 1, 1, 1, 3, 1],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 3, 1, 1, 4],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 2]],
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
 * This is intentionally done so users see the start is about getting from
 * the start to the goal and not necessarily about moving over every part of
 * the start, 'mowing the lawn' as Neil calls it.
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
 * Measure start dimensions and set sizes.
 * ROWS: Number of tiles down.
 * COLS: Number of tiles across.
 * SQUARE_SIZE: Pixel height and width of each start square (i.e. tile).
 */
Start.ROWS = Start.map.length;
Start.COLS = Start.map[0].length;
Start.SQUARE_SIZE = (200);
Start.PEGMAN_HEIGHT = 80;
Start.PEGMAN_WIDTH = 80;
// console.log(Start.ROWS + ',' + Start.COLS);
// console.log(Start.MAZE_WIDTH + ',' + Start.MAZE_HEIGHT);
Start.PATH_WIDTH = Start.SQUARE_SIZE / 3;
Start.factorX = window.innerWidth;
Start.factorY = window.innerHeight;
var temp = Start.factorX / 2133 > Start.factorY/ 1084 ? Start.factorY/ 1084 : Start.factorX / 2133;

/**
 * Constants for cardinal directions.  Subsequent code assumes these are
 * in the range 0..3 and that opposites have an absolute difference of 2.
 * @enum {number}
 */
Start.DirectionType = {
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
Start.ResultType = {
  UNSET: 0,
  SUCCESS: 1,
  FAILURE: -1,
  TIMEOUT: 2,
  ERROR: -2
};

/**
 * Result of last execution.
 */
Start.result = Start.ResultType.UNSET;

/**
 * Starting direction.
 */
Start.startDirection = Start.DirectionType.WEST;

/**
 * PIDs of animation tasks currently executing.
 */
Start.pidList = [];

// Map each possible shape to a sprite.
// Input: Binary string representing Centre/North/West/South/East squares.
// Output: [x, y] coordinates of each tile's sprite in tiles.png.
Start.tile_SHAPES = {
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

Start.tile_SHAPES_path = {
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
Start.drawMap = function() {
  var svg = document.getElementById('svgStart');
  var scale = Math.min(Start.ROWS, Start.COLS) * Start.SQUARE_SIZE;
  // svg.setAttribute('viewBox', '0 0 ' + scale + ' ' + scale);
  svg.style.width = Start.MAZE_WIDTH + 'px';
  svg.style.height = Start.MAZE_HEIGHT + 'px';
  svg.setAttribute('viewBox', '0 0 ' + Start.MAZE_WIDTH + ' ' + Start.MAZE_HEIGHT);
  // Draw the outer square.
  Blockly.utils.dom.createSvgElement('rect', {
      'height': Start.MAZE_HEIGHT,
      'width': Start.MAZE_WIDTH,
      'fill': '#F1EEE7',
      'stroke-width': 1,
      'stroke': '#CCB'
    }, svg);
  var bgClip = Blockly.utils.dom.createSvgElement('clipPath', {
      'id': 'bgClipPath'
    }, svg);
  Blockly.utils.dom.createSvgElement('rect', {
      'height': 12 * Start.SQUARE_SIZE,
      'width': 12 * Start.SQUARE_SIZE,
      'x': 0,
      'y': 0
    }, bgClip);

  var tile = Blockly.utils.dom.createSvgElement('image', {
      'id' : 'background',
      'height': Start.MAZE_HEIGHT,
      'width': Start.MAZE_WIDTH,
      'clip-path': 'url(#bgClipPath)'
    }, svg);
  tile.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      Start.SKIN.background);
    var normalize = function(x, y) {
      if (x < 0 || x >= Start.COLS || y < 0 || y >= Start.ROWS) {
        return '0';
      }
      return (Start.map[y][x] == Start.SquareType.WALL) ? '0' : '1';
    };
  //
    // Compute and draw the tile for each square.
    var tileId = 0;
    for (var y = 0; y <= Start.ROWS; y++) {
      for (var x = 0; x <= Start.COLS; x++) {
        // var tileShape = x.toString() + ',' + y.toString();
        // var left = Start.tile_SHAPES[tileShape][0];
        // var top = Start.tile_SHAPES[tileShape][1];
        // // Tile's clipPath element.
        // var tileClip = Blockly.utils.dom.createSvgElement('clipPath', {
        //     'id': 'tileClipPath' + tileId
        //   }, svg);
        // Blockly.utils.dom.createSvgElement('rect', {
        //     'height': Start.SQUARE_SIZE,
        //     'width': Start.SQUARE_SIZE,
        //     'x': x * Start.SQUARE_SIZE,
        //     'y': y * Start.SQUARE_SIZE
        //   }, tileClip);
        // Tile sprite.
        // Blockly.utils.dom.createSvgElement('rect', {
        //     'height': Start.SQUARE_SIZE,
        //     'width': Start.SQUARE_SIZE,
        //     'fill': 'none',
        //     'stroke-width': 1,
        //     'stroke': '#00cc00',
        //     'stroke-dasharray' : 10,
        //     'x': (x-1)  * Start.SQUARE_SIZE + Start.SQUARE_SIZE/2.2,
        //     'y': (y) * Start.SQUARE_SIZE - Start.SQUARE_SIZE/3.8
        //   }, svg);
        // var tile = Blockly.utils.dom.createSvgElement('image', {
        //     'height': Start.SQUARE_SIZE,
        //     'width': Start.SQUARE_SIZE * 4,
        //     'clip-path': 'url(#tileClipPath' + tileId + ')',
        //     'x': (x - left) * Start.SQUARE_SIZE,
        //     'y': (y - top) * Start.SQUARE_SIZE
        //   }, svg);
        // tile.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
        //     Start.SKIN.emptytiles);
        // tileId++;
      }
    }
  // Add finish marker.
  var finishMarker = Blockly.utils.dom.createSvgElement('image', {
      'id': 'finish',
      'height': 180 * BlocklyGames.factor,
      'width': 180 * BlocklyGames.factor
    }, svg);
  finishMarker.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      Start.SKIN.marker);

  var startMarker = Blockly.utils.dom.createSvgElement('image', {
      'id': 'start',
      'height': 180 * BlocklyGames.factor,
      'width': 180 * BlocklyGames.factor
    }, svg);
  startMarker.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      Start.SKIN.startmarker);


  // Pegman's clipPath element, whose (x, y) is reset by Start.displayPegman
  var pegmanClip = Blockly.utils.dom.createSvgElement('clipPath', {
      'id': 'pegmanClipPath'
    }, svg);
  Blockly.utils.dom.createSvgElement('rect', {
      'id': 'clipRect',
      'height': Start.PEGMAN_HEIGHT,
      'width': Start.PEGMAN_WIDTH
    }, pegmanClip);

  // Add Pegman.
  var pegmanIcon = Blockly.utils.dom.createSvgElement('image', {
      'id': 'pegman',
      'height': Start.PEGMAN_HEIGHT,
      'width': Start.PEGMAN_WIDTH * 16, // 49 * 21 = 1029
      'clip-path': 'url(#pegmanClipPath)'
    }, svg);
  pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      Start.SKIN.idlesprite);
//
};
Start.runcoindisplay = false;
Start.coindisplay = function(){
  var visualization = document.getElementById('visualization');
  // alert(Start.coinlocation[0].x + ', ' + Start.coinlocation[0].y);
  var cCoin1 = document.getElementById('coin1');
    cCoin1.style.top =  (Start.coinlocation[0].y + 0.25) * Start.SQUARE_SIZE + Start.SQUARE_SIZE/2.8 + 'px';
    cCoin1.style.left =  (Start.coinlocation[0].x + 0.25) * Start.SQUARE_SIZE + Start.SQUARE_SIZE/20 + 'px';
  var cCoin2 = document.getElementById('coin2');
    cCoin2.style.top =  (Start.coinlocation[1].y + 0.25) * Start.SQUARE_SIZE + Start.SQUARE_SIZE/2.8 + 'px';
    cCoin2.style.left =  (Start.coinlocation[1].x + 0.25) * Start.SQUARE_SIZE + Start.SQUARE_SIZE/20 + 'px';
  var cCoin3 = document.getElementById('coin3');
    cCoin3.style.top =  (Start.coinlocation[2].y + 0.25) * Start.SQUARE_SIZE + Start.SQUARE_SIZE/2.8 + 'px';
    cCoin3.style.left =  (Start.coinlocation[2].x + 0.25) * Start.SQUARE_SIZE + Start.SQUARE_SIZE/20 + 'px';
  var gcoin1 = document.getElementById('coincanvas1').getContext('2d');
  document.getElementById('coincanvas1').style.width = Start.SQUARE_SIZE/ 4 + 'px';
  document.getElementById('coincanvas1').style.height = Start.SQUARE_SIZE/ 4 + 'px';
  var gcoin2 = document.getElementById('coincanvas2').getContext('2d');
  var gcoin3 = document.getElementById('coincanvas3').getContext('2d');
  document.getElementById('coincanvas2').style.width = Start.SQUARE_SIZE/ 4 + 'px';
  document.getElementById('coincanvas2').style.height = Start.SQUARE_SIZE/ 4 + 'px';
  document.getElementById('coincanvas3').style.width = Start.SQUARE_SIZE/ 4 + 'px';
  document.getElementById('coincanvas3').style.height = Start.SQUARE_SIZE/ 4 + 'px';
  var img = new Image();
  img.src = Start.SKIN.coin;
  var srcx;
  var srcy;
  var frames = 10;
  var currentframe = 0;
  var sheetWidth = 440;
  var sheetHeight = 40;
  var width = sheetWidth / frames;
  // alert(Start.coinlocation[0].x);
  function update() {
    currentframe = ++currentframe % frames;
    srcx = currentframe * width;
    srcy = 0;
    gcoin1.clearRect(0, 0, gcoin1.canvas.width, gcoin1.canvas.height);
    gcoin2.clearRect(0, 0, gcoin2.canvas.width, gcoin2.canvas.height);
    gcoin3.clearRect(0, 0, gcoin3.canvas.width, gcoin3.canvas.height);
  }
  function draw() {
    update();
    gcoin1.drawImage(img, srcx, srcy, width, sheetHeight, 0, 0, gcoin1.canvas.width, gcoin1.canvas.height);
    gcoin2.drawImage(img, srcx, srcy, width, sheetHeight, 0, 0, gcoin2.canvas.width, gcoin2.canvas.height);
    gcoin3.drawImage(img, srcx, srcy, width, sheetHeight, 0, 0, gcoin3.canvas.width, gcoin3.canvas.height);
  }
  function timercode() {
    draw();
    if(!Start.runcoindisplay)
      setTimeout(timercode, 100);
  }
  setTimeout(timercode,100);
}
/**
 * Initialize Blockly and the start.  Called on page load.
 */
Start.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Start.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       skin: Start.SKIN_ID,
       html: BlocklyGames.IS_HTML});
// Start.storymessage();
  BlocklyInterface.init();
  document.getElementById('finishanimation').style.display = 'none';
  // Setup the Pegman menu.
  var pegmanImg = document.querySelector('#pegmanButton>img');
  pegmanImg.style.backgroundImage = 'url(' + Start.SKIN.sprite + ')';
  var pegmanMenu = document.getElementById('pegmanMenu');
  var handlerFactory = function(n) {
    return function() {
      Start.changePegman(n);
    };
  };
  Start.coinscollected = 0;
  Start.coinscollectedcheck = 0;
  for (var i = 0; i < Start.SKINS.length; i++) {
    if (i == Start.SKIN_ID) {
      continue;
    }
    var div = document.createElement('div');
    var img = document.createElement('img');
    img.src = 'common/1x1.gif';
    img.style.backgroundImage = 'url(' + Start.SKINS[i].sprite + ')';
    div.appendChild(img);
    pegmanMenu.appendChild(div);
    Blockly.bindEvent_(div, 'mousedown', null, handlerFactory(i));
  }
  Blockly.bindEvent_(window, 'resize', null, Start.hidePegmanMenu);
  var pegmanButton = document.getElementById('pegmanButton');
  Blockly.bindEvent_(pegmanButton, 'mousedown', null, Start.showPegmanMenu);
  var pegmanButtonArrow = document.getElementById('pegmanButtonArrow');
  var arrow = document.createTextNode(Blockly.FieldDropdown.ARROW_CHAR);
  pegmanButtonArrow.appendChild(arrow);

  var rtl = BlocklyGames.isRtl();
  Start.SQUARE_SIZE = Start.SQUARE_SIZE * BlocklyGames.factor;
  Start.MAZE_WIDTH = Start.SQUARE_SIZE * Start.COLS;
  Start.MAZE_HEIGHT = Start.SQUARE_SIZE * Start.ROWS;
  Start.PEGMAN_HEIGHT = 120 * BlocklyGames.factor;
  Start.PEGMAN_WIDTH = 120 * BlocklyGames.factor;

  var blocklyDiv = document.getElementById('blockly');
  var visualization = document.getElementById('visualization');
  var top = visualization.offsetTop;
  var buttontable = document.getElementById('buttontable');

  var onresize = function(e) {
    var top = visualization.offsetTop;
    blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
    blocklyDiv.style.left = rtl ? '10px' : (Start.MAZE_WIDTH + 20) + 'px';
    blocklyDiv.style.width = (window.innerWidth - (Start.MAZE_WIDTH + 40)) + 'px';
    blocklyDiv.style.paddingBottom = 10 * BlocklyGames.factor + 'px';
  buttontable.style.left = blocklyDiv.offsetLeft + 'px';
  buttontable.style.width = (window.innerWidth - (Start.MAZE_WIDTH + 40)) + 'px';
  buttontable.style.top = blocklyDiv.offsetTop + Start.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('runButton').style.left = blocklyDiv.offsetLeft + 'px';
  document.getElementById('runButton').style.top = blocklyDiv.offsetTop + Start.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('resetButton').style.left = document.getElementById('runButton').offsetLeft + document.getElementById('runButton').offsetWidth + 'px';
  document.getElementById('resetButton').style.top = blocklyDiv.offsetTop + Start.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('resetButton').style.marginRight = '0px';
  };
  window.addEventListener('scroll', function() {
    onresize(null);
    Blockly.svgResize(BlocklyInterface.workspace);
    buttontable.style.left = blocklyDiv.offsetLeft + 'px';
    buttontable.style.width = (window.innerWidth - (Start.MAZE_WIDTH + 40)) + 'px';
    buttontable.style.top = blocklyDiv.offsetTop + Start.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('runButton').style.left = blocklyDiv.offsetLeft + 'px';
    document.getElementById('runButton').style.top = blocklyDiv.offsetTop + Start.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('resetButton').style.left = document.getElementById('runButton').offsetLeft + document.getElementById('runButton').offsetWidth + 'px';
    document.getElementById('resetButton').style.top = blocklyDiv.offsetTop + Start.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('resetButton').style.marginRight = '0px';
  });
  window.addEventListener('resize', onresize);
  onresize(null);
  Start.SQUARE_SIZE = Start.SQUARE_SIZE / BlocklyGames.factor;
  Start.MAZE_WIDTH = Start.SQUARE_SIZE / Start.COLS;
  Start.MAZE_HEIGHT = Start.SQUARE_SIZE / Start.ROWS;
  Start.PEGMAN_HEIGHT = 130 / BlocklyGames.factor;
  Start.PEGMAN_WIDTH = 130 / BlocklyGames.factor;

  Start.SQUARE_SIZE = Start.SQUARE_SIZE * BlocklyGames.factor;
  Start.MAZE_WIDTH = Start.SQUARE_SIZE * Start.COLS;
  Start.MAZE_HEIGHT = Start.SQUARE_SIZE * Start.ROWS;
  Start.PEGMAN_HEIGHT = 180 * BlocklyGames.factor;
  Start.PEGMAN_WIDTH = 180 * BlocklyGames.factor;
  Start.PATH_WIDTH = Start.SQUARE_SIZE / 3;

  // Scale the workspace so level 1 = 1.3, and level 10 = 1.0.
  // var scale = 1 + (1 - (BlocklyGames.LEVEL / BlocklyGames.MAX_LEVEL)) / 3;
  var scale = 1;
  BlocklyInterface.injectBlockly(
      {'maxBlocks': Start.MAX_BLOCKS,
       'rtl': rtl,
       'trashcan': true,
       'zoom': {'startScale': scale}});
  BlocklyInterface.workspace.getAudioManager().load(Start.SKIN.winSound, 'win');
  BlocklyInterface.workspace.getAudioManager().load(Start.SKIN.crashSound, 'fail');
  // Not really needed, there are no user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('moveForward,moveBackward,' +
      'turnRight,turnLeft,isPathForward,isPathRight,isPathBackward,isPathLeft');

      var svg = document.getElementById('svgStart');
      svg.style.width = Start.MAZE_WIDTH + 'px';
      svg.style.height = Start.MAZE_HEIGHT + 'px';
  Start.drawMap();
  var pegmanIcon = document.getElementById('pegman');
  pegmanIcon.style.display = "none";
  // Start.drawCoin();
  // Start.drawcoinval();
  var runButton1 = document.getElementById('runButton');
  var resetButton1 = document.getElementById('resetButton');

  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton1.style.minWidth) {
    resetButton1.style.minWidth = runButton1.offsetWidth + 'px';
  }

  // BlocklyInterface.loadBlocks(defaultXml, false);

  // Locate the start and finish squares.
  Start.coinlocation = [];
  for (var y = 0; y < Start.ROWS; y++) {
    for (var x = 0; x < Start.COLS; x++) {
      if (Start.map[y][x] == Start.SquareType.START) {
        Start.start_ = {x: x, y: y};
        Start.start1_ = {x: x, y: y};
      } else if (Start.map[y][x] == Start.SquareType.FINISH) {
        Start.finish_ = {x: x, y: y};
      }
      else if (Start.map[y][x] == Start.SquareType.COINPOS) {
          Start.coinlocation.push({x: x, y: y});
      }
    }
  }
  // Start.boyenteringcircus();
  // Start.coindisplay();
  // alert(Start.finish_.x);
  // alert(Start.finish_.y);
  // Start.levelHelp()
  Start.reset(true);
  BlocklyInterface.workspace.addChangeListener(function() {Start.updateCapacity();});

  document.body.addEventListener('mousemove', Start.updatePegSpin_, true);

  BlocklyGames.bindClick('runButton', Start.runButtonClick);
  BlocklyGames.bindClick('resetButton', Start.resetButtonClick);
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
      BlocklyDialogs.startDialogKeyDown();
      setTimeout(BlocklyDialogs.abortOffer, 5 * 60 * 1000);
    }
  } else {
    // All other levels get interactive help.  But wait 5 seconds for the
    // user to think a bit before they are told what to do.
  }
  var mloader = document.getElementById('miniloader');
  mloader.style.height = Start.MAZE_HEIGHT + 'px';
  mloader.style.width = Start.MAZE_WIDTH + 'px';
  mloader.style.left = visualization.offsetLeft + 'px';
  mloader.style.top = visualization.offsetTop + 'px';
  // mloader.style.display = 'none';
  // setTimeout(function(){
  //   document.getElementById('miniloader').style.display = 'block';
  //   window.miniloader();
  // },5000);
  // Lazy-load the JavaScript interpreter.
  BlocklyInterface.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyInterface.importPrettify();
  BlocklyGames.bindClick('helpButton', Start.showHelp);

};
Start.boyenteringcircus = function() {
  var sheetWidth = 6560;
  var sheetHeight = 410;
  var frame = 16;
  var currentframe = 0;
  var width = sheetWidth / frame;
  var srcX;
  var srcY;
  var bgwidth = 1000;
  var bgheight = 740;
  var bgX = 0;
  var bgY = 0;
  var x = 4 * Start.SQUARE_SIZE;
  var y = 6 * Start.SQUARE_SIZE;
  BlocklyDialogs.hideDialog(true);
  setTimeout(BlocklyInterface.nextLevel,8000);
  document.getElementById('buttontable').style.display = 'none';
  document.getElementById('blockly').style.display = 'none';
  document.getElementById('svgStart').style.display = 'none';
  document.getElementById('finishanimation').style.display = 'initial';
  document.getElementById('finishanimation').style.top = document.getElementById('svgStart').offsetTop + 'px';
  document.getElementById('finishanimation').style.left = document.getElementById('svgStart').offsetLeft + 'px';
  document.getElementById('finishanimation').style.width = Start.MAZE_WIDTH + 'px';
  document.getElementById('finishanimation').style.height = Start.MAZE_HEIGHT + 'px';
  var ctx = document.getElementById('finishanimation').getContext('2d');
  var img = new Image();
  img.src = 'start/4.png';
  var image = new Image();
  image.src = 'start/circusfinish.png';
  function update() {
    currentframe = ++currentframe % frame;
    srcX = currentframe * width;
    srcY = 0;
      bgwidth -=1;
      bgheight -=.81;
      x += 1;
      y -= 0.5;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  function draw() {
    update();
    ctx.drawImage(image, bgX, bgY, bgwidth, bgheight, 0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, srcX, srcY, width, sheetHeight, x, y, 180 * 2 * BlocklyGames.factor, 180 * 2 * BlocklyGames.factor);
  }
  function timercode () {
    draw();
    setTimeout(timercode, 100);
  }
  setTimeout(timercode,100);
}
/**
 * When the workspace changes, update the help as needed.
 * @param {Blockly.Events.Abstract=} opt_event Custom data for event.
 */
Start.levelHelp = function(opt_event) {
  if (opt_event && opt_event.type == Blockly.Events.UI) {
    // Just a change to highlighting or somesuch.
    return;
  } else if (BlocklyInterface.workspace.isDragging()) {
    // Don't change helps during drags.
    return;
  } else if (Start.result == Start.ResultType.SUCCESS ||
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
    //           '<block type="start_moveForward" x="10" y="10">',
    //             '<next>',
    //               '<block type="start_moveForward"></block>',
    //             '</next>',
    //           '</block>',
    //         '</xml>'];
    //     BlocklyInterface.injectReadonly('sampleOneTopBlock', xml);
    //     content = document.getElementById('dialogHelpOneTopBlock');
    //     style = {'width': '360px', 'top': '120px'};
    //     style[rtl ? 'right' : 'left'] = '225px';
    //     origin = topBlocks[0].getSvgRoot();
    //   } else if (Start.result == Start.ResultType.UNSET) {
    //     // Show run help dialog.
    //     content = document.getElementById('dialogHelpRun');
    //     style = {'width': '360px', 'top': '410px'};
    //     style[rtl ? 'right' : 'left'] = '400px';
    //     origin = document.getElementById('runButton');
    //   }
    // }
  } else if (BlocklyGames.LEVEL == 2) {
    if (Start.result != Start.ResultType.UNSET &&
        document.getElementById('runButton').style.display == 'none') {
      content = document.getElementById('dialogHelpReset');
      style = {'width': '360px', 'top': '410px'};
      style[rtl ? 'right' : 'left'] = '400px';
      origin = document.getElementById('resetButton');
    }
  } else if (BlocklyGames.LEVEL == 3) {
    if (userBlocks.indexOf('start_forever') == -1) {
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
        (userBlocks.indexOf('start_forever') == -1 ||
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
        if (block.type != 'start_forever') {
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
    if (Start.SKIN_ID == 0 && !Start.showPegmanMenu.activatedOnce) {
      content = document.getElementById('dialogHelpSkins');
      style = {'width': '360px', 'top': '60px'};
      style[rtl ? 'left' : 'right'] = '20px';
      origin = document.getElementById('pegmanButton');
    }
  } else if (BlocklyGames.LEVEL == 6) {
    if (userBlocks.indexOf('start_if') == -1) {
      content = document.getElementById('dialogHelpIf');
      style = {'width': '360px', 'top': '430px'};
      style[rtl ? 'right' : 'left'] = '425px';
      origin = toolbar[4].getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL == 7) {
    if (!Start.levelHelp.initialized7_) {
      // Create fake dropdown.
      var span = document.createElement('span');
      span.className = 'helpMenuFake';
      var options =
          [BlocklyGames.getMsg('Start_pathAhead'),
           BlocklyGames.getMsg('Start_pathLeft'),
           BlocklyGames.getMsg('Start_pathRight')];
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
      Start.levelHelp.initialized7_ = true;
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
    if (userBlocks.indexOf('start_ifElse') == -1) {
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
Start.changePegman = function(newSkin) {
  BlocklyInterface.saveToSessionStorage();
  location = location.protocol + '//' + location.host + location.pathname +
      '?lang=' + BlocklyGames.LANG + '&level=' + BlocklyGames.LEVEL +
      '&skin=' + newSkin;
};

/**
 * Display the Pegman skin-change menu.
 * @param {!Event} e Mouse, touch, or resize event.
 */
Start.showPegmanMenu = function(e) {
  var menu = document.getElementById('pegmanMenu');
  if (menu.style.display == 'block') {
    // Menu is already open.  Close it.
    Start.hidePegmanMenu(e);
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
  Start.pegmanMenuMouse_ =
      Blockly.bindEvent_(document.body, 'mousedown', null, Start.hidePegmanMenu);
  // Close the skin-changing hint if open.
  var hint = document.getElementById('dialogHelpSkins');
  if (hint && hint.className != 'dialogHiddenContent') {
    BlocklyDialogs.hideDialog(false);
  }
  Start.showPegmanMenu.activatedOnce = true;
};

/**
 * Hide the Pegman skin-change menu.
 * @param {!Event} e Mouse, touch, or resize event.
 */
Start.hidePegmanMenu = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  document.getElementById('pegmanMenu').style.display = 'none';
  document.getElementById('pegmanButton').classList.remove('buttonHover');
  if (Start.pegmanMenuMouse_) {
    Blockly.unbindEvent_(Start.pegmanMenuMouse_);
    delete Start.pegmanMenuMouse_;
  }
};

/**
 * Reset the start to the start position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Start.reset = function(first) {
  // Kill all tasks.
  for (var i = 0; i < Start.pidList.length; i++) {
    clearTimeout(Start.pidList[i]);
  }
  // document.getElementById('runButton').style.display = 'none';
  // document.getElementById('resetButton').style.display = 'none';
  Start.pidList = [];
  Start.prevlog.clear();
  // Move Pegman into position.
  Start.drawclone = true;
  Start.pegmanX = Start.start1_.x;
  Start.pegmanY = Start.start1_.y;
  Start.pegmanXcheck = Start.pegmanX;
  Start.pegmanYcheck = Start.pegmanY;
  Start.pathdire = 4;
  Start.pathlength = 0;
  if (first) {
    // Opening animation.
    Start.pegmanD = Start.startDirection;
    Start.scheduleFinish(false);
    Start.pidList.push(setTimeout(function() {
      Start.stepSpeed = 130;
      //BlocklyGames.coinval = 100;

      Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                    [Start.pegmanX - 1, Start.pegmanY, Start.pegmanD * 2]);
      Start.pegmanD = Start.startDirection;
      Start.pegmanDcheck = Start.pegmanD;
      Start.pegmanX = Start.pegmanX - 1;
      Start.pegmanXcheck = Start.pegmanX;
    }, Start.stepSpeed * 5));
    Start.coindisplay();
  } else {
    BlocklyGames.coinval = BlocklyGames.coinval - Start.coinscollected * 30;
    BlocklyGames.updatecoinvalue();
    Start.coinscollected = 0;
    Start.coinscollectedcheck = 0;
    Start.pegmanD = Start.startDirection;
    Start.pegmanDcheck = Start.pegmanD;
    var pegmanIcon = document.getElementById('pegman');
    pegmanIcon.style.display = "none";
    Start.pidList.push(setTimeout(function() {
      Start.stepSpeed = 130;
      Start.deletePath();
      Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                    [Start.pegmanX - 1, Start.pegmanY, Start.pegmanD * 2]);
      Start.pegmanD = Start.startDirection;
      Start.pegmanDcheck = Start.pegmanD;
      Start.pegmanX = Start.pegmanX - 1;
      Start.pegmanXcheck = Start.pegmanX;
      document.getElementById('coin1').style.display = 'initial';
      document.getElementById('coin2').style.display = 'initial';
      document.getElementById('coin3').style.display = 'initial';
    }, Start.stepSpeed * 5));
  }

  // Move the finish icon into position.
  var finishIcon = document.getElementById('finish');
  finishIcon.setAttribute('x', Start.SQUARE_SIZE * (Start.finish_.x + 0.5) -
      finishIcon.getAttribute('width') / 2);
  finishIcon.setAttribute('y', Start.SQUARE_SIZE * (Start.finish_.y + 0.6) -
      finishIcon.getAttribute('height') / 1.5);

  var startIcon = document.getElementById('start');
  startIcon.setAttribute('x', Start.SQUARE_SIZE * (Start.start_.x + 0.5) -
      startIcon.getAttribute('width') / 2);
  startIcon.setAttribute('y', Start.SQUARE_SIZE * (Start.start_.y + 0.6) -
      startIcon.getAttribute('height') / 2);

  // Make 'look' icon invisible and promote to top.
  var lookIcon = document.getElementById('look');
  lookIcon.style.display = 'none';
  lookIcon.parentNode.appendChild(lookIcon);
  var paths = lookIcon.getElementsByTagName('path');
  for (var i = 0, path; (path = paths[i]); i++) {
    path.setAttribute('stroke', Start.SKIN.look);
  }
};

/**
 * Click the run button.  Start the program.
 * @param {!Event} e Mouse or touch event.
 */
Start.runButtonClick = function(e) {
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
  //     Start.result != Start.ResultType.SUCCESS &&
  //     !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
  //                                        BlocklyGames.LEVEL)) {
  //   // Start.levelHelp();
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
  // Start.reset(false);
  Start.execute();
};

/**
 * Updates the document's 'capacity' element with a message
 * indicating how many more blocks are permitted.  The capacity
 * is retrieved from BlocklyInterface.workspace.remainingCapacity().
 */
Start.updateCapacity = function() {
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
      var msg = BlocklyGames.getMsg('Start_capacity0');
    } else if (cap == 1) {
      var msg = BlocklyGames.getMsg('Start_capacity1');
    } else {
      var msg = BlocklyGames.getMsg('Start_capacity2');
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
 * Click the reset button.  Reset the start.
 * @param {!Event} e Mouse or touch event.
 */
Start.resetButtonClick = function(e) {
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
  Start.reset(false);
  Start.levelHelp();
};

/**
 * Inject the Start API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS-Interpreter.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Start.initInterpreter = function(interpreter, globalObject) {
  // API
  var wrapper;
  wrapper = function(id) {
    Start.move(0, id);
  };
  interpreter.setProperty(globalObject, 'moveForward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Start.move(2, id);
  };
  interpreter.setProperty(globalObject, 'moveBackward',
      interpreter.createNativeFunction(wrapper));


  wrapper = function(id) {
    Start.turn(0, id);
  };
  interpreter.setProperty(globalObject, 'turnNorth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Start.turn(1, id);
  };
  interpreter.setProperty(globalObject, 'turnNorthEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Start.turn(2, id);
  };
  interpreter.setProperty(globalObject, 'turnEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Start.turn(3, id);
  };
  interpreter.setProperty(globalObject, 'turnSouthEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Start.turn(4, id);
  };
  interpreter.setProperty(globalObject, 'turnSouth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Start.turn(5, id);
  };
  interpreter.setProperty(globalObject, 'turnSouthWest',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Start.turn(6, id);
  };
  interpreter.setProperty(globalObject, 'turnWest',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Start.turn(7, id);
  };
  interpreter.setProperty(globalObject, 'turnNorthWest',
      interpreter.createNativeFunction(wrapper));


  wrapper = function(id) {
    return Start.isPath(0, id);
  };
  interpreter.setProperty(globalObject, 'isPathForward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Start.isPath(1, id);
  };
  interpreter.setProperty(globalObject, 'isPathNorth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Start.isPath(2, id);
  };
  interpreter.setProperty(globalObject, 'isPathBackward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Start.isPath(3, id);
  };
  interpreter.setProperty(globalObject, 'isPathEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Start.isPath(4, id);
  };
  interpreter.setProperty(globalObject, 'isPathSouth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
        return Start.isPath(5, id);
      };
  interpreter.setProperty(globalObject, 'isPathWest',
          interpreter.createNativeFunction(wrapper));
  // wrapper = function(times) {
  //   return Start.notDone();
  // };
  // interpreter.setProperty(globalObject, 'repeat',
  //     interpreter.createNativeFunction(wrapper));
};

/**
 * Execute the user's code.  Heaven help us...
 */
Start.execute = function() {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Start.execute, 250);
    return;
  }

  Start.log = [];
  Blockly.selected && Blockly.selected.unselect();
  var code = BlocklyInterface.getJsCode();
  BlocklyInterface.executedJsCode = code;
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
  Start.result = Start.ResultType.UNSET;
  var interpreter = new Interpreter(code, Start.initInterpreter);

  // Try running the user's code.  There are four possible outcomes:
  // 1. If pegman reaches the finish [SUCCESS], true is thrown.
  // 2. If the program is terminated due to running too long [TIMEOUT],
  //    false is thrown.
  // 3. If another error occurs [ERROR], that error is thrown.
  // 4. If the program ended normally but without solving the start [FAILURE],
  //    no error or exception is thrown.
  try {
    var ticks = 10000;  // 10k ticks runs Pegman for about 8 minutes.
    while (interpreter.step()) {
      if (ticks-- == 0) {
        throw Infinity;
      }
    }
    Start.result = Start.notDone() ?
        Start.ResultType.FAILURE : Start.ResultType.SUCCESS;
  } catch (e) {
    // A boolean is thrown for normal termination.
    // Abnormal termination is a user error.
    if (e === Infinity) {
      Start.result = Start.ResultType.TIMEOUT;
    } else if (e === false) {
      Start.result = Start.ResultType.ERROR;
    } else {
      // Syntax error, can't happen.
      Start.result = Start.ResultType.ERROR;
      alert(e);
    }
  }

  // Fast animation if execution is successful.  Slow otherwise.
  if (Start.result == Start.ResultType.SUCCESS) {
    Start.stepSpeed = 100;
    Start.log.push(['finish', null]);
  } else {
    Start.stepSpeed = 130;
  }
  // Start.log now contains a transcript of all the user's actions.
  // Reset the start and animate the transcript.
  // Start.reset(false);
  Start.pidList.push(setTimeout(Start.animate, 100));
};
Start.checkPosition = function () {
  if(!(Start.pegmanX < Start.COLS && Start.pegmanX >=0 && Start.pegmanY < Start.ROWS && Start.pegmanY >=0) )
    return;
  else if(Start.pegmanX == Start.coinlocation[0].x && Start.pegmanY == Start.coinlocation[0].y && document.getElementById('coin1').style.display != 'none')
  {
    BlocklyGames.coinval +=30;
    setTimeout(function() {
      document.getElementById('coin1').style.display = 'none';
      Start.coinscollected ++;
      BlocklyGames.updatecoinvalue();
    },Start.stepSpeed * (Start.timevalue - 12));
  }
  else if(Start.pegmanX == Start.coinlocation[1].x && Start.pegmanY == Start.coinlocation[1].y && document.getElementById('coin2').style.display != 'none')
  {
    BlocklyGames.coinval +=30;
    setTimeout(function() {
      document.getElementById('coin2').style.display = 'none';
      Start.coinscollected ++;
      BlocklyGames.updatecoinvalue();
    },Start.stepSpeed * (Start.timevalue - 14));
  }
  else if(Start.pegmanX == Start.coinlocation[2].x && Start.pegmanY == Start.coinlocation[2].y && document.getElementById('coin3').style.display != 'none')
  {
    BlocklyGames.coinval +=30;
    setTimeout(function() {
      document.getElementById('coin3').style.display = 'none';
      Start.coinscollected ++;
      BlocklyGames.updatecoinvalue();
    },Start.stepSpeed * (Start.timevalue - 9));
  }
}
Start.checkPositionch = function() {
  if(!(Start.pegmanXcheck < Start.COLS && Start.pegmanXcheck >=0 && Start.pegmanYcheck < Start.ROWS && Start.pegmanYcheck >=0))
    return;
  else if(Start.pegmanXcheck == Start.coinlocation[0].x && Start.pegmanYcheck == Start.coinlocation[0].y && document.getElementById('coin1').style.display != 'none')
  {
      Start.coinscollectedcheck ++;
  }
  else if(Start.pegmanXcheck == Start.coinlocation[1].x && Start.pegmanYcheck == Start.coinlocation[1].y && document.getElementById('coin2').style.display != 'none')
  {
      Start.coinscollectedcheck ++;
  }
  else if(Start.pegmanXcheck == Start.coinlocation[2].x && Start.pegmanYcheck == Start.coinlocation[2].y && document.getElementById('coin3').style.display != 'none')
  {
      Start.coinscollectedcheck ++;
  }
}
/**
 * Iterate through the recorded path and animate pegman's actions.
 */
Start.prevlog = new Set();
Start.animate = function() {
  var action = Start.log.shift();
  if (!action) {
    BlocklyInterface.highlight(null);
    Start.levelHelp();
    return;
  }

  if(!Start.prevlog.has(action[1])){
    BlocklyInterface.highlight(action[1]);
    // console.log(action[0]+',' +action[1]);
    switch (action[0]) {
      case 'north':
        Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                      [Start.pegmanX, Start.pegmanY - 1, Start.pegmanD * 2]);
        Start.pegmanY--;
        Start.checkPosition();
        break;
      case 'northeast':
        Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                      [Start.pegmanX + 1, Start.pegmanY - 1, Start.pegmanD * 2]);
        Start.pegmanX++;
        Start.pegmanY--;
        Start.checkPosition();
        break;
      case 'east':
        Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                      [Start.pegmanX + 1, Start.pegmanY, Start.pegmanD * 2]);
        Start.pegmanX++;
        Start.checkPosition();
        break;
      case 'southeast':
        Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                      [Start.pegmanX + 1, Start.pegmanY + 1, Start.pegmanD * 2]);
        Start.pegmanX++;
        Start.pegmanY++;
        Start.checkPosition();
        break;
      case 'south':
        Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                      [Start.pegmanX, Start.pegmanY + 1, Start.pegmanD * 2]);
        Start.pegmanY++;
        Start.checkPosition();
        break;
      case 'southwest':
        Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                      [Start.pegmanX - 1, Start.pegmanY + 1, Start.pegmanD * 2]);
        Start.pegmanX--;
        Start.pegmanY++;
        Start.checkPosition();
        break;
      case 'west':
        Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                      [Start.pegmanX - 1, Start.pegmanY, Start.pegmanD * 2]);
        Start.pegmanX--;
        Start.checkPosition();
        break;
      case 'northwest':
        Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                      [Start.pegmanX - 1, Start.pegmanY - 1, Start.pegmanD * 2]);
        Start.pegmanX--;
        Start.pegmanY--;
        Start.checkPosition();
        break;

      case 'look_north':
        Start.scheduleLook(Start.DirectionType.NORTH);
        break;
      case 'look_northeast':
        Start.scheduleLook(Start.DirectionType.NORTHEAST);
        break;
      case 'look_east':
        Start.scheduleLook(Start.DirectionType.EAST);
        break;
      case 'look_southeast':
        Start.scheduleLook(Start.DirectionType.SOUTHEAST);
        break;
      case 'look_south':
        Start.scheduleLook(Start.DirectionType.SOUTH);
        break;
      case 'look_southwest':
        Start.scheduleLook(Start.DirectionType.SOUTHWEST);
        break;
      case 'look_west':
        Start.scheduleLook(Start.DirectionType.WEST);
        break;
      case 'look_northwest':
        Start.scheduleLook(Start.DirectionType.NORTHWEST);
        break;

      case 'fail_forward':
        BlocklyGames.coinval -=10;
        Start.scheduleFail(true);
        break;
      case 'fail_backward':
        BlocklyGames.coinval -=10;
        Start.scheduleFail(false);
        break;
      case 'North':
        Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                      [Start.pegmanX, Start.pegmanY, 2 * 2 ]);
        Start.pegmanD = Start.constrainDirection4(Start.pegmanD = 2);
        break;
      case 'NorthEast':
        Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                      [Start.pegmanX, Start.pegmanY, 1 * 2]);
        Start.pegmanD = Start.constrainDirection4(Start.pegmanD = 1);
        break;
      case 'East':
        Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                      [Start.pegmanX, Start.pegmanY, 0 * 2 ]);
        Start.pegmanD = Start.constrainDirection4(Start.pegmanD = 0);
        break;
      case 'SouthEast':
        Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                      [Start.pegmanX, Start.pegmanY, 7 * 2]);
        Start.pegmanD = Start.constrainDirection4(Start.pegmanD = 7);
        break;
      case 'South':
        Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                      [Start.pegmanX, Start.pegmanY, 6 * 2]);
        Start.pegmanD = Start.constrainDirection4(Start.pegmanD = 6);
        break;
      case 'SouthWest':
        Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                      [Start.pegmanX, Start.pegmanY, 5 * 2]);
        Start.pegmanD = Start.constrainDirection4(Start.pegmanD = 5);
        break;
      case 'West':
        Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                      [Start.pegmanX, Start.pegmanY, 4 * 2]);
        Start.pegmanD = Start.constrainDirection4(Start.pegmanD = 4);
        break;
        case 'NorthWest':
          Start.schedule([Start.pegmanX, Start.pegmanY, Start.pegmanD * 2],
                        [Start.pegmanX, Start.pegmanY, 3 * 2]);
          Start.pegmanD = Start.constrainDirection4(Start.pegmanD = 3);
          break;
      case 'finish':
        Start.scheduleFinish(true);
        // BlocklyInterface.saveToLocalStorage();

        setTimeout(function(){
          // Start.boyenteringcircus();
          Start.questionsquiz();
        },Start.stepSpeed * Start.timevalue);

        // setTimeout(function(){
        //   BlocklyInterface.nextLevel();
        // },(Start.stepSpeed * Start.timevalue + 8000));

      }
      if(Start.log[0] == null || Start.log[0][1] != action[1])
      Start.prevlog.add(action[1]);
      var factor = Start.timevalue;
  }
  else {
    var factor = 1;
  }
  // console.log(Start.prevlog);
  Start.pidList.push(setTimeout(Start.animate, Start.stepSpeed * factor));
};

/**
 * Point the congratulations Pegman to face the mouse.
 * @param {Event} e Mouse move event.
 * @private
 */
Start.updatePegSpin_ = function(e) {
  if (document.getElementById('dialogDone').className ==
      'dialogHiddenContent') {
    return;
  }
  // var pegSpin = document.getElementById('pegSpin');
  // var bBox = BlocklyDialogs.getBBox_(pegSpin);
  // var x = bBox.x + bBox.width / 2 - window.pageXOffset;
  // var y = bBox.y + bBox.height / 2 - window.pageYOffset;
  // var dx = e.clientX - x;
  // var dy = e.clientY - y;
  // var angle = Blockly.utils.math.toDegrees(Math.atan(dy / dx));
  // // 0: North, 90: East, 180: South, 270: West.
  // if (dx > 0) {
  //   angle += 90;
  // } else {
  //   angle += 270;
  // }
  // // Divide into 16 quads.
  // var quad = Math.round(angle / 360 * 16);
  // if (quad == 16) {
  //   quad = 15;
  // }
  // // Display correct Pegman sprite.
  // pegSpin.style.backgroundPosition = (-quad * Start.PEGMAN_WIDTH) + 'px 0px';
};

/**
 * Schedule the animations for a move or turn.
 * @param {!Array.<number>} startPos X, Y and direction starting points.
 * @param {!Array.<number>} endPos X, Y and direction ending points.
 */

Start.schedule = function(startPos, endPos) {
  var deltas = [(endPos[0] - startPos[0]) ,
                (endPos[1] - startPos[1]) ,
                (endPos[2] - startPos[2])];
  deltas[2] = deltas[2] > 8 ? (deltas[2] - 16) : deltas[2];
  var factor;
  var consolation = deltas[2] < 0 ? deltas[2] : 0;
  if(deltas[2] > 0){
    switch (Math.abs(deltas[2])) {
      case 2:
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 1 + consolation));
          if(Start.drawclone)
            Start.clonepegman();
        }, Start.stepSpeed));
        factor = 2;
        break;
      case 4:
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 1 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 2 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 2));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 3 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 3));
        factor = 4;
        break;
      case 6:
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 1 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 2 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 2));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 3 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 3));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 4 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 4));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 5 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 5));
        factor = 6;
        break;
      case 8:
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 1 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 2 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 2));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 3 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 3));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 4 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 4));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 5 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 5));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 6 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 6));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 7 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 7));
        factor = 8;
        break;
    }
    var dire = Start.constrainDirection16(endPos[2]);
    Start.pathdire = dire /2;
  }
  else if(deltas[2] < 0){
    switch (Math.abs(deltas[2])) {
      case 2:
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 1 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed));
        factor = 2;
        break;
      case 4:
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 3 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 2 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 2));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 1 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 3));
        factor = 4;
        break;
      case 6:
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 5 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 4 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 2));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 3 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 3));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 2 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 4));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 1 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 5));
        factor = 6;
        break;
      case 8:
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 7 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 6 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 2));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 5 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 3));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 4 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 4));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 3 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 5));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 2 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 6));
      Start.pidList.push(setTimeout(function() {
          Start.displayPegman(startPos[0] + deltas[0] * 2,
              startPos[1] + deltas[1] * 2,
              Start.constrainDirection16(startPos[2] + 1 + consolation));
              if(Start.drawclone)
              Start.clonepegman();
        }, Start.stepSpeed * 7));
        factor = 8;
        break;
    }
    var dire = Start.constrainDirection16(endPos[2]);
    Start.pathdire = dire / 2;
  }
  else if(deltas[2] == 0){
    var pegmanIcon = document.getElementById('pegman');
    // alert(startPos[2]);
    // Start.pathlength += Math.sqrt((endPos[0] - startPos[0]) * (endPos[0] - startPos[0]) + (endPos[1] - startPos[1]) * (endPos[1] - startPos[1]));
    if(Math.abs(endPos[0] - startPos[0]) > 0 && Math.abs(endPos[1] - startPos[1]))
      Start.pathlength += 1.4;
    else if(Math.abs(endPos[0] - startPos[0]) > 0 || Math.abs(endPos[1] - startPos[1])){
      Start.pathlength += 1;
    }
    // Start.pathlength += Math.max(Math.abs(endPos[0] - startPos[0]), Math.abs(endPos[1] - startPos[1]));
    pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href','start/' + startPos[2] + '.png');
    var start_height = Start.PEGMAN_HEIGHT / 4;
    var end_height = Start.PEGMAN_HEIGHT;
    var heightfactor = Start.PEGMAN_HEIGHT * 3 / (4 *  Math.max((Math.abs(deltas[0]) * 32 || Math.abs(deltas[1]) * 32)) );
    for(var i=1; i <= (Math.abs(deltas[0]) * 16 || Math.abs(deltas[1]) * 16); i++) {
      Start.timeout = function(val) {
        Start.pidList.push(setTimeout(function() {
          if(startPos[0] == Start.start_.x && startPos[1] == Start.start_.y && val == 5)
            Start.drawclone = true;
          else if(endPos[0] == Start.finish_.x && endPos[1] == Start.finish_.y && Start.coinscollected == 3 && val == Math.max(Math.abs(deltas[0]) * 16, Math.abs(deltas[1]) * 16) - 4)
            Start.drawclone = true;
           Start.displayPegman(startPos[0] + (deltas[0] * val / 16) ,
               (startPos[1] + deltas[1] * val / 16),
               Start.constrainDirection16(val-1));
               if((Start.pathdire == 1 || Start.pathdire == 3 || Start.pathdire == 5 || Start.pathdire == 7) && val % 2 == 0) {
                 Start.showPath(startPos[0] + (deltas[0] * val / 16),
                     (startPos[1] + deltas[1] * val / 16),
                      Start.pathdire);
               }
               else if((Start.pathdire == 0 || Start.pathdire == 2 || Start.pathdire == 4 || Start.pathdire == 6) && val % 3 == 0) {
                 Start.showPath(startPos[0] + (deltas[0] * val / 16),
                     (startPos[1] + deltas[1] * val / 16),
                      Start.pathdire);
               }
               if(Start.drawclone)
                  Start.clonepegman();
         }, Start.stepSpeed * val));
      }
      Start.timeout(i);
    }
    factor = Math.abs(deltas[0]) > Math.abs(deltas[1]) ? Math.abs(deltas[0]) * 16 + 4 : Math.abs(deltas[1]) * 16 + 4;
    Start.pidList.push(setTimeout(function() {
        pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href','start/Idle.png');
        Start.displayPegman(endPos[0], endPos[1],
            Start.constrainDirection16(endPos[2]));
            Start.clonepegman();
      }, Start.stepSpeed * (factor - 2)));
  }
  Start.timevalue = factor + 2;
  Start.pidList.push(setTimeout(function() {
    if(startPos[0] == Start.start_.x && startPos[1] == Start.start_.y){
      var newstart = document.getElementById('start').cloneNode(true);
      newstart.id = 'startcopy';
      var svg = document.getElementById('svgStart');
      svg.appendChild(newstart);
    }
    if(endPos[0] == Start.finish_.x && endPos[1] == Start.finish_.y){
      var newfinish = document.getElementById('finish').cloneNode(true);
      newfinish.id = 'finishcopy';
      var svg = document.getElementById('svgStart');
      svg.appendChild(newfinish);
    }
      Start.displayPegman(endPos[0], endPos[1],
          Start.constrainDirection16(endPos[2]));
          Start.clonepegman();
          if(endPos[0] == Start.finish_.x && endPos[1] == Start.finish_.y && Start.coinscollected == 3){
            document.getElementById('pegmanCopy').style.display = 'none';
          }
          // document.getElementById('runButton').style.display = 'initial';
          // document.getElementById('resetButton').style.display = 'initial';
    }, Start.stepSpeed * (factor + 1)));
};

/**
 * Schedule the animations and sounds for a failed move.
 * @param {boolean} forward True if forward, false if backward.
 */
Start.scheduleFail = function(forward) {
  var deltaX = 0;
  var deltaY = 0;
  // BlocklyGames.coinval -=10;
  // Start.drawcoinval();
  BlocklyGames.updatecoinvalue();
  switch (Start.pegmanD) {
    case Start.DirectionType.NORTH:
      deltaY = -1;
      break;
    case Start.DirectionType.NORTHEAST:
      deltaX = 1;
      deltaY = -1;
      break;
    case Start.DirectionType.EAST:
      deltaX = 1;
      break;
    case Start.DirectionType.SOUTHEAST:
      deltaX = 1;
      deltaY = 1;
      break;
    case Start.DirectionType.SOUTH:
      deltaY = 1;
      break;
    case Start.DirectionType.SOUTHWEST:
      deltaX = -1;
      deltaY = 1;
      break;
    case Start.DirectionType.WEST:
      deltaX = -1;
      break;
    case Start.DirectionType.NORTHWEST:
      deltaX = -1;
      deltaY = -1;
      break;

  }
  if (!forward) {
    deltaX = -deltaX;
    deltaY = -deltaY;
  }
  if (Start.SKIN.crashType == Start.CRASH_STOP) {
    // Bounce bounce.
    deltaX /= 4;
    deltaY /= 4;
    var direction16 = Start.constrainDirection16(Start.pegmanD * 2);
    Start.displayPegman(Start.pegmanX + deltaX,
                       Start.pegmanY + deltaY,
                       direction16);
                       if(Start.drawclone)
                       Start.clonepegman();
    BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    Start.pidList.push(setTimeout(function() {
      Start.displayPegman(Start.pegmanX,
                         Start.pegmanY,
                         direction16);
                         if(Start.drawclone)
                         Start.clonepegman();
      }, Start.stepSpeed));
    Start.pidList.push(setTimeout(function() {
      Start.displayPegman(Start.pegmanX + deltaX,
                         Start.pegmanY + deltaY,
                         direction16);
                         if(Start.drawclone)
                         Start.clonepegman();
      BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    }, Start.stepSpeed * 2));
    Start.pidList.push(setTimeout(function() {
        Start.displayPegman(Start.pegmanX, Start.pegmanY, direction16);
        if(Start.drawclone)
        Start.clonepegman();
      }, Start.stepSpeed * 3));
  } else {
    // Add a small random delta away from the grid.
    var deltaZ = (Math.random() - 0.5) * 10;
    var deltaD = (Math.random() - 0.5) / 2;
    deltaX += (Math.random() - 0.5) / 4;
    deltaY += (Math.random() - 0.5) / 4;
    deltaX /= 8;
    deltaY /= 8;
    var acceleration = 0;
    if (Start.SKIN.crashType == Start.CRASH_FALL) {
      acceleration = 0.01;
    }
    Start.pidList.push(setTimeout(function() {
      BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    }, Start.stepSpeed * 2));
    var setPosition = function(n) {
      return function() {
        var direction16 = Start.constrainDirection16(Start.pegmanD * 4 +
                                                    deltaD * n);
        Start.displayPegman(Start.pegmanX + deltaX * n,
                           Start.pegmanY + deltaY * n,
                           direction16,
                           deltaZ * n);
                           if(Start.drawclone)
                           Start.clonepegman();
        deltaY += acceleration;
      };
    };
    // 100 frames should get Pegman offscreen.
    for (var i = 1; i < 100; i++) {
      Start.pidList.push(setTimeout(setPosition(i),
          Start.stepSpeed * i / 2));
    }
  }
};

/**
 * Schedule the animations and sound for a victory dance.
 * @param {boolean} sound Play the victory sound.
 */
Start.scheduleFinish = function(sound) {
  var direction16 = Start.constrainDirection16(Start.pegmanD * 2);
  Start.displayPegman(Start.pegmanX, Start.pegmanY, 16);
  if(Start.drawclone)
  Start.clonepegman();
  if (sound) {
    BlocklyInterface.workspace.getAudioManager().play('win', 0.5);
  }
  Start.stepSpeed = 100;  // Slow down victory animation a bit.
  Start.pidList.push(setTimeout(function() {
    Start.displayPegman(Start.pegmanX, Start.pegmanY, 18);
    if(Start.drawclone)
    Start.clonepegman();
    }, Start.stepSpeed));
  Start.pidList.push(setTimeout(function() {
    Start.displayPegman(Start.pegmanX, Start.pegmanY, 16);
    if(Start.drawclone)
    Start.clonepegman();
    }, Start.stepSpeed * 2));
  Start.pidList.push(setTimeout(function() {
      Start.displayPegman(Start.pegmanX, Start.pegmanY, direction16);
      if(Start.drawclone)
      Start.clonepegman();
    }, Start.stepSpeed * 3));
};

/**
 * Display Pegman at the specified location, facing the specified direction.
 * @param {number} x Horizontal grid (or fraction thereof).
 * @param {number} y Vertical grid (or fraction thereof).
 * @param {number} d Direction (0 - 15) or dance (16 - 17).
 * @param {number=} opt_angle Optional angle (in degrees) to rotate Pegman.
 */
Start.displayPegman = function(x, y, d, opt_angle) {
  var pegmanIcon = document.getElementById('pegman');
  pegmanIcon.setAttribute('x',
      x * Start.SQUARE_SIZE - d * Start.PEGMAN_WIDTH + 1);
  pegmanIcon.setAttribute('y',
      Start.SQUARE_SIZE * (y + 0.5) - Start.PEGMAN_HEIGHT / 2 - 8);
  var clipRect = document.getElementById('clipRect');
  clipRect.setAttribute('x', x * Start.SQUARE_SIZE + 1);
  clipRect.setAttribute('y', pegmanIcon.getAttribute('y'));
  pegmanIcon.style.display = 'none';
};
Start.pathIDs = [];
Start.deletePath = function() {
  if(Start.pathIDs.length != 0){
    if(document.getElementById('finishcopy'))
      document.getElementById('finishcopy').remove(document.getElementById('finishcopy').selectedIndex);
    if(document.getElementById('startcopy'))
      document.getElementById('startcopy').remove(document.getElementById('startcopy').selectedIndex);
    for(var i= 0; i<Start.pathIDs.length; i++ ){
      var x = document.getElementById(Start.pathIDs[i]);
      x.remove(x.selectedIndex);
    }
    Start.pathIDs = [];
  }
}
Start.clonepegman = function() {
  if(document.getElementById('pegmanCopy'))
    document.getElementById('pegmanCopy').remove(document.getElementById('pegmanCopy').selectedIndex);
  var svg = document.getElementById('svgStart');
  var newPegman = document.getElementById('pegman').cloneNode(true);
  newPegman.id = "pegmanCopy";
  newPegman.style.display = 'initial';
  svg.appendChild(newPegman);
}
Start.showPath = function(x, y, d) {
  var svg = document.getElementById('svgStart');
  // alert(d);
  var valueX;
  var valueY;
  if(d == 4){
    valueX = 0;
    valueY = +Start.SQUARE_SIZE / 28;
  }
  else if (d == 2) {
    valueX = -Start.SQUARE_SIZE / 16;
    valueY = Start.SQUARE_SIZE / 4;
  }
  else if (d == 1) {
    valueX = -Start.SQUARE_SIZE / 20;
    valueY = +Start.SQUARE_SIZE / 6;
  }
  else if (d == 3) {
    valueX = -Start.SQUARE_SIZE / 20;
    valueY = +Start.SQUARE_SIZE / 5;
  }
  else if (d == 0) {
    valueX =  -Start.SQUARE_SIZE / 28;
    valueY = 0;
  }
  else if (d == 5) {
    valueX = -Start.SQUARE_SIZE / 30;
    valueY = Start.SQUARE_SIZE / 5;
  }
  else if (d == 6) {
    valueX = -Start.SQUARE_SIZE / 30;
    valueY = Start.SQUARE_SIZE / 5;
  }
  else if (d == 7) {
    valueX = -Start.SQUARE_SIZE / 30;
    valueY = +Start.SQUARE_SIZE / 5;
  }

        var tileClip = Blockly.utils.dom.createSvgElement('clipPath', {
            'id': 'tileClipPath' + y.toString() + '' + x.toString()
          }, svg);

        Blockly.utils.dom.createSvgElement('rect', {
            'height': Start.SQUARE_SIZE,
            'width': Start.SQUARE_SIZE,
            'x': x * Start.SQUARE_SIZE + valueX,
            'y': y * Start.SQUARE_SIZE + valueY
          }, tileClip);
        var tile = Blockly.utils.dom.createSvgElement('image', {
            'id': 'ID:' + y.toString() + ',' + x.toString(),
            'height': Start.SQUARE_SIZE,
            'width': Start.SQUARE_SIZE ,
            'clip-path': 'url(#tileClipPath' + y.toString() +'' + x.toString() + ')',
            'x': x * Start.SQUARE_SIZE + valueX,
            'y': y * Start.SQUARE_SIZE + valueY
          }, svg);
          Start.pathIDs.push('ID:' + y.toString() + ',' + x.toString());
        tile.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
            'start/Path0' + d.toString() +'.png');
 }

/**
 * Display the look icon at Pegman's current location,
 * in the specified direction.
 * @param {!Start.DirectionType} d Direction (0 - 3).
 */
Start.scheduleLook = function(d) {
  var x = Start.pegmanX;
  var y = Start.pegmanY;
  switch (d) {
    case Start.DirectionType.NORTH:
      x += 0.5;
      break;
    case Start.DirectionType.NORTHEAST:
      x +=0.5
      y -= 0.5;
      break;
    case Start.DirectionType.EAST:
      x += 1;
      y += 0.5;
      break;
    case Start.DirectionType.SOUTHEAST:
      x +=0.5
      y += 0.5;
      break;
    case Start.DirectionType.SOUTH:
      x += 0.5;
      y += 1;
      break;
    case Start.DirectionType.SOUTHWEST:
      x -=0.5
      y += 0.5;
      break;
    case Start.DirectionType.WEST:
      y += 0.5;
      break;
    case Start.DirectionType.NORTHWEST:
      x -=0.5
      y -= 0.5;
      break;
  }
  x *= Start.SQUARE_SIZE;
  y *= Start.SQUARE_SIZE;
  var deg = d * 90 - 45;

  var lookIcon = document.getElementById('look');
  lookIcon.setAttribute('transform',
      'translate(' + x + ', ' + y + ') ' +
      'rotate(' + deg + ' 0 0) scale(.4)');
  var paths = lookIcon.getElementsByTagName('path');
  lookIcon.style.display = 'inline';
  for (var i = 0, path; (path = paths[i]); i++) {
    Start.scheduleLookStep(path, Start.stepSpeed * i);
  }
};

/**
 * Schedule one of the 'look' icon's waves to appear, then disappear.
 * @param {!Element} path Element to make appear.
 * @param {number} delay Milliseconds to wait before making wave appear.
 */
Start.scheduleLookStep = function(path, delay) {
  Start.pidList.push(setTimeout(function() {
    path.style.display = 'inline';
    setTimeout(function() {
      path.style.display = 'none';
    }, Start.stepSpeed * 2);
  }, delay));
};

/**
 * Keep the direction within 0-4, wrapping at both ends.
 * @param {number} d Potentially out-of-bounds direction value.
 * @return {number} Legal direction value.
 */
Start.constrainDirection4 = function(d) {
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
Start.constrainDirection16 = function(d) {
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
 * @throws {true} If the end of the start is reached.
 * @throws {false} If Pegman collides with a wall.
 */
Start.move = function(direction, id) {
  if(!Start.prevlog.has(id))
  {
    if (!Start.isPath(direction, null)) {
      Start.log.push(['fail_' + (direction ? 'backward' : 'forward'), id]);
      throw false;
    }
    // If moving backward, flip the effective direction.
    var effectiveDirection = Start.pegmanDcheck + direction;
    var command;
    switch (Start.constrainDirection4(effectiveDirection)) {
      case Start.DirectionType.NORTH:
        Start.pegmanYcheck--;
        command = 'north';
        break;
      case Start.DirectionType.NORTHEAST:
      Start.pegmanXcheck++;
      Start.pegmanYcheck--;
      command = 'northeast';
      break;
      case Start.DirectionType.EAST:
        Start.pegmanXcheck++;
        command = 'east';
        break;
      case Start.DirectionType.SOUTHEAST:
      Start.pegmanXcheck++;
      Start.pegmanYcheck++;
      command = 'southeast';
      break;
      case Start.DirectionType.SOUTH:
        Start.pegmanYcheck++;
        command = 'south';
        break;
      case Start.DirectionType.SOUTHWEST:
      Start.pegmanXcheck--;
      Start.pegmanYcheck++;
      command = 'southwest';
      break;
      case Start.DirectionType.WEST:
        Start.pegmanXcheck--;
        command = 'west';
        break;
        case Start.DirectionType.NORTHWEST:
        Start.pegmanXcheck--;
        Start.pegmanYcheck--;
        command = 'northwest';
        break;
    }
  // }
  Start.log.push([command, id]);
  }
};

/**
 * Turn pegman left or right.
 * @param {number} direction Direction to turn (0 = left, 1 = right).
 * @param {string} id ID of block that triggered this action.
 */
Start.turn = function(direction, id) {
  if(!Start.prevlog.has(id)) {
    switch (direction)
    {
      case 0:
        Start.pegmanDcheck = 2;
        Start.log.push(['North',id]);
        break;
      case 1:
        Start.pegmanDcheck = 1;
        Start.log.push(['NorthEast',id]);
        break;
      case 2:
        Start.pegmanDcheck = 0;
        Start.log.push(['East',id]);
        break;
      case 3:
        Start.pegmanDcheck = 7;
        Start.log.push(['SouthEast',id]);
        break;
      case 4:
        Start.pegmanDcheck = 6;
        Start.log.push(['South',id]);
        break;
      case 5:
        Start.pegmanDcheck = 5;
        Start.log.push(['SouthWest',id]);
        break;
      case 6:
        Start.pegmanDcheck = 4;
        Start.log.push(['West',id]);
        break;
      case 7:
        Start.pegmanDcheck = 3;
        Start.log.push(['NorthWest',id]);
        break;
    }
  }
  Start.pegmanDcheck = Start.constrainDirection4(Start.pegmanDcheck);
};

/**
 * Is there a path next to pegman?
 * @param {number} direction Direction to look
 *     (0 = forward, 1 = right, 2 = backward, 3 = left).
 * @param {?string} id ID of block that triggered this action.
 *     Null if called as a helper function in Start.move().
 * @return {boolean} True if there is a path.
 */
Start.isPath = function(direction, id) {
  if(!Start.prevlog.has(id))
  {
    var effectiveDirection = Start.pegmanDcheck + direction;
    var square;
    var command;
    switch (Start.constrainDirection4(effectiveDirection)) {
      case Start.DirectionType.NORTH:
        square = Start.map[Start.pegmanYcheck - 1] &&
            Start.map[Start.pegmanYcheck - 1][Start.pegmanXcheck];
        command = 'look_north';
        break;
      case Start.DirectionType.NORTHEAST:
        square = Start.map[Start.pegmanYcheck - 1] &&
            Start.map[Start.pegmanYcheck - 1][Start.pegmanXcheck + 1];
        command = 'look_northeast';
        break;
      case Start.DirectionType.EAST:
        square = Start.map[Start.pegmanYcheck][Start.pegmanXcheck + 1];
        command = 'look_east';
        break;
      case Start.DirectionType.SOUTHEAST:
        square = Start.map[Start.pegmanYcheck + 1] &&
            Start.map[Start.pegmanYcheck + 1][Start.pegmanXcheck + 1];
        command = 'look_southeast';
        break;
      case Start.DirectionType.SOUTH:
        square = Start.map[Start.pegmanYcheck + 1] &&
            Start.map[Start.pegmanYcheck + 1][Start.pegmanXcheck];
        command = 'look_south';
        break;
      case Start.DirectionType.SOUTHWEST:
        square = Start.map[Start.pegmanYcheck + 1] &&
            Start.map[Start.pegmanYcheck + 1][Start.pegmanXcheck - 1];
        command = 'look_southwest';
        break;
      case Start.DirectionType.WEST:
        square = Start.map[Start.pegmanYcheck][Start.pegmanXcheck - 1];
        command = 'look_west';
        break;
      case Start.DirectionType.NORTHWEST:
        square = Start.map[Start.pegmanYcheck - 1] &&
            Start.map[Start.pegmanYcheck - 1][Start.pegmanXcheck - 1];
        command = 'look_northwest';
        break;
    }
  }
  if(square !== Start.SquareType.WALL && square !== undefined)
  Start.checkPositionch();
  if (id) {
    Start.log.push([command, id]);
  }
  return square !== Start.SquareType.WALL && square !== undefined;
};

/**
 * Is the player at the finish marker?
 * @return {boolean} True if not done, false if done.
 */
Start.notDone = function() {
  return Start.pegmanXcheck != Start.finish_.x || Start.pegmanYcheck != Start.finish_.y || (!(Start.coinscollectedcheck == 3 || Start.coinscollected == 3)) ;
};

Start.showHelp = function() {
  var help = document.getElementById('help');
  var button = document.getElementById('helpButton');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };
  BlocklyDialogs.showDialog(help, button, true, true, style, Start.hideHelp);
  BlocklyDialogs.startDialogKeyDown();
};

/**
 * Hide the help pop-up.
 */
Start.hideHelp = function() {
  BlocklyDialogs.stopDialogKeyDown();
};

Start.questionsquiz = function(val) {
  var content = document.getElementById('Quiz');
  var style = {
    width: '40%',
    left: '50%',
    top: '3em'
  };
  // alert(Start.pathlength);
  // Add the user's code.
    var linesText = document.getElementById('dialogLinesText1');
    linesText.textContent = '';
  var text = 'What is the length of the path traveled by the character (Given length of each block is 1 * 1) \n Assume 2^½ = 1.4';
    linesText.appendChild(document.createTextNode(text));

var text = "Sorry you entered wrong answer please try again!"
  var cancel = document.getElementById('doneSubmit1');
  cancel.addEventListener('click', Start.checkinput);
  // cancel.addEventListener('touchend', BlocklyDialogs.checkinput, val);
  var ok = document.getElementById('doneOk1');
  ok.style.display = "none";
  ok.addEventListener('click', Start.congratulations, true);
  ok.addEventListener('touchend', Start.congratulations, true);

  BlocklyDialogs.showDialog(content, null, false, true, style,
      function() {
        document.body.removeEventListener('keydown',
            Start.congratulationsKeyDown1, true);
        });
  document.body.addEventListener('keydown',
      Start.congratulationsKeyDown1, true);
  document.getElementById('dialogDoneText1').style.display = "none";
  document.getElementById('dialogDoneText1').textContent = text;
};
Start.checkinput = function(){
  if(document.getElementById('containerCode1').value == (Start.pathlength - 1))
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
Start.congratulationsKeyDown1 = function(e) {
  if (e.keyCode == 13 ||
      e.keyCode == 27 ||
      e.keyCode == 32) {
    // BlocklyDialogs.hideDialog(true);
    e.stopPropagation();
    e.preventDefault();
    // if (e.keyCode != 27) {
    //   setTimeout(function() {
    //     BlocklyInterface.nextLevel();
    //   }, Start.stepSpeed * (Start.timevalue + 6000));
    // }
  }
};

Start.congratulations = function() {
  var content = document.getElementById('dialogDone');
  var style = {
    width: '40%',
    left: '30%',
    top: '3em'
  };

  // Add the user's code.
  if (BlocklyInterface.workspace) {
    var linesText = document.getElementById('dialogLinesText');
    linesText.textContent = '';
    var code = BlocklyInterface.executedJsCode;
    code = BlocklyInterface.stripCode(code);
    var noComments = code.replace(/\/\/[^\n]*/g, '');  // Inline comments.
    noComments = noComments.replace(/\/\*.*\*\//g, '');  /* Block comments. */
    noComments = noComments.replace(/[ \t]+\n/g, '\n');  // Trailing spaces.
    noComments = noComments.replace(/\n+/g, '\n');  // Blank lines.
    noComments = noComments.trim();
    var lineCount = noComments.split('\n').length;
    var pre = document.getElementById('containerCode');
    pre.textContent = code;
    if (typeof prettyPrintOne == 'function') {
      code = pre.innerHTML;
      code = prettyPrintOne(code, 'js');
      pre.innerHTML = code;
    }
    if (lineCount == 1) {
      var text = BlocklyGames.getMsg('Games_linesOfCode1');
    } else {
      var text = BlocklyGames.getMsg('Games_linesOfCode2')
          .replace('%1', String(lineCount));
    }
    linesText.appendChild(document.createTextNode(text));
  }

  var text = 'Are you ready for next level?';
  // var cancel = document.getElementById('doneCancel');
  // cancel.addEventListener('click', BlocklyDialogs.hideDialog, true);
  // cancel.addEventListener('touchend', BlocklyDialogs.hideDialog, true);
  var ok = document.getElementById('doneOk');
  ok.addEventListener('click', Start.boyenteringcircus, true);
  ok.addEventListener('touchend', Start.boyenteringcircus, true);

  BlocklyDialogs.showDialog(content, null, false, true, style,
      function() {
        document.body.removeEventListener('keydown',
            Start.congratulationsKeyDown, true);
        });
  document.body.addEventListener('keydown',
      Start.congratulationsKeyDown, true);

  document.getElementById('dialogDoneText').textContent = text;
};

Start.congratulationsKeyDown = function(e) {
  if (e.keyCode == 13 ||
      e.keyCode == 27 ||
      e.keyCode == 32) {
    // BlocklyDialogs.hideDialog(true);
    e.stopPropagation();
    e.preventDefault();
    if (e.keyCode != 27) {
      Start.boyenteringcircus();
    }
  }
};
Start.storymessage = function (){
  var text1 = "Welcome to the Beginning of this treasure hunt game!!";
  var text2 = "Before the start of each level you will see the set of instructions written down in the old book \"Treasure Hunt\". Follow the instructions carefully to find the treasure box.";
  var text3 = "In the first level you are outside your house to go in search of treasure box. The first instruction is to collect all the coins you find in the ground and go to the circus.";
  var text4 = "(Quick tip : Use help commands whenever you are stuck on what to do!!)";
  document.getElementById('p1').textContent = text1;
  document.getElementById('p2').textContent = text2;
  document.getElementById('p3').textContent = text3;
  document.getElementById('p4').textContent = text4;
  document.getElementById('p2').style.top = document.getElementById('p1').offsetTop + document.getElementById('p1').offsetHeight + 'px';
  document.getElementById('p3').style.top = document.getElementById('p2').offsetTop + document.getElementById('p2').offsetHeight + 'px';
  function startlevel (){
    Start.init();
    document.getElementById('storyMessage').style.display = 'none';
  };
  document.getElementById('cross').addEventListener("click",startlevel);
  document.getElementById('cross').addEventListener("touchend",startlevel);
};
window.addEventListener('load', Start.storymessage);
