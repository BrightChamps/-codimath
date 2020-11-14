/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for circus game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Circus.Blocks');

goog.require('Blockly');
goog.require('Blockly.Constants.Colour');
goog.require('Blockly.Constants.Lists');
goog.require('Blockly.Constants.Logic');
goog.require('Blockly.Constants.Loops');
goog.require('Blockly.Constants.Math');
goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Constants.Text');
goog.require('Blockly.Constants.Variables');
goog.require('Blockly.JavaScript');
goog.require('Blockly.JavaScript.colour');
goog.require('Blockly.JavaScript.lists');
goog.require('Blockly.JavaScript.logic');
goog.require('Blockly.JavaScript.loops');
goog.require('Blockly.JavaScript.math');
goog.require('Blockly.JavaScript.procedures');
goog.require('Blockly.JavaScript.texts');
goog.require('Blockly.JavaScript.variables');
goog.require('BlocklyGames');


/**
 * Common HSV hue for all shape blocks.
 */
Circus.Blocks.SHAPE_HUE = 160;

// Extensions to Blockly's existing blocks and JavaScript generator.

Blockly.Blocks['circus_circle'] = {
  /**
   * Block for drawing a circle.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Circus.Blocks.SHAPE_HUE);
    this.appendValueInput('X')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Circus_circleDraw'))
        .appendField(BlocklyGames.getMsg('Circus_x'));
    this.appendValueInput('Y')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Circus_y'));
    this.appendValueInput('RADIUS')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Circus_radius'));
    this.appendValueInput('WIDTH')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Circus_width'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Circus_circleTooltip'));
  }
};

Blockly.JavaScript['circus_circle'] = function(block) {
  // Generate JavaScript for drawing a circle.
  var x = Blockly.JavaScript.valueToCode(block, 'X',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var y = Blockly.JavaScript.valueToCode(block, 'Y',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var radius = Blockly.JavaScript.valueToCode(block, 'RADIUS',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var width = Blockly.JavaScript.valueToCode(block, 'WIDTH',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  return 'circle(' + x + ', ' + y + ', ' + radius + ', ' + width + ');\n';
};


Blockly.Blocks['circus_line'] = {
  /**
   * Block for drawing a line.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Circus.Blocks.SHAPE_HUE);
    this.appendValueInput('X1')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Circus_lineDraw'))
        .appendField(BlocklyGames.getMsg('Circus_x1'));
    this.appendValueInput('Y1')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Circus_y1'));
    this.appendValueInput('X2')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Circus_x2'));
    this.appendValueInput('Y2')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Circus_y2'));
    this.appendValueInput('WIDTH')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Circus_width'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Circus_lineTooltip'));
  }
};

Blockly.JavaScript['circus_line'] = function(block) {
  // Generate JavaScript for drawing a line.
  var x1 = Blockly.JavaScript.valueToCode(block, 'X1',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var y1 = Blockly.JavaScript.valueToCode(block, 'Y1',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var x2 = Blockly.JavaScript.valueToCode(block, 'X2',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var y2 = Blockly.JavaScript.valueToCode(block, 'Y2',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var width = Blockly.JavaScript.valueToCode(block, 'WIDTH',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  return 'line(' + x1 + ', ' + y1 + ', ' + x2 + ', ' + y2 + ', ' +
      width + ');\n';
};

Blockly.Blocks['circus_perpendicularline'] = {
  /**
   * Block for drawing a line.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Circus.Blocks.SHAPE_HUE);
    this.appendValueInput('X1')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Circus_perpendicularlineDraw'))
        .appendField(BlocklyGames.getMsg('Circus_x1'));
    this.appendValueInput('Y1')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Circus_y1'));
    this.appendValueInput('X2')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Circus_perpendiculartoline'))
        .appendField(BlocklyGames.getMsg('Circus_x2'));
    this.appendValueInput('Y2')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Circus_y2'));
    this.appendValueInput('WIDTH')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Circus_width'));
    this.appendValueInput('LENGTH')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(BlocklyGames.getMsg('Circus_length'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Circus_perpendicularTooltip'));
  }
};

Blockly.JavaScript['circus_perpendicularline'] = function(block) {
  // Generate JavaScript for drawing a line.
  var x1 = Blockly.JavaScript.valueToCode(block, 'X1',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var y1 = Blockly.JavaScript.valueToCode(block, 'Y1',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var x2 = Blockly.JavaScript.valueToCode(block, 'X2',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var y2 = Blockly.JavaScript.valueToCode(block, 'Y2',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var width = Blockly.JavaScript.valueToCode(block, 'WIDTH',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var length = Blockly.JavaScript.valueToCode(block, 'LENGTH',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  return 'perpendicularline(' + x1 + ', ' + y1 + ', ' + x2 + ', ' + y2 + ', ' +
      width + ', ' + length + ');\n';
};

Blockly.Blocks['circus_time'] = {
  /**
   * Block for getting the current time value.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Blockly.Msg['VARIABLES_HUE']);
    this.appendDummyInput()
        .appendField('time (0\u2192100)');
    this.setOutput(true, 'Number');
    this.setTooltip(BlocklyGames.getMsg('Circus_timeTooltip'));
  }
};

Blockly.JavaScript['circus_time'] = function(block) {
  // Generate JavaScript for getting the current time value.
  var code = 'time()';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['circus_colour'] = {
  /**
   * Block for setting the colour.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setColour(Blockly.Msg['COLOUR_HUE']);
    this.appendValueInput('COLOUR')
        .setCheck('Colour')
        .appendField(BlocklyGames.getMsg('Circus_setColour'));
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(BlocklyGames.getMsg('Circus_colourTooltip'));
  }
};

Blockly.JavaScript['circus_colour'] = function(block) {
  // Generate JavaScript for setting the colour.
  var colour = Blockly.JavaScript.valueToCode(block, 'COLOUR',
      Blockly.JavaScript.ORDER_NONE) || '\'#000000\'';
  return 'penColour(' + colour + ');\n';
};
