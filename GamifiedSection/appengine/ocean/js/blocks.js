/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Ocean game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Ocean.Blocks');

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
Ocean.Blocks.MOVEMENT_HUE = 290;

/**
 * HSV hue for loop block.
 */
Ocean.Blocks.LOOPS_HUE = 120;
Ocean.Blocks.SHAPE_HUE = 160;
Ocean.Blocks.YATCH_HUE = 190;

/**
 * Common HSV hue for all logic blocks.
 */
Ocean.Blocks.LOGIC_HUE = 210;

/**
 * Left turn arrow to be appended to messages.
 */
Ocean.Blocks.LEFT_TURN = ' \u21BA';

/**
 * Left turn arrow to be appended to messages.
 */
Ocean.Blocks.RIGHT_TURN = ' \u21BB';

// Extensions to Blockly's existing blocks and JavaScript generator.

Blockly.Blocks['ocean_moveForward'] = {
  /**
   * Block for moving forward.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": BlocklyGames.getMsg('Ocean_moveForward'),
      "previousStatement": null,
      "nextStatement": null,
      "colour": Ocean.Blocks.MOVEMENT_HUE,
      "tooltip": BlocklyGames.getMsg('Ocean_moveForwardTooltip')
    });
  }
};

Blockly.JavaScript['ocean_moveForward'] = function(block) {
  // Generate JavaScript for moving forward.
  return 'moveForward(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['ocean_turn'] = {
  /**
   * Block for turning left or right.
   * @this {Blockly.Block}
   */
  init: function() {
    var DIRECTIONS =
        [[BlocklyGames.getMsg('Ocean_turnNorth'), 'turnNorth'],
         [BlocklyGames.getMsg('Ocean_turnNorthEast'), 'turnNorthEast'],
         [BlocklyGames.getMsg('Ocean_turnEast'), 'turnEast'],
         [BlocklyGames.getMsg('Ocean_turnSouthEast'), 'turnSouthEast'],
         [BlocklyGames.getMsg('Ocean_turnSouth'), 'turnSouth'],
         [BlocklyGames.getMsg('Ocean_turnSouthWest'), 'turnSouthWest'],
         [BlocklyGames.getMsg('Ocean_turnWest'), 'turnWest'],
         [BlocklyGames.getMsg('Ocean_turnNorthWest'), 'turnNorthWest']];
    // Append arrows to direction messages.
    // DIRECTIONS[0][0] += Ocean.Blocks.LEFT_TURN;
    // DIRECTIONS[1][0] += Ocean.Blocks.RIGHT_TURN;
    this.setColour(Ocean.Blocks.MOVEMENT_HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Ocean_turnTooltip'));
  }
};

Blockly.JavaScript['ocean_turn'] = function(block) {
  // Generate JavaScript for turning left or right.
  var dir = block.getFieldValue('DIR');
  return dir + '(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['ocean_if'] = {
  /**
   * Block for 'if' conditional if there is a path.
   * @this {Blockly.Block}
   */
  init: function() {
    // var DIRECTIONS =
    //     [[BlocklyGames.getMsg('Ocean_pathAhead'), 'isPathForward'],
    //      [BlocklyGames.getMsg('Ocean_pathLeft'), 'isPathLeft'],
    //      [BlocklyGames.getMsg('Ocean_pathRight'), 'isPathRight']];
    // Append arrows to direction messages.
    // DIRECTIONS[1][0] += Ocean.Blocks.LEFT_TURN;
    // DIRECTIONS[2][0] += Ocean.Blocks.RIGHT_TURN;
    var DIRECTIONS =
        [[BlocklyGames.getMsg('Ocean_pathAhead'), 'isPathForward'],
         [BlocklyGames.getMsg('Ocean_pathNorth'), 'isPathNorth'],
         [BlocklyGames.getMsg('Ocean_pathNorthEast'), 'isPathNorthEast'],
         [BlocklyGames.getMsg('Ocean_pathEast'), 'isPathEast'],
         [BlocklyGames.getMsg('Ocean_pathSouthEast'), 'isPathSouthEast'],
         [BlocklyGames.getMsg('Ocean_pathSouth'), 'isPathSouth'],
         [BlocklyGames.getMsg('Ocean_pathSouthWest'), 'isPathSouthWest'],
         [BlocklyGames.getMsg('Ocean_pathWest'), 'isPathWest'],
         [BlocklyGames.getMsg('Ocean_pathNorthWest'), 'isPathNorthWest']];
    this.setColour(Ocean.Blocks.LOGIC_HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
    this.appendStatementInput('DO')
        .appendField(BlocklyGames.getMsg('Ocean_doCode'));
    this.setTooltip(BlocklyGames.getMsg('Ocean_ifTooltip'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['ocean_if'] = function(block) {
  // Generate JavaScript for 'if' conditional if there is a path.
  var argument = block.getFieldValue('DIR') +
      '(\'block_id_' + block.id + '\')';
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');
  var code = 'if (' + argument + ') {\n' + branch + '}\n';
  return code;
};

Blockly.Blocks['ocean_forever'] = {
  /**
   * Block for repeat loop.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Ocean.Blocks.LOOPS_HUE);
    this.appendDummyInput()
        .appendField(BlocklyGames.getMsg('Ocean_repeat'))
        .appendField(new Blockly.FieldImage(Ocean.SKIN.island, 40, 30));
    this.appendStatementInput('DO')
        .appendField(BlocklyGames.getMsg('Ocean_doCode'));
    this.setPreviousStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Ocean_whileTooltip'));
  }
};

Blockly.JavaScript['ocean_forever'] = function(block) {
  // Generate JavaScript for repeat loop.
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');
  if (Blockly.JavaScript.INFINITE_LOOP_TRAP) {
    branch = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'block_id_' + block.id + '\'') + branch;
  }
  return 'while (notDone()) {\n' + branch + '}\n';
};

Blockly.Blocks['ocean_driftback'] = {
  /**
   * Block for stopping.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": ["Drift Back"],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Ocean.Blocks.YATCH_HUE,
      "tooltip": BlocklyGames.getMsg('ocean_driftbackTooltip')
    });
  }
};

Blockly.JavaScript['ocean_driftback'] = function(block) {
  // Generate JavaScript for stopping.
  return 'driftback(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['ocean_cut'] = {
  /**
   * Block for stopping.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": ["Cut"],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Ocean.Blocks.SHAPE_HUE,
      "tooltip": BlocklyGames.getMsg('ocean_cutTooltip')
    });
  }
};

Blockly.JavaScript['ocean_cut'] = function(block) {
  // Generate JavaScript for stopping.
  return 'cut(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['ocean_sail'] = {
  /**
   * Block for stopping.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": ["Sail"],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Ocean.Blocks.YATCH_HUE,
      "tooltip": BlocklyGames.getMsg('ocean_sailTooltip')
    });
  }
};

Blockly.JavaScript['ocean_sail'] = function(block) {
  // Generate JavaScript for stopping.
  return 'sail(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['ocean_drift'] = {
  /**
   * Block for stopping.
   * @this {Blockly.Block}
   */
  init: function() {
      var DIRECTIONS =
          [[BlocklyGames.getMsg('Ocean_driftright'), 'driftRight'],
           [BlocklyGames.getMsg('Ocean_driftleft'), 'driftLeft']];
      this.setColour(Ocean.Blocks.YATCH_HUE);
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(BlocklyGames.getMsg('ocean_driftTooltip'));
  }
};

Blockly.JavaScript['ocean_drift'] = function(block) {
  // Generate JavaScript for stopping.
  var dir = block.getFieldValue('DIR');
  return dir + '(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['ocean_ifElse'] = {
  /**
   * Block for 'if/else' conditional if there is a path.
   * @this {Blockly.Block}
   */
  init: function() {
    // Append arrows to direction messages.
    this.setColour(Ocean.Blocks.LOGIC_HUE);
    this.appendDummyInput()
        .appendField('If in the path')
        .appendField(new Blockly.FieldImage(Ocean.SKIN.stone, 40, 30));
    this.appendStatementInput('DO')
        .appendField(BlocklyGames.getMsg('Ocean_doCode'));
    this.appendStatementInput('ELSE')
        .appendField(BlocklyGames.getMsg('Ocean_elseCode'));
    this.setTooltip(BlocklyGames.getMsg('Ocean_ifelseTooltip'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.JavaScript['ocean_ifElse'] = function(block) {
  // Generate JavaScript for 'if/else' conditional if there is a path.
  var argument = 'rockinpath' +
      '(\'block_id_' + block.id + '\')';
  var branch0 = Blockly.JavaScript.statementToCode(block, 'DO');
  var branch1 = Blockly.JavaScript.statementToCode(block, 'ELSE');
  var code = 'if (' + argument + ') {\n' + branch0 +
             '} else {\n' + branch1 + '}\n';
  return code;
};

Blockly.Blocks['ocean_rect'] = {
  /**
   * Block for drawing a rectangle.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Ocean.Blocks.SHAPE_HUE);
    this.appendValueInput('X')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Ocean_rectDraw'))
        .appendField(BlocklyGames.getMsg('Ocean_x'));
    this.appendValueInput('Y')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Ocean_y'));
    this.appendValueInput('WIDTH')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Ocean_width'));
    this.appendValueInput('HEIGHT')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Ocean_height'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Ocean_rectTooltip'));
  }
};

Blockly.JavaScript['ocean_rect'] = function(block) {
  // Generate JavaScript for drawing a rectangle.
  var x = Blockly.JavaScript.valueToCode(block, 'X',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var y = Blockly.JavaScript.valueToCode(block, 'Y',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var width = Blockly.JavaScript.valueToCode(block, 'WIDTH',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var height = Blockly.JavaScript.valueToCode(block, 'HEIGHT',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  return 'rect(' + x + ', ' + y + ', ' + width + ', ' + height + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['ocean_loop'] = {
  /**
   * Block for repeat loop.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Ocean.Blocks.LOOPS_HUE);
    this.appendValueInput('times')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Ocean_repeatfor'))
    this.appendStatementInput('DO')
        .appendField(BlocklyGames.getMsg('Ocean_doCode'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Ocean_loopTooltip'));
  }
};

Blockly.JavaScript['ocean_loop'] = function(block) {
  // Generate JavaScript for repeat loop.
  var times = Blockly.JavaScript.valueToCode(block, 'times',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');
  if (Blockly.JavaScript.INFINITE_LOOP_TRAP) {
    branch = Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'block_id_' + block.id + '\' times' + times +'\'') + branch;
  }
  return 'for(var i = 1; i <= ' + times +'; i++) {\n' + branch + '}\n';
};
