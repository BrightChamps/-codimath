/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Ocean game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Ocean');

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
goog.require('Ocean.Blocks');
goog.require('Ocean.soy');


BlocklyGames.NAME = 'ocean';

/**
 * Go to the next level.  Add skin parameter.
 * @suppress {duplicate}
 */
Ocean.MAX_BLOCKS = [undefined, // Level 0.
    Infinity, Infinity, 2, 5, 5, 5, 5, 10, 7, 10][BlocklyGames.LEVEL];

// Crash type constants.
Ocean.CRASH_STOP = 1;
Ocean.CRASH_SPIN = 2;
Ocean.CRASH_FALL = 3;

Ocean.SKINS = [
  // sprite: A 1029x51 set of 21 avatar images.
  // tiles: A 250x200 set of 20 map images.
  // marker: A 20x34 goal image.
  // background: An optional 400x450 background image, or false.
  // look: Colour of sonar-like look icon.
  // winSound: List of sounds (in various formats) to play when the player wins.
  // crashSound: List of sounds (in various formats) for player crashes.
  // crashType: Behaviour when player crashes (stop, spin, or fall).
  {
    sprite: 'ocean/pegman.png',
    idlesprite: 'ocean/Idle.png',
    tiles: 'ocean/tiles_path.png',
    emptytiles : 'ocean/empty.png',
    oceanmarker: 'ocean/empty.png',
    marker: 'ocean/empty.png',
    island: 'ocean/islandmarker.png',
    stone: 'ocean/stonemarker.png',
    background: 'ocean/beachF2.png',
    backgroundwater: 'ocean/empty.png',
    scene:'ocean/scene.jpg',
    look: '#000',
    coin: 'ocean/coin-sprite.png',
    winSound: ['ocean/win.mp3', 'ocean/win.ogg'],
    crashSound: ['ocean/fail_pegman.mp3', 'ocean/fail_pegman.ogg'],
    crashType: Ocean.CRASH_STOP
  },
  {
    sprite: 'ocean/astro.png',
    tiles: 'ocean/tiles_astro.png',
    marker: 'ocean/marker.png',
    background: 'ocean/bg_astro.jpg',
    island: 'ocean/islandmarker.png',
    stone: 'ocean/stonemarker.png',
    // Coma star cluster, photo by George Hatfield, used with permission.
    look: '#fff',
    coin: 'ocean/coin.png',
    winSound: ['ocean/win.mp3', 'ocean/win.ogg'],
    crashSound: ['ocean/fail_astro.mp3', 'ocean/fail_astro.ogg'],
    crashType: Ocean.CRASH_SPIN
  },
  {
    sprite: 'ocean/panda.png',
    tiles: 'ocean/tiles_panda.png',
    marker: 'ocean/marker.png',
    island: 'ocean/islandmarker.png',
    background: 'ocean/bg_panda.jpg',
    stone: 'ocean/stonemarker.png',
    // Spring canopy, photo by Rupert Fleetingly, CC licensed for reuse.
    look: '#000',
    coin: 'ocean/coin.png',
    winSound: ['ocean/win.mp3', 'ocean/win.ogg'],
    crashSound: ['ocean/fail_panda.mp3', 'ocean/fail_panda.ogg'],
    crashType: Ocean.CRASH_FALL
  }
];
Ocean.SKIN_ID = BlocklyGames.getNumberParamFromUrl('skin', 0, Ocean.SKINS.length);
Ocean.SKIN = Ocean.SKINS[Ocean.SKIN_ID];

/**
 * Milliseconds between each animation frame.
 */
Ocean.stepSpeed;

// BlocklyGames.coinval = 100;

/**
 * The types of squares in the ocean, which is represented
 * as a 2D array of SquareType values.
 * @enum {number}
 */
Ocean.SquareType = {
  WALL: 0,
  OPEN: 1,
  START: 2,
  COINPOS: 3,
  FINISH: 4
};

// The ocean square constants defined above are inlined here
// for ease of reading and writing the static oceans.
Ocean.map = [
// Level 0.
 undefined,
// Level 1.
 [[1, 1, 1, 0, 0, 0],
  [1, 1, 4, 1, 0, 0],
  [0, 1, 1, 1, 1, 1],
  [0, 0, 0, 1, 1, 1],
  [0, 0, 0, 0, 1, 2]],
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
 * Note, the path continues past the ocean and the goal in both directions.
 * This is intentionally done so users see the ocean is about getting from
 * the ocean to the goal and not necessarily about moving over every part of
 * the ocean, 'mowing the lawn' as Neil calls it.
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
 * Measure ocean dimensions and set sizes.
 * ROWS: Number of tiles down.
 * COLS: Number of tiles across.
 * SQUARE_SIZE: Pixel height and width of each ocean square (i.e. tile).
 */
Ocean.ROWS = Ocean.map.length;
Ocean.COLS = Ocean.map[0].length;
Ocean.SQUARE_SIZE = (200);
Ocean.PEGMAN_HEIGHT = 80;
Ocean.PEGMAN_WIDTH = 80;
// console.log(Ocean.ROWS + ',' + Ocean.COLS);
// console.log(Ocean.MAZE_WIDTH + ',' + Ocean.MAZE_HEIGHT);
Ocean.PATH_WIDTH = Ocean.SQUARE_SIZE / 3;
Ocean.factorX = window.innerWidth;
Ocean.factorY = window.innerHeight;
var temp = Ocean.factorX / 2133 > Ocean.factorY/ 1084 ? Ocean.factorY/ 1084 : Ocean.factorX / 2133;

/**
 * Constants for cardinal directions.  Subsequent code assumes these are
 * in the range 0..3 and that opposites have an absolute difference of 2.
 * @enum {number}
 */
Ocean.DirectionType = {
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
Ocean.ResultType = {
  UNSET: 0,
  SUCCESS: 1,
  FAILURE: -1,
  TIMEOUT: 2,
  ERROR: -2
};

/**
 * Result of last execution.
 */
Ocean.result = Ocean.ResultType.UNSET;

/**
 * Oceaning direction.
 */
Ocean.oceanDirection = Ocean.DirectionType.NORTHEAST;

/**
 * PIDs of animation tasks currently executing.
 */
Ocean.pidList = [];

Ocean.tile_SHAPES = {
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
Ocean.drawMap = function() {
  var svg = document.getElementById('svgOcean');
  var scale = Math.min(Ocean.ROWS, Ocean.COLS) * Ocean.SQUARE_SIZE;
  // svg.setAttribute('viewBox', '0 0 ' + scale + ' ' + scale);
  svg.style.width = Ocean.MAZE_WIDTH + 'px';
  svg.style.height = Ocean.MAZE_HEIGHT + 'px';
  svg.setAttribute('viewBox', '0 0 ' + Ocean.MAZE_WIDTH + ' ' + Ocean.MAZE_HEIGHT);
  // Draw the outer square.
  Blockly.utils.dom.createSvgElement('rect', {
      'height': Ocean.MAZE_HEIGHT,
      'width': Ocean.MAZE_WIDTH,
      'fill': '#F1EEE7',
      'stroke-width': 1,
      'stroke': '#CCB'
    }, svg);

  var bgwaterClip = Blockly.utils.dom.createSvgElement('clipPath', {
      'id': 'bgwaterClipPath'
    }, svg);
  Blockly.utils.dom.createSvgElement('rect', {
      'height': Ocean.MAZE_HEIGHT / 2,
      'width': Ocean.MAZE_WIDTH,
      'x': 0,
      'y': Ocean.MAZE_HEIGHT / 2
    }, bgwaterClip);

  var tile = Blockly.utils.dom.createSvgElement('image', {
      'id' : 'backgroundwater',
      'height': Ocean.MAZE_HEIGHT,
      'width': Ocean.MAZE_WIDTH * 50,
      // 'y': 0,
      // 'x':   1 * Ocean.SQUARE_SIZE  - 7 * Ocean.SQUARE_SIZE + 1,
      'clip-path': 'url(#bgwaterClipPath)'
    }, svg);
  tile.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      Ocean.SKIN.backgroundwater);
    var normalize = function(x, y) {
      if (x < 0 || x >= Ocean.COLS || y < 0 || y >= Ocean.ROWS) {
        return '0';
      }
      return (Ocean.map[y][x] == Ocean.SquareType.WALL) ? '0' : '1';
    };
  //
    var bgClip = Blockly.utils.dom.createSvgElement('clipPath', {
        'id': 'bgClipPath'
      }, svg);
    Blockly.utils.dom.createSvgElement('rect', {
        'height': Ocean.MAZE_HEIGHT,
        'width': Ocean.MAZE_WIDTH,
        'x': 0,
        'y': 0
      }, bgClip);

    var tile = Blockly.utils.dom.createSvgElement('image', {
        'id' : 'background',
        'height': Ocean.MAZE_HEIGHT ,
        'width': Ocean.MAZE_WIDTH,
        'x': 0 ,
        'y': 0,
        'clip-path': 'url(#bgClipPath)'
      }, svg);
    tile.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
        Ocean.SKIN.background);
  var x = 2.45 * Ocean.SQUARE_SIZE;
  var y = 1.2 * Ocean.SQUARE_SIZE;
  Blockly.utils.dom.createSvgElement('path', {
          'id': 'canvasPaper',
        }, svg);
  var canvaspaper = document.getElementById('canvasPaper');
  canvaspaper.setAttribute('d','M' + x +',' + y + 'L' + (x + Ocean.SQUARE_SIZE/4) +',' + (y+Ocean.SQUARE_SIZE/4) + 'L' + (x- Ocean.SQUARE_SIZE/16) +',' + (y+Ocean.SQUARE_SIZE/2.5) + 'L' + (x - Ocean.SQUARE_SIZE/3.9) +',' + (y + Ocean.SQUARE_SIZE/8) +'  Z');
  canvaspaper.style.stroke = 'white';
  canvaspaper.style.strokeWidth = '5';
  canvaspaper.style.fill = 'white';
  // canvaspaper.style.transformOrigin = "50% 50%";
  // canvaspaper.style.transform = "rotate(-100deg)";

  var finishMarker = Blockly.utils.dom.createSvgElement('image', {
      'id': 'finish',
      'height': 180 * BlocklyGames.factor,
      'width': 180 * BlocklyGames.factor
    }, svg);
  finishMarker.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      Ocean.SKIN.marker);

  var oceanMarker = Blockly.utils.dom.createSvgElement('image', {
      'id': 'ocean',
      'height': 180 * BlocklyGames.factor,
      'width': 180 * BlocklyGames.factor
    }, svg);
  oceanMarker.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      Ocean.SKIN.oceanmarker);


  // Pegman's clipPath element, whose (x, y) is reset by Ocean.displayPegman
  var pegmanClip = Blockly.utils.dom.createSvgElement('clipPath', {
      'id': 'pegmanClipPath'
    }, svg);
  Blockly.utils.dom.createSvgElement('rect', {
      'id': 'clipRect',
      'height': Ocean.PEGMAN_HEIGHT,
      'width': Ocean.PEGMAN_WIDTH
    }, pegmanClip);

  // Add Pegman.
  var pegmanIcon = Blockly.utils.dom.createSvgElement('image', {
      'id': 'pegman',
      'height': Ocean.PEGMAN_HEIGHT,
      'width': Ocean.PEGMAN_WIDTH * 16, // 49 * 21 = 1029
      'clip-path': 'url(#pegmanClipPath)'
    }, svg);
  pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      Ocean.SKIN.idlesprite);
//
};

Ocean.changeView = function() {
  document.getElementById('miniloader').style.display = 'initial';
  window.miniloader();
  BlocklyDialogs.hideDialog(true);
  Ocean.hidecoords = true;
  Ocean.canvasctx.clearRect(0, 0, Ocean.canvasctx.canvas.width, Ocean.canvasctx.canvas.height);
  var img = new Image();
  img.src = 'ocean/scene.jpg';
  setTimeout(function(){
    Ocean.canvasctx.drawImage(img,0,0);
    Ocean.waterstart = 'true';
    Ocean.animateWaterE2W();
    var text = "Use Sail command to sail the yatch until it reaches an island, further use logic block to avaoid obstacles in the path of the boat in a repeat until loop.";
    document.getElementById('helptext').innerHTML = text;
    Ocean.showHelp();
  },2000);
};

Ocean.animateWaterE2W = function() {
  // document.getElementById('background').style.display = 'none';
  var image = new Image();
  image.src = 'ocean/scene.png';
  Ocean.canvasctx.drawImage(image,0,0);
  var video = document.getElementById('video');
  video.style.width = Ocean.canvasctx.canvas.width + "px";
  video.style.height = Ocean.canvasctx.canvas.height + "px";
  video.addEventListener('play', function() {
  video.style.display = "none";
  var img = new Image();
  img.src = 'ocean/sky.jpg';
  var img1 = new Image();
  img1.src = 'ocean/stonemarker.png';
  var img2 = new Image();
  img2.src = 'ocean/beachstart.png';
  var img3 = new Image();
  img3.src = 'ocean/yatch.png';
  var img4 = new Image();
  img4.src = 'ocean/0230.png';
  var img5 = new Image();
  img5.src = 'ocean/islandfinal.png';
  var left = Ocean.canvasctx.canvas.width/2 - 100;
  var no = 0;
  var top;
  top = Ocean.canvasctx.canvas.height - 200 - 2.4*no;
  var islandtop = Ocean.canvasctx.canvas.height - (485 + 1.8 * no + 0.43 * no);
    var $this = this; //cache
    (function loop() {
      if (!$this.paused && !$this.ended) {
        Ocean.canvasctx.drawImage($this, 0, 0 , Ocean.canvasctx.canvas.width, Ocean.canvasctx.canvas.height);
        Ocean.canvasctx.drawImage(img2, 0, 7 * no, Ocean.canvasctx.canvas.width, Ocean.canvasctx.canvas.height);
        Ocean.canvasctx.drawImage(img,0,0 + 0.45*no,6000, 4000 - 0.45*no,0,0,Ocean.canvasctx.canvas.width, Ocean.canvasctx.canvas.height - (485 + 0.43 * no++));
        Ocean.canvasctx.drawImage(img5, 400 - 2*no,410, 200 + 6*no, 2.95*no, 400 - 2.01 * no, islandtop, 200 + 6*no, 1.8 * no);
        Ocean.canvasctx.drawImage(img1,Ocean.canvasctx.canvas.width * 0.5,Ocean.canvasctx.canvas.height * 0.55 + 0.2 * no,(0 + 0.7 * no), (0 + 0.7 * no));
        // Ocean.boatanimation(no, Ocean.left);
        // console.log(no);
        top = Ocean.canvasctx.canvas.height - 200 - 2*no;
        if(no<195)
          islandtop =  Ocean.canvasctx.canvas.height - (485 + 1.8 * no + 0.43 * no);
        Ocean.canvasctx.drawImage(img3, left, top, 200, 200);
        if(Ocean.isnear(no)){
          if(Ocean.driftpath == 'left'){
            left -= 2;
            BlocklyInterface.highlight(Ocean.highlightlogdrift[0][1]);
          }
          else if( Ocean.driftpath == 'right'){
            left += 5;
            BlocklyInterface.highlight(Ocean.highlightlogdrift[0][1]);
          }
          else if(top <= Ocean.canvasctx.canvas.height * 0.55 + 0.2 * no + 50)
          {
            BlocklyInterface.highlight(null);
            document.getElementById('video').pause();
            Ocean.animationended = true;
          }
        }
        else{
          if(Math.round(left) != Math.round(Ocean.canvasctx.canvas.width/2 - 100) && Ocean.driftbackpath == 'true')
          {
            left += (-left + Ocean.canvasctx.canvas.width/2 - 100) * 0.2;
            Ocean.canvasctx.drawImage(img1,Ocean.canvasctx.canvas.width * 0.5,Ocean.canvasctx.canvas.height * 0.55 + 0.2 * no,(0 + 0.7 * no), (0 + 0.7 * no));
            BlocklyInterface.highlight(Ocean.highlightlogback[0][1]);
          }
          else {
            BlocklyInterface.highlight(Ocean.sailblock[0][1]);
          }
        }
        setTimeout(loop, 1000 / 10); // drawing at 30fps
      }
      else if($this.ended) {
        document.getElementById('miniloader').style.display = 'initial';
        window.miniloader();
        BlocklyInterface.highlight(null);
        Ocean.animationended = true;
        setTimeout(Ocean.caveenteringanimation,2000.01);
      }
    })();
  }, 0);
};

Ocean.isnear = function(no){
  if(Ocean.canvasctx.canvas.height - 100 - 2*no > Ocean.canvasctx.canvas.height * 0.55 + 0.2 * no)
    Ocean.isRock = true;
  if(Ocean.canvasctx.canvas.height - 200 - 2*no > Ocean.canvasctx.canvas.height * 0.55 + 0.2 * no)
    { return false;}
  else if(Ocean.canvasctx.canvas.height - 200 - 2*no + 150 < Ocean.canvasctx.canvas.height * 0.55 + 0.2 * no)
    {return false;}
  else
    return true;
};
Ocean.caveenteringanimation = function(){
  Ocean.canvasctx.clearRect(0,0,1200,1000);
  var video = document.getElementById('video2');
  video.style.width = Ocean.canvasctx.canvas.width + "px";
  video.style.height = Ocean.canvasctx.canvas.height + "px";
  document.getElementById('video2').play();
  video.addEventListener('play', function() {
  // video.style.display = "none";
    var $this = this; //cache
    (function loop() {
      if (!$this.paused && !$this.ended) {
        Ocean.canvasctx.drawImage($this, 0, 0 , Ocean.canvasctx.canvas.width, Ocean.canvasctx.canvas.height);
        setTimeout(loop, 1000 / 10); // drawing at 30fps
      }
      else if($this.ended) {
        BlocklyDialogs.congratulations();
      }
    })();
  }, 0);
};

/**
 * Initialize Blockly and the ocean.  Called on page load.
 */
Ocean.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Ocean.soy.ocean({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       skin: Ocean.SKIN_ID,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init();
  // Setup the Pegman menu.
  var pegmanImg = document.querySelector('#pegmanButton>img');
  pegmanImg.style.backgroundImage = 'url(' + Ocean.SKIN.sprite + ')';
  var pegmanMenu = document.getElementById('pegmanMenu');
  var handlerFactory = function(n) {
    return function() {
      Ocean.changePegman(n);
    };
  };
  for (var i = 0; i < Ocean.SKINS.length; i++) {
    if (i == Ocean.SKIN_ID) {
      continue;
    }
    var div = document.createElement('div');
    var img = document.createElement('img');
    img.src = 'common/1x1.gif';
    img.style.backgroundImage = 'url(' + Ocean.SKINS[i].sprite + ')';
    div.appendChild(img);
    pegmanMenu.appendChild(div);
    Blockly.bindEvent_(div, 'mousedown', null, handlerFactory(i));
  }
  Blockly.bindEvent_(window, 'resize', null, Ocean.hidePegmanMenu);
  var pegmanButton = document.getElementById('pegmanButton');
  Blockly.bindEvent_(pegmanButton, 'mousedown', null, Ocean.showPegmanMenu);
  var pegmanButtonArrow = document.getElementById('pegmanButtonArrow');
  var arrow = document.createTextNode(Blockly.FieldDropdown.ARROW_CHAR);
  pegmanButtonArrow.appendChild(arrow);

  var rtl = BlocklyGames.isRtl();
  Ocean.SQUARE_SIZE = Ocean.SQUARE_SIZE * BlocklyGames.factor;
  Ocean.MAZE_WIDTH = Ocean.SQUARE_SIZE * Ocean.COLS;
  Ocean.MAZE_HEIGHT = Ocean.SQUARE_SIZE * Ocean.ROWS;
  Ocean.PEGMAN_HEIGHT = 200 * BlocklyGames.factor;
  Ocean.PEGMAN_WIDTH = 200 * BlocklyGames.factor;

  var blocklyDiv = document.getElementById('blockly');
  var visualization = document.getElementById('visualization');
  var top = visualization.offsetTop;
  var buttontable = document.getElementById('buttontable');

  var onresize = function(e) {
    var top = visualization.offsetTop;
    blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
    blocklyDiv.style.left = rtl ? '10px' : (Ocean.MAZE_WIDTH + 20) + 'px';
    blocklyDiv.style.width = (window.innerWidth - (Ocean.MAZE_WIDTH + 40)) + 'px';
    blocklyDiv.style.paddingBottom = 10 * BlocklyGames.factor + 'px';
    // blocklyDiv.style.display = 'none';
  buttontable.style.left = blocklyDiv.offsetLeft + 'px';
  buttontable.style.width = (window.innerWidth - (Ocean.MAZE_WIDTH + 40)) + 'px';
  buttontable.style.top = blocklyDiv.offsetTop + Ocean.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('runButton').style.left = blocklyDiv.offsetLeft + 'px';
  document.getElementById('runButton').style.top = blocklyDiv.offsetTop + Ocean.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('resetButton').style.left = document.getElementById('runButton').offsetLeft + document.getElementById('runButton').offsetWidth + 'px';
  document.getElementById('resetButton').style.top = blocklyDiv.offsetTop + Ocean.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('resetButton').style.marginRight = '0px';
  document.getElementById('resetOceanButton').style.left = document.getElementById('resetButton').offsetLeft + document.getElementById('resetButton').offsetWidth + 'px';
  document.getElementById('resetOceanButton').style.top = blocklyDiv.offsetTop + Ocean.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
  document.getElementById('resetOceanButton').style.marginRight = '0px';
  // document.getElementById('resetOceanButton').stye.display = 'none';
  };
  window.addEventListener('scroll', function() {
    onresize(null);
    Blockly.svgResize(BlocklyInterface.workspace);
    buttontable.style.left = blocklyDiv.offsetLeft + 'px';
    buttontable.style.width = (window.innerWidth - (Ocean.MAZE_WIDTH + 40)) + 'px';
    buttontable.style.top = blocklyDiv.offsetTop + Ocean.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('runButton').style.left = blocklyDiv.offsetLeft + 'px';
    document.getElementById('runButton').style.top = blocklyDiv.offsetTop + Ocean.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('resetButton').style.left = document.getElementById('runButton').offsetLeft + document.getElementById('runButton').offsetWidth + 'px';
    document.getElementById('resetButton').style.top = blocklyDiv.offsetTop + Ocean.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('resetButton').style.marginRight = '0px';
    document.getElementById('resetOceanButton').style.left = document.getElementById('resetButton').offsetLeft + document.getElementById('resetButton').offsetWidth + 'px';
    document.getElementById('resetOceanButton').style.top = blocklyDiv.offsetTop + Ocean.MAZE_HEIGHT - buttontable.offsetHeight + 'px';
    document.getElementById('resetOceanButton').style.marginRight = '0px';
    document.getElementById('resetOceanButton').stye.display = 'none';
  });
  window.addEventListener('resize', onresize);
  onresize(null);
  Ocean.SQUARE_SIZE = Ocean.SQUARE_SIZE / BlocklyGames.factor;
  Ocean.MAZE_WIDTH = Ocean.SQUARE_SIZE / Ocean.COLS;
  Ocean.MAZE_HEIGHT = Ocean.SQUARE_SIZE / Ocean.ROWS;
  Ocean.PEGMAN_HEIGHT = 200 / BlocklyGames.factor;
  Ocean.PEGMAN_WIDTH = 200 / BlocklyGames.factor;

  Ocean.SQUARE_SIZE = Ocean.SQUARE_SIZE * BlocklyGames.factor;
  Ocean.MAZE_WIDTH = Ocean.SQUARE_SIZE * Ocean.COLS;
  Ocean.MAZE_HEIGHT = Ocean.SQUARE_SIZE * Ocean.ROWS;
  Ocean.PEGMAN_HEIGHT = 200 * BlocklyGames.factor;
  Ocean.PEGMAN_WIDTH = 200 * BlocklyGames.factor;
  Ocean.PATH_WIDTH = Ocean.SQUARE_SIZE / 3;

  // Scale the workspace so level 1 = 1.3, and level 10 = 1.0.
  // var scale = 1 + (1 - (BlocklyGames.LEVEL / BlocklyGames.MAX_LEVEL)) / 3;
  var scale = 1;
  BlocklyInterface.injectBlockly(
      {'maxBlocks': Ocean.MAX_BLOCKS,
       'rtl': rtl,
       'trashcan': true,
       'zoom': {'oceanScale': scale}});
  BlocklyInterface.workspace.getAudioManager().load(Ocean.SKIN.winSound, 'win');
  BlocklyInterface.workspace.getAudioManager().load(Ocean.SKIN.crashSound, 'fail');
  // Not really needed, there are no user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('moveForward,moveBackward,' +
      'turnRight,turnLeft,isPathForward,isPathRight,isPathBackward,isPathLeft');

      var svg = document.getElementById('svgOcean');
      svg.style.width = Ocean.MAZE_WIDTH + 'px';
      svg.style.height = Ocean.MAZE_HEIGHT + 'px';
  Ocean.flowdire = -1;
  Ocean.passvalue = 0;
  Ocean.waterstop = false;
  document.getElementById('oceananimationdiv').style.width = Ocean.MAZE_WIDTH + 'px';
  document.getElementById('oceananimationdiv').style.height = Ocean.MAZE_HEIGHT + 'px';
  document.getElementById('canvasOcean').style.width = Ocean.MAZE_WIDTH + 'px';
  document.getElementById('canvasOcean').style.height = Ocean.MAZE_HEIGHT + 'px';
  document.getElementById('axies').style.width = Ocean.MAZE_WIDTH + 'px';
  document.getElementById('axies').style.height = Ocean.MAZE_HEIGHT + 'px';
  Ocean.renderAxies_();
  document.getElementById('canvasOcean').getContext('2d').drawImage(document.getElementById('axies'), 0, 0);
  Ocean.drawMap();
  var img = new Image();
  img.src = 'ocean/scene.png'
  Ocean.canvasctx = document.getElementById('canvasOcean').getContext('2d');
  Ocean.driftpath;
  Ocean.waterstart = 'false';
  var mloader = document.getElementById('miniloader');
  mloader.style.height = Ocean.MAZE_HEIGHT + 'px';
  mloader.style.width = Ocean.MAZE_WIDTH + 'px';
  mloader.style.left = visualization.offsetLeft + 'px';
  mloader.style.top = visualization.offsetTop + 'px';
  // Ocean.left = Ocean.canvasctx.canvas.width/2 - 100;
  // alert(Ocean.left);
  Ocean.driftbackpath = 'false';
  var pegmanIcon = document.getElementById('pegman');
  // pegmanIcon.style.display = "none";
  var runButton1 = document.getElementById('runButton');
  var resetButton1 = document.getElementById('resetButton');
  var resetOceanButton1 = document.getElementById('resetOceanButton');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton1.style.minWidth) {
    resetButton1.style.minWidth = runButton1.offsetWidth + 'px';
    resetOceanButton1.style.minWidth = runButton1.offsetWidth + 'px';
  }

  // BlocklyInterface.loadBlocks(defaultXml, false);

  // Locate the ocean and finish squares.
  for (var y = 0; y < Ocean.ROWS; y++) {
    for (var x = 0; x < Ocean.COLS; x++) {
      if (Ocean.map[y][x] == Ocean.SquareType.START) {
        Ocean.ocean_ = {x: x, y: y};
        Ocean.ocean1_ = {x: x, y: y};
      } else if (Ocean.map[y][x] == Ocean.SquareType.FINISH) {
        Ocean.finish_ = {x: x, y: y};
      }
    }
  }
  // Ocean.boyenteringcircus();
  // Ocean.coindisplay();
  // alert(Ocean.finish_.x);
  // alert(Ocean.finish_.y);

  // Ocean.levelHelp()
  Ocean.reset(true);
  // document.getElementById('oceananimationdiv').style.display = 'initial';
  // // Ocean.animateWaterE2W();
  // document.getElementById('svgOcean').style.display = 'none';
  BlocklyInterface.workspace.addChangeListener(function() {Ocean.updateCapacity();});

  document.body.addEventListener('mousemove', Ocean.updatePegSpin_, true);

  BlocklyGames.bindClick('runButton', Ocean.runButtonClick);
  BlocklyGames.bindClick('resetButton', Ocean.resetButtonClick);
  BlocklyGames.bindClick('resetOceanButton', Ocean.resetOceanButtonClick);
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
      BlocklyDialogs.oceanDialogKeyDown();
      setTimeout(BlocklyDialogs.abortOffer, 5 * 60 * 1000);
    }
  } else {
    // All other levels get interactive help.  But wait 5 seconds for the
    // user to think a bit before they are told what to do.
  }


  // Lazy-load the JavaScript interpreter.
  document.getElementById('oceananimationdiv').addEventListener('mouseover', Ocean.showCoordinates);
  document.getElementById('oceananimationdiv').addEventListener('mouseout', Ocean.hideCoordinates);
  document.getElementById('oceananimationdiv').addEventListener('mousemove', Ocean.updateCoordinates);
  BlocklyInterface.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyInterface.importPrettify();
  BlocklyGames.bindClick('helpButton', Ocean.showHelp);

};

Ocean.showCoordinates = function(e) {
  if(!Ocean.hidecoords)
  document.getElementById('coordinates').style.display = 'block';
};

/**
 * Hide the x/y coordinates.
 * @param {Event} e Mouse out event.
 */
Ocean.hideCoordinates = function(e) {
  document.getElementById('coordinates').style.display = 'none';
};

/**
 * Update the x/y coordinates.
 * @param {!Event} e Mouse move event.
 */
Ocean.updateCoordinates = function(e) {
  // Get the coordinates of the mouse.
  var rtl = BlocklyGames.isRtl();
  var x = e.clientX;
  var y = e.clientY;
  if (rtl) {
    x -= window.innerWidth;
  }
  // Compensate for the location of the visualization.
  var viz = document.getElementById('visualization');
  var position = Blockly.utils.style.getPageOffset(viz);
  var scroll = Blockly.utils.style.getViewportPageOffset();
  var offset = Blockly.utils.Coordinate.difference(position, scroll);
  x += rtl ? offset.x : -offset.x;
  y -= offset.y;
  // The visualization is 400x400, but the coordinates are 100x100.
  // x  = x * BlocklyGames.factor;
  // y = y * BlocklyGames.factor;
  x = (x * 120 ) / Ocean.MAZE_WIDTH;
  y = (y * 100) / Ocean.MAZE_HEIGHT;
  // Flip the y axis so the origin is at the bottom.
  y = 100 - y;
  if (rtl) {
    x += 120;
  }
  if (BlocklyGames.LEVEL == 10) {
    // Round to the nearest integer.
    x = Math.round(x);
    y = Math.round(y);
  } else {
    // Round to the nearest 10.
    x = Math.round(x / 10) * 10;
    y = Math.round(y / 10) * 10;
    // x = Math.round(x);
    // y = Math.round(y);
  }
  if (x >= 0 && x <= 120 && y >= 0 && y <= 100) {
    document.getElementById('x').textContent = 'x = ' + x;
    document.getElementById('y').textContent = 'y = ' + y;
  } else {
    Ocean.hideCoordinates();
  }
};

Ocean.renderAxies_ = function() {
  var ctx = document.getElementById('axies').getContext('2d');
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  ctx.font = 'normal 14px sans-serif';
  var TICK_LENGTH = 9;
  var major = 2;
  // alert(Ocean.HEIGHT);
  for (var i = 0.1; i < 1.2; i += 0.1) {
    // Bottom edge.
    ctx.beginPath();
    ctx.moveTo(i * (ctx.canvas.width / 1.2) , ctx.canvas.height);
    ctx.lineTo(i * (ctx.canvas.width / 1.2), ctx.canvas.height - TICK_LENGTH * major);
    ctx.stroke();
    // if (major == 2) {
      ctx.fillText(Math.round(i * 100), i * (ctx.canvas.width / 1.2) + 2, ctx.canvas.height - 4);
    // }
    // major = major == 1 ? 2 : 1;
  }
  major = 2;
  for (var i = 0.1; i < 1; i += 0.1) {
    // Left edge.
    ctx.beginPath();
    ctx.moveTo(0, i * (ctx.canvas.height / 1));
    ctx.lineTo(TICK_LENGTH * major, i * (ctx.canvas.height / 1));
    ctx.stroke();
    // if (major == 2) {
      ctx.fillText(Math.round(100 - i * 100), 3, i * (ctx.canvas.height / 1) - 2);
    // }
    // major = major == 1 ? 2 : 1;
  }
};

Ocean.switchToPaperView = function() {
  var x = 2.45 * Ocean.SQUARE_SIZE;
  var y = 1.2 * Ocean.SQUARE_SIZE;
  var x1 = (x + Ocean.SQUARE_SIZE/4);
  var y1 = (y+Ocean.SQUARE_SIZE/4);
  var x2 = (x- Ocean.SQUARE_SIZE/16);
  var y2 = (y+Ocean.SQUARE_SIZE/2.5);
  var x3 = (x - Ocean.SQUARE_SIZE/3.9);
  var y3 = (y + Ocean.SQUARE_SIZE/8);
  var width = Ocean.MAZE_WIDTH;
  var height = Ocean.MAZE_HEIGHT;
  var dx = (0 - x)/25;
  var dy = (0 - y)/25;
  var canvaspaper = document.getElementById('canvasPaper');
  document.getElementById('pegman').style.display = 'none';
  for(var i = 1; i<=25; i++){
    Ocean.timeout1 = function(value) {
      setTimeout(function() {
        canvaspaper.setAttribute('d','M' + ( x + value*dx) +',' + ( y + value*dy) + 'L' + (x1 + value*(width - x1)/25 ) +',' + (y1 + value*(0 - y1)/25) + 'L' + (x2 + value*(width - x2)/25) +',' + (y2 + value*(height - y2)/25) + 'L' + (x3 + value*(0 - x3)/25) +',' + (y3 + value*(height - y3)/25) +'  Z');
      }, Ocean.stepSpeed * value);
    }
    Ocean.timeout1(i);
    setTimeout(function() {
      document.getElementById('svgOcean').style.display = 'none';
      document.getElementById('oceananimationdiv').style.display = 'initial';
      var text = "Draw a rectangle of width 80 and height 70. Then use the cut block to divide the rectangle into two parts.";
      document.getElementById('helptext').innerHTML = text;
      Ocean.showHelp();
    }, Ocean.stepSpeed * 26);
  }
  Ocean.timevalue = 27;
};


Ocean.cutanimation = function(){
  var sheetWidth = 1200;
  var sheetHeight = 279;
  var frame = 3;
  var currentframe = 0;
  var width = sheetWidth / 4;
  var srcX;
  var srcY;
  var scale = (Ocean.canvasctx.canvas.width / 120);
  var x = Ocean.rectX - Ocean.rectW / 2;
  var y = 100 - Ocean.rectY - Ocean.rectH / 2;
  x *= scale;
  y *=scale;
  var img = new Image();
  img.src = 'ocean/scissor2.png';
  function update(val) {
    srcY = 0;
    currentframe = ++currentframe % frame;
    srcX = currentframe * width;
    if(val >= 17) {
      srcX = 3 * width;
      currentframe = 3;
      frame = 4;
    }
    Ocean.canvasctx.clearRect(0, 0, Ocean.canvasctx.canvas.width, Ocean.canvasctx.canvas.height);
    Ocean.canvasctx.beginPath();
    Ocean.canvasctx.drawImage(document.getElementById('axies'), 0, 0);
    Ocean.canvasctx.rect(x, y, Ocean.rectW * scale, Ocean.rectH * scale);
    Ocean.canvasctx.fill();
  }
  function draw(val) {
    update(val);
    Ocean.canvasctx.drawImage(img, srcX, srcY, width, sheetHeight, x + val *(Ocean.rectW * scale / 18) - 30, y + val *(Ocean.rectH * scale / 18) - 30, 60, 60);
    Ocean.canvasctx.drawImage(document.getElementById('axies'), 0, 0);
  }
  for(var i=1; i <= 18; i++) {
    Ocean.timeout = function(val) {
      setTimeout(function() {
        draw(val);
      }, 120 * val);
    }
    Ocean.timeout(i);
  }
  setTimeout(function(){
    Ocean.canvasctx.clearRect(0, 0, Ocean.canvasctx.canvas.width, Ocean.canvasctx.canvas.height);
    Ocean.canvasctx.drawImage(document.getElementById('axies'), 0, 0);
    Ocean.canvasctx.beginPath();
    var x1 = Math.round((Ocean.rectX - Ocean.rectW / 2 - 10 ) / 10) * 10;
    var y1 = Math.round((Ocean.rectY - Ocean.rectH / 2 - 10 ) / 10) * 10;
    var x2 = Math.round((Ocean.rectX - Ocean.rectW / 2 + 5 ) / 10) * 10;
    var y2 = y1;
    Ocean.canvasctx.moveTo(x1* scale,y1* scale);
    Ocean.canvasctx.lineTo(x1* scale + Ocean.rectW * scale, y1* scale + Ocean.rectH * scale);
    Ocean.canvasctx.lineTo(x1* scale, y1* scale + Ocean.rectH * scale);
    Ocean.canvasctx.lineTo(x1* scale,y1* scale);
    Ocean.canvasctx.moveTo(x2* scale,y2* scale);
    Ocean.canvasctx.lineTo(x2* scale + Ocean.rectW * scale, y2* scale + Ocean.rectH * scale);
    Ocean.canvasctx.lineTo(x2* scale + Ocean.rectW * scale, y2* scale);
    Ocean.canvasctx.lineTo(x2* scale,y2* scale);
    Ocean.canvasctx.fillStyle = '#FFFDD0';
    Ocean.canvasctx.fill();
  }, 120 * 21)
  setTimeout(function() {
    Ocean.questionsquiz();
  }, 120 * 23)
  Ocean.timevalue = 120 * 21.01 / Ocean.stepSpeed;
};
/**
 * When the workspace changes, update the help as needed.
 * @param {Blockly.Events.Abstract=} opt_event Custom data for event.
 */
Ocean.levelHelp = function(opt_event) {
  if (opt_event && opt_event.type == Blockly.Events.UI) {
    // Just a change to highlighting or somesuch.
    return;
  } else if (BlocklyInterface.workspace.isDragging()) {
    // Don't change helps during drags.
    return;
  } else if (Ocean.result == Ocean.ResultType.SUCCESS ||
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
    //           '<block type="ocean_moveForward" x="10" y="10">',
    //             '<next>',
    //               '<block type="ocean_moveForward"></block>',
    //             '</next>',
    //           '</block>',
    //         '</xml>'];
    //     BlocklyInterface.injectReadonly('sampleOneTopBlock', xml);
    //     content = document.getElementById('dialogHelpOneTopBlock');
    //     style = {'width': '360px', 'top': '120px'};
    //     style[rtl ? 'right' : 'left'] = '225px';
    //     origin = topBlocks[0].getSvgRoot();
    //   } else if (Ocean.result == Ocean.ResultType.UNSET) {
    //     // Show run help dialog.
    //     content = document.getElementById('dialogHelpRun');
    //     style = {'width': '360px', 'top': '410px'};
    //     style[rtl ? 'right' : 'left'] = '400px';
    //     origin = document.getElementById('runButton');
    //   }
    // }
  } else if (BlocklyGames.LEVEL == 2) {
    if (Ocean.result != Ocean.ResultType.UNSET &&
        document.getElementById('runButton').style.display == 'none') {
      content = document.getElementById('dialogHelpReset');
      style = {'width': '360px', 'top': '410px'};
      style[rtl ? 'right' : 'left'] = '400px';
      origin = document.getElementById('resetButton');
    }
  } else if (BlocklyGames.LEVEL == 3) {
    if (userBlocks.indexOf('ocean_forever') == -1) {
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
        (userBlocks.indexOf('ocean_forever') == -1 ||
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
        if (block.type != 'ocean_forever') {
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
    if (Ocean.SKIN_ID == 0 && !Ocean.showPegmanMenu.activatedOnce) {
      content = document.getElementById('dialogHelpSkins');
      style = {'width': '360px', 'top': '60px'};
      style[rtl ? 'left' : 'right'] = '20px';
      origin = document.getElementById('pegmanButton');
    }
  } else if (BlocklyGames.LEVEL == 6) {
    if (userBlocks.indexOf('ocean_if') == -1) {
      content = document.getElementById('dialogHelpIf');
      style = {'width': '360px', 'top': '430px'};
      style[rtl ? 'right' : 'left'] = '425px';
      origin = toolbar[4].getSvgRoot();
    }
  } else if (BlocklyGames.LEVEL == 7) {
    if (!Ocean.levelHelp.initialized7_) {
      // Create fake dropdown.
      var span = document.createElement('span');
      span.className = 'helpMenuFake';
      var options =
          [BlocklyGames.getMsg('Ocean_pathAhead'),
           BlocklyGames.getMsg('Ocean_pathLeft'),
           BlocklyGames.getMsg('Ocean_pathRight')];
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
      Ocean.levelHelp.initialized7_ = true;
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
    if (userBlocks.indexOf('ocean_ifElse') == -1) {
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
Ocean.changePegman = function(newSkin) {
  BlocklyInterface.saveToSessionStorage();
  location = location.protocol + '//' + location.host + location.pathname +
      '?lang=' + BlocklyGames.LANG + '&level=' + BlocklyGames.LEVEL +
      '&skin=' + newSkin;
};

/**
 * Display the Pegman skin-change menu.
 * @param {!Event} e Mouse, touch, or resize event.
 */
Ocean.showPegmanMenu = function(e) {
  var menu = document.getElementById('pegmanMenu');
  if (menu.style.display == 'block') {
    // Menu is already open.  Close it.
    Ocean.hidePegmanMenu(e);
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
  Ocean.pegmanMenuMouse_ =
      Blockly.bindEvent_(document.body, 'mousedown', null, Ocean.hidePegmanMenu);
  // Close the skin-changing hint if open.
  var hint = document.getElementById('dialogHelpSkins');
  if (hint && hint.className != 'dialogHiddenContent') {
    BlocklyDialogs.hideDialog(false);
  }
  Ocean.showPegmanMenu.activatedOnce = true;
};

/**
 * Hide the Pegman skin-change menu.
 * @param {!Event} e Mouse, touch, or resize event.
 */
Ocean.hidePegmanMenu = function(e) {
  // Prevent double-clicks or double-taps.
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  document.getElementById('pegmanMenu').style.display = 'none';
  document.getElementById('pegmanButton').classList.remove('buttonHover');
  if (Ocean.pegmanMenuMouse_) {
    Blockly.unbindEvent_(Ocean.pegmanMenuMouse_);
    delete Ocean.pegmanMenuMouse_;
  }
};

/**
 * Reset the ocean to the ocean position and kill any pending animation tasks.
 * @param {boolean} first True if an opening animation is to be played.
 */
Ocean.reset = function(first) {
  // Kill all tasks.
  for (var i = 0; i < Ocean.pidList.length; i++) {
    clearTimeout(Ocean.pidList[i]);
  }
  // document.getElementById('pegman').style.display = 'none';
  // document.getElementById('runButton').style.display = 'none';
  // document.getElementById('resetButton').style.display = 'none';
  document.getElementById('oceananimationdiv').style.display = 'none';
  Ocean.canvasctx.clearRect(0,0,Ocean.canvasctx.canvas.width,Ocean.canvasctx.canvas.height);
  Ocean.canvasctx.drawImage(document.getElementById('axies'), 0, 0);
  document.getElementById('svgOcean').style.display = 'initial';
  document.getElementById('video').pause();
  document.getElementById('video').currentTime = 0;
  Ocean.waterstart = 'false';
  Ocean.driftpath = null;
  Ocean.driftbackpath = 'false';
  Ocean.animationended = false;
  var x = 2.45 * Ocean.SQUARE_SIZE;
  var y = 1.2 * Ocean.SQUARE_SIZE;
  var canvaspaper = document.getElementById('canvasPaper');
  canvaspaper.setAttribute('d','M' + x +',' + y + 'L' + (x + Ocean.SQUARE_SIZE/4) +',' + (y+Ocean.SQUARE_SIZE/4) + 'L' + (x- Ocean.SQUARE_SIZE/16) +',' + (y+Ocean.SQUARE_SIZE/2.5) + 'L' + (x - Ocean.SQUARE_SIZE/3.9) +',' + (y + Ocean.SQUARE_SIZE/8) +'  Z');
  canvaspaper.style.stroke = 'white';
  canvaspaper.style.strokeWidth = '5';
  canvaspaper.style.fill = 'white';
  Ocean.pidList = [];
  Ocean.highlightlogdrift = [];
  Ocean.highlightlogback = [];
  Ocean.timesstart = 1;
  Ocean.sailblock = [];
  Ocean.prevlog.clear();
  // Move Pegman into position.
  Ocean.drawclone = true;
  Ocean.pegmanX = Ocean.ocean1_.x;
  Ocean.pegmanY = Ocean.ocean1_.y;
  Ocean.pegmanXcheck = Ocean.pegmanX;
  Ocean.pegmanYcheck = Ocean.pegmanY;
  Ocean.pathdire = 4;
  Ocean.pathlength = 0;
  Ocean.timevalue = 0;
  Ocean.timesocean = 1;
  Ocean.flowdire = -1;
  Ocean.passvalue = 0;
  Ocean.waterstop = false;
  Ocean.isRock = false;
  // document.getElementById('background').setAttribute('y',1*Ocean.SQUARE_SIZE - 6 * Ocean.PEGMAN_WIDTH + 1);
  // document.getElementById('dive').style.display = 'none';
  // document.getElementById('ocean').style.display = 'initial';
  document.getElementById('resetOceanButton').style.display = 'none';
  Ocean.question = 1;
  if (first) {
    // Opening animation.
    Ocean.pegmanD = Ocean.oceanDirection;
    Ocean.scheduleFinish(false);
    Ocean.pidList.push(setTimeout(function() {
      Ocean.stepSpeed = 120;

      Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                    [Ocean.pegmanX, Ocean.pegmanY , (Ocean.pegmanD + 1) * 2], 0);
      Ocean.pegmanD = Ocean.oceanDirection + 1;
      Ocean.pegmanDcheck = Ocean.pegmanD;
      Ocean.pegmanX = Ocean.pegmanX;
      Ocean.pegmanY = Ocean.pegmanY ;
      Ocean.pegmanXcheck = Ocean.pegmanX;
      Ocean.pegmanYcheck = Ocean.pegmanY;
        // Ocean.diveanimation();
    }, Ocean.stepSpeed * 5));
  } else {
    // BlocklyGames.coinval = BlocklyGames.coinval - Ocean.coinscollected * 30;
    BlocklyGames.updatecoinvalue();
    Ocean.pegmanD = Ocean.oceanDirection;
    Ocean.pegmanDcheck = Ocean.pegmanD;
    Ocean.pidList.push(setTimeout(function() {
      Ocean.stepSpeed = 130;
      document.getElementById('pegman').style.display = 'initial';
      Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                    [Ocean.pegmanX, Ocean.pegmanY, (Ocean.pegmanD + 1) * 2], 0);
      Ocean.pegmanD = Ocean.oceanDirection + 1;
      Ocean.pegmanDcheck = Ocean.pegmanD;
      Ocean.pegmanX = Ocean.pegmanX;
      Ocean.pegmanY = Ocean.pegmanY;
      Ocean.pegmanXcheck = Ocean.pegmanX;
      Ocean.pegmanYcheck = Ocean.pegmanY;
    }, Ocean.stepSpeed * 5));
  }

  // Move the finish icon into position.
  var finishIcon = document.getElementById('finish');
  finishIcon.style.display = 'none';
  finishIcon.setAttribute('x', Ocean.SQUARE_SIZE * (Ocean.finish_.x + 0.5) -
      finishIcon.getAttribute('width') / 2);
  finishIcon.setAttribute('y', Ocean.SQUARE_SIZE * (Ocean.finish_.y + 0.6) -
      finishIcon.getAttribute('height'));

  var oceanIcon = document.getElementById('ocean');
  oceanIcon.setAttribute('x', Ocean.SQUARE_SIZE * (Ocean.ocean_.x + 0.5) -
      oceanIcon.getAttribute('width') / 2);
  oceanIcon.setAttribute('y', Ocean.SQUARE_SIZE * (Ocean.ocean_.y + 0.6) -
      oceanIcon.getAttribute('height') / 2);
  // var bg = document.getElementById('background');
  // bg.setAttribute('x', Ocean.SQUARE_SIZE * (0) -
  //     bg.getAttribute('width') / 2);
  // bg.setAttribute('y', Ocean.SQUARE_SIZE * (0) -
  //     bg.getAttribute('height') / 2);

  // Make 'look' icon invisible and promote to top.
  var lookIcon = document.getElementById('look');
  lookIcon.style.display = 'none';
  lookIcon.parentNode.appendChild(lookIcon);
  // var paths = lookIcon.getElementsByTagName('path');
  // for (var i = 0, path; (path = paths[i]); i++) {
  //   path.setAttribute('stroke', Ocean.SKIN.look);
  // }
};

/**
 * Click the run button.  Ocean the program.
 * @param {!Event} e Mouse or touch event.
 */
Ocean.runButtonClick = function(e) {
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
  //     Ocean.result != Ocean.ResultType.SUCCESS &&
  //     !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
  //                                        BlocklyGames.LEVEL)) {
  //   // Ocean.levelHelp();
  //   return;
  // }
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  var resetOceanButton = document.getElementById('resetOceanButton');

  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
    resetOceanButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  // runButton.style.display = 'none';
  // resetButton.style.display = 'inline';
  // Ocean.reset(false);
  Ocean.execute();
};
Ocean.resetOcean = function() {
  // Kill all tasks.
  for (var i = 0; i < Ocean.pidList.length; i++) {
    clearTimeout(Ocean.pidList[i]);
  }
  document.getElementById('RectID1').style.display = 'none';
  document.getElementById('RectID2').style.display = 'none';
  document.getElementById('RectID3').style.display = 'none';
  document.getElementById('pegman').style.display = 'initial';
  Ocean.pidList = [];
  Ocean.drawclone = true;
  Ocean.pegmanX = Ocean.finish_.x;
  Ocean.pegmanY = 4;
  Ocean.pegmanXcheck = Ocean.pegmanX;
  Ocean.pegmanYcheck = Ocean.pegmanY;
  Ocean.pathdire = 4;
  Ocean.pathlength = 0;
  Ocean.timevalue = 0;
  Ocean.flowdire = -1;
  Ocean.waterstop = true;
  document.getElementById('dive').style.display = 'none';
  document.getElementById('dive').style.transform = "rotate(0deg)";

    BlocklyGames.updatecoinvalue();
    Ocean.pegmanD = 2;
    Ocean.pegmanDcheck = Ocean.pegmanD;
    Ocean.pidList.push(setTimeout(function() {
      Ocean.stepSpeed = 130;
      Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                    [Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2], 0);
      Ocean.pegmanD = Ocean.oceanDirection;
      Ocean.pegmanDcheck = Ocean.pegmanD;
    }, Ocean.stepSpeed * 5));
};

/**
 * Click the run button.  Ocean the program.
 * @param {!Event} e Mouse or touch event.
 */
Ocean.runButtonClick = function(e) {
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
  //     Ocean.result != Ocean.ResultType.SUCCESS &&
  //     !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
  //                                        BlocklyGames.LEVEL)) {
  //   // Ocean.levelHelp();
  //   return;
  // }
  var runButton = document.getElementById('runButton');
  var resetButton = document.getElementById('resetButton');
  var resetOceanButton = document.getElementById('resetOceanButton');

  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
    resetOceanButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  // runButton.style.display = 'none';
  // resetButton.style.display = 'inline';
  // Ocean.reset(false);
  Ocean.execute();
};

/**
 * Updates the document's 'capacity' element with a message
 * indicating how many more blocks are permitted.  The capacity
 * is retrieved from BlocklyInterface.workspace.remainingCapacity().
 */
Ocean.updateCapacity = function() {
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
      var msg = BlocklyGames.getMsg('Ocean_capacity0');
    } else if (cap == 1) {
      var msg = BlocklyGames.getMsg('Ocean_capacity1');
    } else {
      var msg = BlocklyGames.getMsg('Ocean_capacity2');
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
 * Click the reset button.  Reset the ocean.
 * @param {!Event} e Mouse or touch event.
 */
Ocean.resetButtonClick = function(e) {
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
  Ocean.reset(false);
};

Ocean.resetOceanButtonClick = function(e) {
  if (BlocklyInterface.eventSpam(e)) {
    return;
  }
  //var runButton = document.getElementById('runButton');
  //runButton.style.display = 'inline';
  //document.getElementById('resetButton').style.display = 'none';
  BlocklyInterface.workspace.highlightBlock(null);
  Ocean.resetOcean();
};
/**
 * Inject the Ocean API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS-Interpreter.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Ocean.initInterpreter = function(interpreter, globalObject) {
  // API
  var wrapper;
  wrapper = function(id) {
    Ocean.move(0, id);
  };
  interpreter.setProperty(globalObject, 'moveForward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Ocean.move(2, id);
  };
  interpreter.setProperty(globalObject, 'moveBackward',
      interpreter.createNativeFunction(wrapper));


  wrapper = function(id) {
    Ocean.turn(0, id);
  };
  interpreter.setProperty(globalObject, 'turnNorth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Ocean.turn(1, id);
  };
  interpreter.setProperty(globalObject, 'turnNorthEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Ocean.turn(2, id);
  };
  interpreter.setProperty(globalObject, 'turnEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Ocean.turn(3, id);
  };
  interpreter.setProperty(globalObject, 'turnSouthEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Ocean.turn(4, id);
  };
  interpreter.setProperty(globalObject, 'turnSouth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Ocean.turn(5, id);
  };
  interpreter.setProperty(globalObject, 'turnSouthWest',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Ocean.turn(6, id);
  };
  interpreter.setProperty(globalObject, 'turnWest',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    Ocean.turn(7, id);
  };
  interpreter.setProperty(globalObject, 'turnNorthWest',
      interpreter.createNativeFunction(wrapper));


  wrapper = function(id) {
    return Ocean.isPath(0, id);
  };
  interpreter.setProperty(globalObject, 'isPathForward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Ocean.isPath(1, id);
  };
  interpreter.setProperty(globalObject, 'isPathNorth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Ocean.isPath(2, id);
  };
  interpreter.setProperty(globalObject, 'isPathBackward',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Ocean.isPath(3, id);
  };
  interpreter.setProperty(globalObject, 'isPathEast',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
    return Ocean.isPath(4, id);
  };
  interpreter.setProperty(globalObject, 'isPathSouth',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
        return Ocean.isPath(5, id);
      };
  interpreter.setProperty(globalObject, 'isPathWest',
          interpreter.createNativeFunction(wrapper));
    wrapper = function(id) {
      return Ocean.driftback(id);
    };
    interpreter.setProperty(globalObject, 'driftback',
        interpreter.createNativeFunction(wrapper));
    wrapper = function( id) {
      return Ocean.drift(1, id);
    };
    interpreter.setProperty(globalObject, 'driftRight',
        interpreter.createNativeFunction(wrapper));
    wrapper = function( id) {
      return Ocean.drift(2, id);
    };
    interpreter.setProperty(globalObject, 'driftLeft',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(id) {
      return Ocean.rockInPath(id);
    };
    interpreter.setProperty(globalObject, 'rockinpath',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(id) {
      return Ocean.cut(id);
    };
    interpreter.setProperty(globalObject, 'cut',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(id) {
      return Ocean.sail(id);
    };
    interpreter.setProperty(globalObject, 'sail',
        interpreter.createNativeFunction(wrapper));

    wrapper = function(x, y, width, height, id) {
      return Ocean.rectangle(x, y, width, height, id);
    };
    interpreter.setProperty(globalObject, 'rect',
        interpreter.createNativeFunction(wrapper));
    wrapper = function() {
      return Ocean.notDone1();
    };
    interpreter.setProperty(globalObject, 'notDone',
        interpreter.createNativeFunction(wrapper));

};

/**
 * Execute the user's code.  Heaven help us...
 */
Ocean.notDone1 = function() {
  if(!Ocean.animationended)
    return true;
  else
  return false;
};
Ocean.execute = function() {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(Ocean.execute, 250);
    return;
  }

  Ocean.log = [];
  Blockly.selected && Blockly.selected.unselect();
  var code = BlocklyInterface.getJsCode();
  BlocklyInterface.executedJsCode = code;
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
  Ocean.result = Ocean.ResultType.UNSET;
  var interpreter = new Interpreter(code, Ocean.initInterpreter);

  // Try running the user's code.  There are four possible outcomes:
  // 1. If pegman reaches the finish [SUCCESS], true is thrown.
  // 2. If the program is terminated due to running too long [TIMEOUT],
  //    false is thrown.
  // 3. If another error occurs [ERROR], that error is thrown.
  // 4. If the program ended normally but without solving the ocean [FAILURE],
  //    no error or exception is thrown.
  try {
    var ticks = 10000;  // 10k ticks runs Pegman for about 8 minutes.
    while (interpreter.step()) {
      if (ticks-- == 0) {
        throw Infinity;
      }
    }
    Ocean.result = Ocean.notDone() ?
        Ocean.ResultType.FAILURE : Ocean.ResultType.SUCCESS;
  } catch (e) {
    // A boolean is thrown for normal termination.
    // Abnormal termination is a user error.
    if (e === Infinity) {
      Ocean.result = Ocean.ResultType.TIMEOUT;
    } else if (e === false) {
      Ocean.result = Ocean.ResultType.ERROR;
    } else {
      // Syntax error, can't happen.
      Ocean.result = Ocean.ResultType.ERROR;
      alert(e);
    }
  }

  // Fast animation if execution is successful.  Slow otherwise.
  if (Ocean.result == Ocean.ResultType.SUCCESS) {
    Ocean.stepSpeed = 100;
    Ocean.log.push(['finish', null]);
  } else {
    Ocean.stepSpeed = 130;
  }
  // Ocean.log now contains a transcript of all the user's actions.
  // Reset the ocean and animate the transcript.
  // Ocean.reset(false);
  Ocean.pidList.push(setTimeout(Ocean.animate, 100));
};
/**
 * Iterate through the recorded path and animate pegman's actions.
 */
Ocean.prevlog = new Set();
Ocean.highlightlogdrift = [];
Ocean.highlightlogback = [];
Ocean.sailblock = [];
Ocean.animate = function() {
  var action = Ocean.log.shift();
  if (!action) {
    BlocklyInterface.highlight(null);
    // Ocean.levelHelp();
    return;
  }
  // alert(action);
  if(!Ocean.prevlog.has(action[1])) {
    BlocklyInterface.highlight(action[1]);
    // console.log(action[0]+',' +action[1]);
    switch (action[0]) {
      case 'north':
        Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                      [Ocean.pegmanX, Ocean.pegmanY - 1, Ocean.pegmanD * 2], 0);
        Ocean.pegmanY--;
        break;
      case 'northeast':
        Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                      [Ocean.pegmanX + 1, Ocean.pegmanY - 1, Ocean.pegmanD * 2], 0);
        Ocean.pegmanX++;
        Ocean.pegmanY--;
        break;
      case 'east':
        Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                      [Ocean.pegmanX + 1, Ocean.pegmanY, Ocean.pegmanD * 2], 0);
        Ocean.pegmanX++;
        break;
      case 'southeast':
        Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                      [Ocean.pegmanX + 1, Ocean.pegmanY + 1, Ocean.pegmanD * 2], 0);
        Ocean.pegmanX++;
        Ocean.pegmanY++;
        break;
      case 'south':
        Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                      [Ocean.pegmanX, Ocean.pegmanY + 1, Ocean.pegmanD * 2], 0);
        Ocean.pegmanY++;
        break;
      case 'southwest':
        Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                      [Ocean.pegmanX - 1, Ocean.pegmanY + 1, Ocean.pegmanD * 2], 0);
        Ocean.pegmanX--;
        Ocean.pegmanY++;
        break;
      case 'west':
        Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                      [Ocean.pegmanX - 1, Ocean.pegmanY, Ocean.pegmanD * 2], 0);
        Ocean.pegmanX--;
        break;
      case 'northwest':
        Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                      [Ocean.pegmanX - 1, Ocean.pegmanY - 1, Ocean.pegmanD * 2], 0);
        Ocean.pegmanX--;
        Ocean.pegmanY--;
        break;

      case 'look_north':
        Ocean.scheduleLook(Ocean.DirectionType.NORTH);
        break;
      case 'look_northeast':
        Ocean.scheduleLook(Ocean.DirectionType.NORTHEAST);
        break;
      case 'look_east':
        Ocean.scheduleLook(Ocean.DirectionType.EAST);
        break;
      case 'look_southeast':
        Ocean.scheduleLook(Ocean.DirectionType.SOUTHEAST);
        break;
      case 'look_south':
        Ocean.scheduleLook(Ocean.DirectionType.SOUTH);
        break;
      case 'look_southwest':
        Ocean.scheduleLook(Ocean.DirectionType.SOUTHWEST);
        break;
      case 'look_west':
        Ocean.scheduleLook(Ocean.DirectionType.WEST);
        break;
      case 'look_northwest':
        Ocean.scheduleLook(Ocean.DirectionType.NORTHWEST);
        break;

      case 'fail_forward':
        BlocklyGames.coinval -=10;
        Ocean.scheduleFail(true);
        break;
      case 'fail_backward':
        BlocklyGames.coinval -=10;
        Ocean.scheduleFail(false);
        break;
      case 'North':
        Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                      [Ocean.pegmanX, Ocean.pegmanY, 2 * 2 ], 0);
        Ocean.pegmanD = Ocean.constrainDirection4(Ocean.pegmanD = 2);
        break;
      case 'NorthEast':
        Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                      [Ocean.pegmanX, Ocean.pegmanY, 1 * 2], 0);
        Ocean.pegmanD = Ocean.constrainDirection4(Ocean.pegmanD = 1);
        break;
      case 'East':
        Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                      [Ocean.pegmanX, Ocean.pegmanY, 0 * 2 ], 0);
        Ocean.pegmanD = Ocean.constrainDirection4(Ocean.pegmanD = 0);
        break;
      case 'SouthEast':
        Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                      [Ocean.pegmanX, Ocean.pegmanY, 7 * 2], 0);
        Ocean.pegmanD = Ocean.constrainDirection4(Ocean.pegmanD = 7);
        break;
      case 'South':
        Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                      [Ocean.pegmanX, Ocean.pegmanY, 6 * 2], 0);
        Ocean.pegmanD = Ocean.constrainDirection4(Ocean.pegmanD = 6);
        break;
      case 'SouthWest':
        Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                      [Ocean.pegmanX, Ocean.pegmanY, 5 * 2], 0);
        Ocean.pegmanD = Ocean.constrainDirection4(Ocean.pegmanD = 5);
        break;
      case 'West':
        Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                      [Ocean.pegmanX, Ocean.pegmanY, 4 * 2], 0);
        Ocean.pegmanD = Ocean.constrainDirection4(Ocean.pegmanD = 4);
        break;
        case 'NorthWest':
          Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, Ocean.pegmanD * 2],
                        [Ocean.pegmanX, Ocean.pegmanY, 3 * 2], 0);
          Ocean.pegmanD = Ocean.constrainDirection4(Ocean.pegmanD = 3);
          break;
      case 'Rectangle':
        var scale = (Ocean.canvasctx.canvas.width / 120);
        var y = 100 - action[3];
        var x = action[2] * scale;
        y *= scale;
        var width = Math.max(action[4] * scale, 0);
        var height = Math.max(action[5] * scale, 0);
        // alert(width);
        Ocean.canvasctx.beginPath();
        Ocean.canvasctx.rect(x - width /2 , y - height/2 , width, height);
        Ocean.canvasctx.fillStyle = '#FFFDD0';
        Ocean.canvasctx.fill();
        Ocean.timevalue = 2;
        break;
      case 'Cut':
        Ocean.schedule([Ocean.pegmanX, Ocean.pegmanY, 2 * 2],
                      [Ocean.pegmanX, Ocean.pegmanY, 2 * 2], 1);
        Ocean.timevalue = 120 * 21.01 / Ocean.stepSpeed;
        break;
      case 'sailboat':
        Ocean.sailblock.push(['sail',action[1]]);
        if(Ocean.waterstart == 'true' && Ocean.timesstart == 1)
        {
          Ocean.animateWaterE2W();
          document.getElementById('video').play();
          Ocean.timesstart ++;
        }
        Ocean.timevalue = 0.01;
        break;
      case 'RightDrift':
        Ocean.driftpath = 'right';
        Ocean.timevalue = 0.01;
        Ocean.highlightlogdrift.push(['right', action[1]]);
        break;
      case 'LeftDrift':
        Ocean.driftpath = 'left';
        Ocean.timevalue = 0.01;
        Ocean.highlightlogdrift.push(['left', action[1]]);
        break;
      case 'Driftback':
        Ocean.driftbackpath = 'true';
        Ocean.timevalue = 0.01;
        Ocean.highlightlogback.push(['back', action[1]]);
        break;
      case 'finish':
        // Ocean.scheduleFinish(true);
        Ocean.switchToPaperView();
        // BlocklyInterface.saveToLocalStorage();
      }
      if(Ocean.log[0] == null || Ocean.log[0][1] != action[1])
        Ocean.prevlog.add(action[1]);
      var factor = Ocean.timevalue;
  }
  else {
    var factor = 1;
  }
  // console.log(Ocean.prevlog);
  Ocean.pidList.push(setTimeout(Ocean.animate, Ocean.stepSpeed * factor));
  Ocean.timevalue = 0;
};

/**
 * Point the congratulations Pegman to face the mouse.
 * @param {Event} e Mouse move event.
 * @private
 */
Ocean.updatePegSpin_ = function(e) {
  if (document.getElementById('dialogDone').className ==
      'dialogHiddenContent') {
    return;
  }
};

/**
 * Schedule the animations for a move or turn.
 * @param {!Array.<number>} oceanPos X, Y and direction oceaning points.
 * @param {!Array.<number>} endPos X, Y and direction ending points.
 */

Ocean.schedule = function(oceanPos, endPos, type) {
  if(type == 0){
    var deltas = [(endPos[0] - oceanPos[0]) ,
                  (endPos[1] - oceanPos[1]) ,
                  (endPos[2] - oceanPos[2])];
    deltas[2] = deltas[2] > 0 ? (deltas[2] > 8 ? (deltas[2] - 16) : deltas[2]) : (deltas[2] < -8 ? (deltas[2] + 16) : deltas[2]);
    var factor;
    var consolation = deltas[2] < 0 ? deltas[2] : 0;
    if(deltas[2] > 0){
      switch (Math.abs(deltas[2])) {
        case 2:
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 1 + consolation));
          }, Ocean.stepSpeed));
          factor = 2;
          break;
        case 4:
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 1 + consolation));
          }, Ocean.stepSpeed));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 2 + consolation));
          }, Ocean.stepSpeed * 2));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 3 + consolation));
              }, Ocean.stepSpeed * 3));
          factor = 4;
          break;
        case 6:
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 1 + consolation));
          }, Ocean.stepSpeed));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 2 + consolation));
          }, Ocean.stepSpeed * 2));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 3 + consolation));
          }, Ocean.stepSpeed * 3));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 4 + consolation));
          }, Ocean.stepSpeed * 4));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 5 + consolation));
          }, Ocean.stepSpeed * 5));
          factor = 6;
          break;
        case 8:
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 1 + consolation));
          }, Ocean.stepSpeed));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 2 + consolation));
          }, Ocean.stepSpeed * 2));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 3 + consolation));
          }, Ocean.stepSpeed * 3));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 4 + consolation));
          }, Ocean.stepSpeed * 4));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 5 + consolation));
          }, Ocean.stepSpeed * 5));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 6 + consolation));
          }, Ocean.stepSpeed * 6));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 7 + consolation));
          }, Ocean.stepSpeed * 7));
          factor = 8;
          break;
      }
      var dire = Ocean.constrainDirection16(endPos[2]);
      Ocean.pathdire = dire /2;
    }
    else if(deltas[2] < 0){
      switch (Math.abs(deltas[2])) {
        case 2:
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 1 + consolation));
          }, Ocean.stepSpeed));
          factor = 2;
          break;
        case 4:
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 3 + consolation));


          }, Ocean.stepSpeed));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 2 + consolation));


          }, Ocean.stepSpeed * 2));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 1 + consolation));


          }, Ocean.stepSpeed * 3));
          factor = 4;
          break;
        case 6:
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 5 + consolation));


          }, Ocean.stepSpeed));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 4 + consolation));


          }, Ocean.stepSpeed * 2));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 3 + consolation));


          }, Ocean.stepSpeed * 3));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 2 + consolation));


          }, Ocean.stepSpeed * 4));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 1 + consolation));


          }, Ocean.stepSpeed * 5));
          factor = 6;
          break;
        case 8:
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 7 + consolation));


          }, Ocean.stepSpeed));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 6 + consolation));


          }, Ocean.stepSpeed * 2));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 5 + consolation));


          }, Ocean.stepSpeed * 3));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 4 + consolation));


          }, Ocean.stepSpeed * 4));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 3 + consolation));


          }, Ocean.stepSpeed * 5));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 2 + consolation));


          }, Ocean.stepSpeed * 6));
        Ocean.pidList.push(setTimeout(function() {
            Ocean.displayPegman(oceanPos[0] + deltas[0] * 2,
                oceanPos[1] + deltas[1] * 2,
                Ocean.constrainDirection16(oceanPos[2] + 1 + consolation));


          }, Ocean.stepSpeed * 7));
          factor = 8;
          break;
      }
      var dire = Ocean.constrainDirection16(endPos[2]);
      Ocean.pathdire = dire / 2;
    }
    else if(deltas[2] == 0){
      var pegmanIcon = document.getElementById('pegman');
      // alert(oceanPos[2]);
      // Ocean.pathlength += Math.sqrt((endPos[0] - oceanPos[0]) * (endPos[0] - oceanPos[0]) + (endPos[1] - oceanPos[1]) * (endPos[1] - oceanPos[1]))
      Ocean.pathlength += Math.max(Math.abs(endPos[0] - oceanPos[0]), Math.abs(endPos[1] - oceanPos[1]));
      pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href','ocean/' + oceanPos[2] + '.png');
      var ocean_height = Ocean.PEGMAN_HEIGHT / 4;
      var end_height = Ocean.PEGMAN_HEIGHT;
      var heightfactor = Ocean.PEGMAN_HEIGHT * 3 / (4 *  Math.max((Math.abs(deltas[0]) * 32 || Math.abs(deltas[1]) * 32)) );
      for(var i=1; i <= (Math.abs(deltas[0]) * 32 || Math.abs(deltas[1]) * 32); i++) {
        Ocean.timeout = function(val) {
          Ocean.pidList.push(setTimeout(function() {
            if(oceanPos[0] == Ocean.ocean_.x && oceanPos[1] == Ocean.ocean_.y && val == 9)
              pegmanIcon.style.display = 'initial';
             Ocean.displayPegman(oceanPos[0] + (deltas[0] * val / 32) ,
                 (oceanPos[1] + deltas[1] * val / 32),
                 Ocean.constrainDirection16(val-1));
             // Ocean.displayPegman(oceanPos[0],
             //     (oceanPos[1]),
             //     Ocean.constrainDirection16(val-1));
           }, Ocean.stepSpeed * val));
        }
        Ocean.timeout(i);
      }
      factor = Math.abs(deltas[0]) > Math.abs(deltas[1]) ? Math.abs(deltas[0]) * 32 + 4 : Math.abs(deltas[1]) * 32 + 4;
      Ocean.pidList.push(setTimeout(function() {
          pegmanIcon.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href','ocean/Idle.png');
          Ocean.displayPegman(endPos[0], endPos[1],
              Ocean.constrainDirection16(endPos[2]));
        }, Ocean.stepSpeed * (factor - 2)));
    }
    Ocean.timevalue = factor + 2;
    Ocean.pidList.push(setTimeout(function() {
        Ocean.displayPegman(endPos[0], endPos[1],
            Ocean.constrainDirection16(endPos[2]));
      }, Ocean.stepSpeed * (factor + 1)));
  }
  else if(type == 1){
    Ocean.pidList.push(setTimeout(function() {
      Ocean.cutanimation();
    }, Ocean.stepSpeed * (Ocean.timevalue)));
  }
  else if(type == 2){
    Ocean.pidList.push(setTimeout(function() {
        Ocean.swimanimation(Ocean.angletoswim);
    }, Ocean.stepSpeed * (Ocean.timevalue)));
  }
};

/**
 * Schedule the animations and sounds for a failed move.
 * @param {boolean} forward True if forward, false if backward.
 */
Ocean.scheduleFail = function(forward) {
  var deltaX = 0;
  var deltaY = 0;
  // BlocklyGames.coinval -=10;
  // Ocean.drawcoinval();
  BlocklyGames.updatecoinvalue();
  switch (Ocean.pegmanD) {
    case Ocean.DirectionType.NORTH:
      deltaY = -1;
      break;
    case Ocean.DirectionType.NORTHEAST:
      deltaX = 1;
      deltaY = -1;
      break;
    case Ocean.DirectionType.EAST:
      deltaX = 1;
      break;
    case Ocean.DirectionType.SOUTHEAST:
      deltaX = 1;
      deltaY = 1;
      break;
    case Ocean.DirectionType.SOUTH:
      deltaY = 1;
      break;
    case Ocean.DirectionType.SOUTHWEST:
      deltaX = -1;
      deltaY = 1;
      break;
    case Ocean.DirectionType.WEST:
      deltaX = -1;
      break;
    case Ocean.DirectionType.NORTHWEST:
      deltaX = -1;
      deltaY = -1;
      break;

  }
  if (!forward) {
    deltaX = -deltaX;
    deltaY = -deltaY;
  }
  if (Ocean.SKIN.crashType == Ocean.CRASH_STOP) {
    // Bounce bounce.
    deltaX /= 4;
    deltaY /= 4;
    var direction16 = Ocean.constrainDirection16(Ocean.pegmanD * 2);
    Ocean.displayPegman(Ocean.pegmanX + deltaX,
                       Ocean.pegmanY + deltaY,
                       direction16);


    BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    Ocean.pidList.push(setTimeout(function() {
      Ocean.displayPegman(Ocean.pegmanX,
                         Ocean.pegmanY,
                         direction16);


      }, Ocean.stepSpeed));
    Ocean.pidList.push(setTimeout(function() {
      Ocean.displayPegman(Ocean.pegmanX + deltaX,
                         Ocean.pegmanY + deltaY,
                         direction16);


      BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    }, Ocean.stepSpeed * 2));
    Ocean.pidList.push(setTimeout(function() {
        Ocean.displayPegman(Ocean.pegmanX, Ocean.pegmanY, direction16);


      }, Ocean.stepSpeed * 3));
  } else {
    // Add a small random delta away from the grid.
    var deltaZ = (Math.random() - 0.5) * 10;
    var deltaD = (Math.random() - 0.5) / 2;
    deltaX += (Math.random() - 0.5) / 4;
    deltaY += (Math.random() - 0.5) / 4;
    deltaX /= 8;
    deltaY /= 8;
    var acceleration = 0;
    if (Ocean.SKIN.crashType == Ocean.CRASH_FALL) {
      acceleration = 0.01;
    }
    Ocean.pidList.push(setTimeout(function() {
      BlocklyInterface.workspace.getAudioManager().play('fail', 0.5);
    }, Ocean.stepSpeed * 2));
    var setPosition = function(n) {
      return function() {
        var direction16 = Ocean.constrainDirection16(Ocean.pegmanD * 4 +
                                                    deltaD * n);
        Ocean.displayPegman(Ocean.pegmanX + deltaX * n,
                           Ocean.pegmanY + deltaY * n,
                           direction16,
                           deltaZ * n);


        deltaY += acceleration;
      };
    };
    // 100 frames should get Pegman offscreen.
    for (var i = 1; i < 100; i++) {
      Ocean.pidList.push(setTimeout(setPosition(i),
          Ocean.stepSpeed * i / 2));
    }
  }
};

/**
 * Schedule the animations and sound for a victory dance.
 * @param {boolean} sound Play the victory sound.
 */
Ocean.scheduleFinish = function(sound) {
  var direction16 = Ocean.constrainDirection16(Ocean.pegmanD * 2);
  Ocean.displayPegman(Ocean.pegmanX, Ocean.pegmanY, 16);


  if (sound) {
    BlocklyInterface.workspace.getAudioManager().play('win', 0.5);
  }
  Ocean.stepSpeed = 100;  // Slow down victory animation a bit.
  Ocean.pidList.push(setTimeout(function() {
    Ocean.displayPegman(Ocean.pegmanX, Ocean.pegmanY, 18);


    }, Ocean.stepSpeed));
  Ocean.pidList.push(setTimeout(function() {
    Ocean.displayPegman(Ocean.pegmanX, Ocean.pegmanY, 16);


    }, Ocean.stepSpeed * 2));
  Ocean.pidList.push(setTimeout(function() {
      Ocean.displayPegman(Ocean.pegmanX, Ocean.pegmanY, direction16);


    }, Ocean.stepSpeed * 3));
};

/**
 * Display Pegman at the specified location, facing the specified direction.
 * @param {number} x Horizontal grid (or fraction thereof).
 * @param {number} y Vertical grid (or fraction thereof).
 * @param {number} d Direction (0 - 15) or dance (16 - 17).
 * @param {number=} opt_angle Optional angle (in degrees) to rotate Pegman.
 */
Ocean.displayPegman = function(x, y, d, opt_angle) {
  var pegmanIcon = document.getElementById('pegman');
  pegmanIcon.setAttribute('x',
      x * Ocean.SQUARE_SIZE - d * Ocean.PEGMAN_WIDTH + 1);
  var clipRect = document.getElementById('clipRect');
  if(opt_angle == 1){
    // alert("a");
    pegmanIcon.setAttribute('y', Ocean.SQUARE_SIZE * (y + 0.5) - (d/18) * (Ocean.PEGMAN_HEIGHT/2) - 1);
  }
  else {
    pegmanIcon.setAttribute('y',
        Ocean.SQUARE_SIZE * (y + 0.5) - Ocean.PEGMAN_HEIGHT / 2 - 8);
    clipRect.setAttribute('x', x * Ocean.SQUARE_SIZE + 1);
    clipRect.setAttribute('y', pegmanIcon.getAttribute('y'));
  }
  // Ocean.scheduleLook(x , y, Ocean.constrainDirection4(Ocean.pegmanD));
};

/**
 * Display the look icon at Pegman's current location,
 * in the specified direction.
 * @param {!Ocean.DirectionType} d Direction (0 - 3).
 */
Ocean.scheduleLook = function(x , y , d) {
  x -=0.25
  y -= 0.35;
  x *= Ocean.SQUARE_SIZE;
  y *= Ocean.SQUARE_SIZE;
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
Ocean.scheduleLookStep = function(path, delay) {
  Ocean.pidList.push(setTimeout(function() {
    path.style.display = 'inline';
    setTimeout(function() {
      // path.style.display = 'none';
    }, Ocean.stepSpeed * 2);
  }, delay));
};

/**
 * Keep the direction within 0-4, wrapping at both ends.
 * @param {number} d Potentially out-of-bounds direction value.
 * @return {number} Legal direction value.
 */
Ocean.constrainDirection4 = function(d) {
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
Ocean.constrainDirection16 = function(d) {
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
 * @throws {true} If the end of the ocean is reached.
 * @throws {false} If Pegman collides with a wall.
 */
Ocean.move = function(direction, id) {
  if(!Ocean.prevlog.has(id))
  {
    if (!Ocean.isPath(direction, null)) {
      Ocean.log.push(['fail_' + (direction ? 'backward' : 'forward'), id]);
      throw false;
    }
    // If moving backward, flip the effective direction.
    var effectiveDirection = Ocean.pegmanDcheck + direction;
    var command;
    switch (Ocean.constrainDirection4(effectiveDirection)) {
      case Ocean.DirectionType.NORTH:
        Ocean.pegmanYcheck--;
        command = 'north';
        break;
      case Ocean.DirectionType.NORTHEAST:
      Ocean.pegmanXcheck++;
      Ocean.pegmanYcheck--;
      command = 'northeast';
      break;
      case Ocean.DirectionType.EAST:
        Ocean.pegmanXcheck++;
        command = 'east';
        break;
      case Ocean.DirectionType.SOUTHEAST:
      Ocean.pegmanXcheck++;
      Ocean.pegmanYcheck++;
      command = 'southeast';
      break;
      case Ocean.DirectionType.SOUTH:
        Ocean.pegmanYcheck++;
        command = 'south';
        break;
      case Ocean.DirectionType.SOUTHWEST:
      Ocean.pegmanXcheck--;
      Ocean.pegmanYcheck++;
      command = 'southwest';
      break;
      case Ocean.DirectionType.WEST:
        Ocean.pegmanXcheck--;
        command = 'west';
        break;
        case Ocean.DirectionType.NORTHWEST:
        Ocean.pegmanXcheck--;
        Ocean.pegmanYcheck--;
        command = 'northwest';
        break;
    }
    Ocean.log.push([command, id]);
  }
};

/**
 * Turn pegman left or right.
 * @param {number} direction Direction to turn (0 = left, 1 = right).
 * @param {string} id ID of block that triggered this action.
 */
Ocean.turn = function(direction, id) {
  if(!Ocean.prevlog.has(id))
  {
    switch (direction)
    {
      case 0:
        Ocean.pegmanDcheck = 2;
        Ocean.log.push(['North',id]);
        break;
      case 1:
        Ocean.pegmanDcheck = 1;
        Ocean.log.push(['NorthEast',id]);
        break;
      case 2:
        Ocean.pegmanDcheck = 0;
        Ocean.log.push(['East',id]);
        break;
      case 3:
        Ocean.pegmanDcheck = 7;
        Ocean.log.push(['SouthEast',id]);
        break;
      case 4:
        Ocean.pegmanDcheck = 6;
        Ocean.log.push(['South',id]);
        break;
      case 5:
        Ocean.pegmanDcheck = 5;
        Ocean.log.push(['SouthWest',id]);
        break;
      case 6:
        Ocean.pegmanDcheck = 4;
        Ocean.log.push(['West',id]);
        break;
      case 7:
        Ocean.pegmanDcheck = 3;
        Ocean.log.push(['NorthWest',id]);
        break;
    }
  }
  Ocean.pegmanDcheck = Ocean.constrainDirection4(Ocean.pegmanDcheck);
};
Ocean.cut = function(id) {
  Ocean.log.push(['Cut',id]);
};
Ocean.rectangle = function(x, y, width, height, id){
  Ocean.rectX = x;
  Ocean.rectY = y;
  Ocean.rectW = width;
  Ocean.rectH = height;
  Ocean.log.push(['Rectangle', id, x, y, width, height]);
};
Ocean.drift = function(direction, id){
  switch (direction) {
    case 1:
      Ocean.log.push(['RightDrift', id]);
      break;
    case 2:
      Ocean.log.push(['LeftDrift', id]);
      break;
  }
};
Ocean.driftback = function(id){
  Ocean.log.push(['Driftback', id]);
};
Ocean.sail = function(id) {
  Ocean.log.push(['sailboat', id]);
};
/**
 * Is there a path next to pegman?
 * @param {number} direction Direction to look
 *     (0 = forward, 1 = right, 2 = backward, 3 = left).
 * @param {?string} id ID of block that triggered this action.
 *     Null if called as a helper function in Ocean.move().
 * @return {boolean} True if there is a path.
 */
Ocean.isPath = function(direction, id) {
  if(!Ocean.prevlog.has(id))
  {
    var effectiveDirection = Ocean.pegmanDcheck + direction;
    var square;
    var command;
    switch (Ocean.constrainDirection4(effectiveDirection)) {
      case Ocean.DirectionType.NORTH:
        square = Ocean.map[Ocean.pegmanYcheck - 1] &&
            Ocean.map[Ocean.pegmanYcheck - 1][Ocean.pegmanXcheck];
        command = 'look_north';
        break;
      case Ocean.DirectionType.NORTHEAST:
        square = Ocean.map[Ocean.pegmanYcheck - 1] &&
            Ocean.map[Ocean.pegmanYcheck - 1][Ocean.pegmanXcheck + 1];
        command = 'look_northeast';
        break;
      case Ocean.DirectionType.EAST:
        square = Ocean.map[Ocean.pegmanYcheck][Ocean.pegmanXcheck + 1];
        command = 'look_east';
        break;
      case Ocean.DirectionType.SOUTHEAST:
        square = Ocean.map[Ocean.pegmanYcheck + 1] &&
            Ocean.map[Ocean.pegmanYcheck + 1][Ocean.pegmanXcheck + 1];
        command = 'look_southeast';
        break;
      case Ocean.DirectionType.SOUTH:
        square = Ocean.map[Ocean.pegmanYcheck + 1] &&
            Ocean.map[Ocean.pegmanYcheck + 1][Ocean.pegmanXcheck];
        command = 'look_south';
        break;
      case Ocean.DirectionType.SOUTHWEST:
        square = Ocean.map[Ocean.pegmanYcheck + 1] &&
            Ocean.map[Ocean.pegmanYcheck + 1][Ocean.pegmanXcheck - 1];
        command = 'look_southwest';
        break;
      case Ocean.DirectionType.WEST:
        square = Ocean.map[Ocean.pegmanYcheck][Ocean.pegmanXcheck - 1];
        command = 'look_west';
        break;
      case Ocean.DirectionType.NORTHWEST:
        square = Ocean.map[Ocean.pegmanYcheck - 1] &&
            Ocean.map[Ocean.pegmanYcheck - 1][Ocean.pegmanXcheck - 1];
        command = 'look_northwest';
        break;
    }
  }
  if (id) {
    Ocean.log.push([command, id]);
  }
  return square !== Ocean.SquareType.WALL && square !== undefined;
};


Ocean.rockInPath = function (id){
    if(Ocean.isRock == true) {
      return false;
    }
    else {
      Ocean.isRock = true;
      return true;
    }
};
/**
 * Is the player at the finish marker?
 * @return {boolean} True if not done, false if done.
 */
Ocean.notDone = function() {
  return Ocean.pegmanXcheck != Ocean.finish_.x || Ocean.pegmanYcheck != Ocean.finish_.y;
};

Ocean.showHelp = function() {
  var help = document.getElementById('help');
  var button = document.getElementById('helpButton');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };
  BlocklyDialogs.showDialog(help, button, true, true, style, Ocean.hideHelp);
  BlocklyDialogs.startDialogKeyDown();
};

/**
 * Hide the help pop-up.
 */
Ocean.hideHelp = function() {
  BlocklyDialogs.stopDialogKeyDown();
};

Ocean.questionsquiz = function() {
  var content = document.getElementById('Quiz');
  var style = {
    width: '40%',
    left: '50%',
    top: '3em'
  };
  var text;
  var text1;
  var cancel = document.getElementById('doneSubmit1');
  text = 'Are the two triangles formed congruent?';
  text1 = "Sorry you entered wrong answer please try again!"
  var linesText = document.getElementById('dialogLinesText1');
  linesText.textContent = '';
  linesText.appendChild(document.createTextNode(text));

  cancel.addEventListener('click', Ocean.checkinput);
  // cancel.addEventListener('touchend', BlocklyDialogs.checkinput, val);
  var ok = document.getElementById('doneOk1');
  ok.style.display = "none";
  ok.addEventListener('click', Ocean.changeView, true);
  ok.addEventListener('touchend', Ocean.changeView, true);

  BlocklyDialogs.showDialog(content, null, false, true, style,
      function() {
        document.body.removeEventListener('keydown',
            Ocean.congratulationsKeyDown, true);
        });
  document.body.addEventListener('keydown',
      Ocean.congratulationsKeyDown, true);
  document.getElementById('dialogDoneText1').style.display = "none";
  document.getElementById('dialogDoneText1').textContent = text1;
};
Ocean.checkinput = function(){
  var value = document.getElementById('containerCode1').value;
  if(value == "YES" || value == "Yes" || value == "yes")
  {
    document.getElementById('dialogDoneText1').style.display = "none";
    document.getElementById('doneSubmit1').style.display = "none";
    document.getElementById('doneOk1').style.display = 'initial';
    BlocklyGames.coinval += 30;
    BlocklyGames.updatecoinvalue();
  }
  else {
    BlocklyGames.coinval -= 10;
    BlocklyGames.updatecoinvalue();
    document.getElementById('dialogDoneText1').style.display = "initial";
  }
};
Ocean.congratulationsKeyDown = function(e) {
  if (e.keyCode == 13 ||
      e.keyCode == 27 ||
      e.keyCode == 32) {
    e.stopPropagation();
    e.preventDefault();
  }
};
Ocean.storymessage = function (){
  var text1 = "Congratulations on making it so far into the game!!";
  var text2 = "phew!! you did good crossing that broken bridge and answering those tough questions I think those new concepts were very interesting for you.";
  var text3 = "The book says that there is a bench on the beach and that it has all the items you will require to make a boat for sailing in the ocean. But book warns that sailing is not so easy and you will have to use some of your skills and that it will keep you update with the use of help tab. So let's get ready for the next adventure";
  var text4 = "(Quick tip : Use help commands whenever you are stuck on what to do!!)";
  document.getElementById('p1').textContent = text1;
  document.getElementById('p2').textContent = text2;
  document.getElementById('p3').textContent = text3;
  document.getElementById('p4').textContent = text4;
  document.getElementById('p2').style.top = document.getElementById('p1').offsetTop + document.getElementById('p1').offsetHeight + 'px';
  document.getElementById('p3').style.top = document.getElementById('p2').offsetTop + document.getElementById('p2').offsetHeight + 'px';
  function startlevel (){
    document.getElementById('storyMessageO').style.display = 'none';
    Ocean.init();
  };
  document.getElementById('cross').addEventListener("click",startlevel);
  document.getElementById('cross').addEventListener("touchend",startlevel);
};

window.addEventListener('load', Ocean.storymessage);
