/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Bridge game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Bridge.Blocks');

goog.require('Blockly');
goog.require('Blockly.JavaScript');
goog.require('Blockly.Constants.Loops');
goog.require('Blockly.Constants.Math');
goog.require('Blockly.Constants.Logic');
goog.require('Blockly.JavaScript.logic');
goog.require('Blockly.JavaScript.loops');
goog.require('Blockly.JavaScript.math');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldImage');
goog.require('BlocklyGames');


/**
 * Common HSV hue for all movement blocks.
 */
Bridge.Blocks.MOVEMENT_HUE = 290;

/**
 * HSV hue for loop block.
 */
Bridge.Blocks.LOOPS_HUE = 120;

/**
 * Common HSV hue for all logic blocks.
 */
Bridge.Blocks.LOGIC_HUE = 210;

/**
 * Left turn arrow to be appended to messages.
 */
Bridge.Blocks.LEFT_TURN = ' \u21BA';

/**
 * Left turn arrow to be appended to messages.
 */
Bridge.Blocks.RIGHT_TURN = ' \u21BB';

// Extensions to Blockly's existing blocks and JavaScript generator.

Blockly.Blocks['bridge_moveForward'] = {
  /**
   * Block for moving forward.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": BlocklyGames.getMsg('Bridge_moveForward'),
      "previousStatement": null,
      "nextStatement": null,
      "colour": Bridge.Blocks.MOVEMENT_HUE,
      "tooltip": BlocklyGames.getMsg('Bridge_moveForwardTooltip')
    });
  }
};

Blockly.JavaScript['bridge_moveForward'] = function(block) {
  // Generate JavaScript for moving forward.
  return 'moveForward(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['bridge_turn'] = {
  /**
   * Block for turning left or right.
   * @this {Blockly.Block}
   */
  init: function() {
    var DIRECTIONS =
        [[BlocklyGames.getMsg('Bridge_turnNorth'), 'turnNorth'],
         [BlocklyGames.getMsg('Bridge_turnNorthEast'), 'turnNorthEast'],
         [BlocklyGames.getMsg('Bridge_turnEast'), 'turnEast'],
         [BlocklyGames.getMsg('Bridge_turnSouthEast'), 'turnSouthEast'],
         [BlocklyGames.getMsg('Bridge_turnSouth'), 'turnSouth'],
         [BlocklyGames.getMsg('Bridge_turnSouthWest'), 'turnSouthWest'],
         [BlocklyGames.getMsg('Bridge_turnWest'), 'turnWest'],
         [BlocklyGames.getMsg('Bridge_turnNorthWest'), 'turnNorthWest']];
    // Append arrows to direction messages.
    // DIRECTIONS[0][0] += Bridge.Blocks.LEFT_TURN;
    // DIRECTIONS[1][0] += Bridge.Blocks.RIGHT_TURN;
    this.setColour(Bridge.Blocks.MOVEMENT_HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Bridge_turnTooltip'));
  }
};

Blockly.JavaScript['bridge_turn'] = function(block) {
  // Generate JavaScript for turning left or right.
  var dir = block.getFieldValue('DIR');
  return dir + '(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['bridge_if'] = {
  /**
   * Block for 'if' conditional if there is a path.
   * @this {Blockly.Block}
   */
  init: function() {
    // var DIRECTIONS =
    //     [[BlocklyGames.getMsg('Bridge_pathAhead'), 'isPathForward'],
    //      [BlocklyGames.getMsg('Bridge_pathLeft'), 'isPathLeft'],
    //      [BlocklyGames.getMsg('Bridge_pathRight'), 'isPathRight']];
    // Append arrows to direction messages.
    // DIRECTIONS[1][0] += Bridge.Blocks.LEFT_TURN;
    // DIRECTIONS[2][0] += Bridge.Blocks.RIGHT_TURN;
    var DIRECTIONS =
        [[BlocklyGames.getMsg('Bridge_pathAhead'), 'isPathForward'],
         [BlocklyGames.getMsg('Bridge_pathNorth'), 'isPathNorth'],
         [BlocklyGames.getMsg('Bridge_pathNorthEast'), 'isPathNorthEast'],
         [BlocklyGames.getMsg('Bridge_pathEast'), 'isPathEast'],
         [BlocklyGames.getMsg('Bridge_pathSouthEast'), 'isPathSouthEast'],
         [BlocklyGames.getMsg('Bridge_pathSouth'), 'isPathSouth'],
         [BlocklyGames.getMsg('Bridge_pathSouthWest'), 'isPathSouthWest'],
         [BlocklyGames.getMsg('Bridge_pathWest'), 'isPathWest'],
         [BlocklyGames.getMsg('Bridge_pathNorthWest'), 'isPathNorthWest']];
    this.setColour(Bridge.Blocks.LOGIC_HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.appendStatementInput('DO')
        .appendField(BlocklyGames.getMsg('Bridge_doCode'));
    this.setTooltip(BlocklyGames.getMsg('Bridge_ifTooltip'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['bridge_if'] = function(block) {
  // Generate JavaScript for 'if' conditional if there is a path.
  var argument = block.getFieldValue('DIR') +
      '(\'block_id_' + block.id + '\')';
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');
  var code = 'if (' + argument + ') {\n' + branch + '}\n';
  return code;
};

Blockly.Blocks['bridge_loop'] = {
  /**
   * Block for repeat loop.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Bridge.Blocks.LOOPS_HUE);
    this.appendValueInput('times')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Bridge_repeat'))
    this.appendStatementInput('DO')
        .appendField(BlocklyGames.getMsg('Bridge_doCode'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Bridge_whileTooltip'));
  }
};

Blockly.JavaScript['bridge_loop'] = function(block) {
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

Blockly.Blocks['bridge_swim'] = {
  /**
   * Block for swimming.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": "%1(%2);",
      "args0": [
          "swim",
        {
          "type": "input_value",
          "name": "DEGREE",
          "check": ["Number", "Angle"]
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Bridge.Blocks.MOVEMENT_HUE,
      "tooltip": BlocklyGames.getMsg('Bridge_swimTooltip')
    });
  }
};

Blockly.JavaScript['bridge_swim'] = function(block) {
  // Generate JavaScript for swimming.
  var value_degree = Blockly.JavaScript.valueToCode(block, 'DEGREE',
      Blockly.JavaScript.ORDER_NONE) || 0;
  return 'swim(' + value_degree + ',\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['bridge_dive'] = {
  /**
   * Block for stopping.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": ["Dive"],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Bridge.Blocks.MOVEMENT_HUE,
      "tooltip": BlocklyGames.getMsg('Bridge_diveTooltip')
    });
  }
};

Blockly.JavaScript['bridge_dive'] = function(block) {
  // Generate JavaScript for stopping.
  return 'dive(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['bridge_ifElse'] = {
  /**
   * Block for 'if/else' conditional if there is a path.
   * @this {Blockly.Block}
   */
  init: function() {
    var DIRECTIONS =
        [[BlocklyGames.getMsg('Bridge_pathLeft'), 'isRiverDirectionEasttoWest'],
         [BlocklyGames.getMsg('Bridge_pathRight'), 'isRiverDirectionWesttoEast']];
    // Append arrows to direction messages.
    this.setColour(Bridge.Blocks.LOGIC_HUE);
    this.appendDummyInput()
        .appendField('If river Direction')
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.appendStatementInput('DO')
        .appendField(BlocklyGames.getMsg('Bridge_doCode'));
    this.appendStatementInput('ELSE')
        .appendField(BlocklyGames.getMsg('Bridge_elseCode'));
    this.setTooltip(BlocklyGames.getMsg('Bridge_ifelseTooltip'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['bridge_ifElse'] = function(block) {
  // Generate JavaScript for 'if/else' conditional if there is a path.
  var argument = block.getFieldValue('DIR') +
      '(\'block_id_' + block.id + '\')';
  var branch0 = Blockly.JavaScript.statementToCode(block, 'DO');
  var branch1 = Blockly.JavaScript.statementToCode(block, 'ELSE');
  var code = 'if (' + argument + ') {\n' + branch0 +
             '} else {\n' + branch1 + '}\n';
  return code;
};
