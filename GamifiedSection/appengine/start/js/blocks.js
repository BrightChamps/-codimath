/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Start game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Start.Blocks');

goog.require('Blockly');
goog.require('Blockly.JavaScript');
goog.require('Blockly.Constants.Loops');
goog.require('Blockly.Constants.Math');
goog.require('Blockly.JavaScript.loops');
goog.require('Blockly.JavaScript.math');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldImage');
goog.require('BlocklyGames');


/**
 * Common HSV hue for all movement blocks.
 */
Start.Blocks.MOVEMENT_HUE = 290;

/**
 * HSV hue for loop block.
 */
Start.Blocks.LOOPS_HUE = 120;

/**
 * Common HSV hue for all logic blocks.
 */
Start.Blocks.LOGIC_HUE = 210;

/**
 * Left turn arrow to be appended to messages.
 */
Start.Blocks.LEFT_TURN = ' \u21BA';

/**
 * Left turn arrow to be appended to messages.
 */
Start.Blocks.RIGHT_TURN = ' \u21BB';

// Extensions to Blockly's existing blocks and JavaScript generator.

Blockly.Blocks['start_moveForward'] = {
  /**
   * Block for moving forward.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": BlocklyGames.getMsg('Start_moveForward'),
      "previousStatement": null,
      "nextStatement": null,
      "colour": Start.Blocks.MOVEMENT_HUE,
      "tooltip": BlocklyGames.getMsg('Start_moveForwardTooltip')
    });
  }
};

Blockly.JavaScript['start_moveForward'] = function(block) {
  // Generate JavaScript for moving forward.
  return 'moveForward(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['start_turn'] = {
  /**
   * Block for turning left or right.
   * @this {Blockly.Block}
   */
  init: function() {
    var DIRECTIONS =
        [[BlocklyGames.getMsg('Start_turnNorth'), 'turnNorth'],
         [BlocklyGames.getMsg('Start_turnNorthEast'), 'turnNorthEast'],
         [BlocklyGames.getMsg('Start_turnEast'), 'turnEast'],
         [BlocklyGames.getMsg('Start_turnSouthEast'), 'turnSouthEast'],
         [BlocklyGames.getMsg('Start_turnSouth'), 'turnSouth'],
         [BlocklyGames.getMsg('Start_turnSouthWest'), 'turnSouthWest'],
         [BlocklyGames.getMsg('Start_turnWest'), 'turnWest'],
         [BlocklyGames.getMsg('Start_turnNorthWest'), 'turnNorthWest']];
    // Append arrows to direction messages.
    // DIRECTIONS[0][0] += Start.Blocks.LEFT_TURN;
    // DIRECTIONS[1][0] += Start.Blocks.RIGHT_TURN;
    this.setColour(Start.Blocks.MOVEMENT_HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Start_turnTooltip'));
  }
};

Blockly.JavaScript['start_turn'] = function(block) {
  // Generate JavaScript for turning left or right.
  var dir = block.getFieldValue('DIR');
  return dir + '(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['start_if'] = {
  /**
   * Block for 'if' conditional if there is a path.
   * @this {Blockly.Block}
   */
  init: function() {
    // var DIRECTIONS =
    //     [[BlocklyGames.getMsg('Start_pathAhead'), 'isPathForward'],
    //      [BlocklyGames.getMsg('Start_pathLeft'), 'isPathLeft'],
    //      [BlocklyGames.getMsg('Start_pathRight'), 'isPathRight']];
    // Append arrows to direction messages.
    // DIRECTIONS[1][0] += Start.Blocks.LEFT_TURN;
    // DIRECTIONS[2][0] += Start.Blocks.RIGHT_TURN;
    var DIRECTIONS =
        [[BlocklyGames.getMsg('Start_pathAhead'), 'isPathForward'],
         [BlocklyGames.getMsg('Start_pathNorth'), 'isPathNorth'],
         [BlocklyGames.getMsg('Start_pathNorthEast'), 'isPathNorthEast'],
         [BlocklyGames.getMsg('Start_pathEast'), 'isPathEast'],
         [BlocklyGames.getMsg('Start_pathSouthEast'), 'isPathSouthEast'],
         [BlocklyGames.getMsg('Start_pathSouth'), 'isPathSouth'],
         [BlocklyGames.getMsg('Start_pathSouthWest'), 'isPathSouthWest'],
         [BlocklyGames.getMsg('Start_pathWest'), 'isPathWest'],
         [BlocklyGames.getMsg('Start_pathNorthWest'), 'isPathNorthWest']];
    this.setColour(Start.Blocks.LOGIC_HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.appendStatementInput('DO')
        .appendField(BlocklyGames.getMsg('Start_doCode'));
    this.setTooltip(BlocklyGames.getMsg('Start_ifTooltip'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['start_if'] = function(block) {
  // Generate JavaScript for 'if' conditional if there is a path.
  var argument = block.getFieldValue('DIR') +
      '(\'block_id_' + block.id + '\')';
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');
  var code = 'if (' + argument + ') {\n' + branch + '}\n';
  return code;
};

Blockly.Blocks['start_ifElse'] = {
  /**
   * Block for 'if/else' conditional if there is a path.
   * @this {Blockly.Block}
   */
  init: function() {
    var DIRECTIONS =
        [[BlocklyGames.getMsg('Start_pathAhead'), 'isPathForward'],
         [BlocklyGames.getMsg('Start_pathNorth'), 'isPathNorth'],
         [BlocklyGames.getMsg('Start_pathNorthEast'), 'isPathNorthEast'],
         [BlocklyGames.getMsg('Start_pathEast'), 'isPathEast'],
         [BlocklyGames.getMsg('Start_pathSouthEast'), 'isPathSouthEast'],
         [BlocklyGames.getMsg('Start_pathSouth'), 'isPathSouth'],
         [BlocklyGames.getMsg('Start_pathSouthWest'), 'isPathSouthWest'],
         [BlocklyGames.getMsg('Start_pathWest'), 'isPathWest'],
         [BlocklyGames.getMsg('Start_pathNorthWest'), 'isPathNorthWest']];
    // Append arrows to direction messages.
    // DIRECTIONS[1][0] += Start.Blocks.LEFT_TURN;
    // DIRECTIONS[2][0] += Start.Blocks.RIGHT_TURN;
    this.setColour(Start.Blocks.LOGIC_HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.appendStatementInput('DO')
        .appendField(BlocklyGames.getMsg('Start_doCode'));
    this.appendStatementInput('ELSE')
        .appendField(BlocklyGames.getMsg('Start_elseCode'));
    this.setTooltip(BlocklyGames.getMsg('Start_ifelseTooltip'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['start_ifElse'] = function(block) {
  // Generate JavaScript for 'if/else' conditional if there is a path.
  var argument = block.getFieldValue('DIR') +
      '(\'block_id_' + block.id + '\')';
  var branch0 = Blockly.JavaScript.statementToCode(block, 'DO');
  var branch1 = Blockly.JavaScript.statementToCode(block, 'ELSE');
  var code = 'if (' + argument + ') {\n' + branch0 +
             '} else {\n' + branch1 + '}\n';
  return code;
};

Blockly.Blocks['start_loop'] = {
  /**
   * Block for repeat loop.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Start.Blocks.LOOPS_HUE);
    this.appendValueInput('times')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Start_repeat'))
    this.appendStatementInput('DO')
        .appendField(BlocklyGames.getMsg('Start_doCode'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Start_whileTooltip'));
  }
};

Blockly.JavaScript['start_loop'] = function(block) {
  // Generate JavaScript for repeat loop.
  var times = Blockly.JavaScript.valueToCode(block, 'times',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');
  if (Blockly.JavaScript.INFINITE_LOOP_TRAP) {
    branch = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'block_id_' + block.id + '\' times' + times +'\'') + branch;
  }
  return 'for(var i=0; i<' + times +';i++) {\n' + branch + '}\n';
};
