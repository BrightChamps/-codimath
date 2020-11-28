/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Door game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Door.Blocks');

goog.require('Blockly');
goog.require('Blockly.JavaScript');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldNumber');
goog.require('Blockly.FieldAngle');
goog.require('Blockly.FieldVariable');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldImage');
goog.require('BlocklyGames');


/**
 * Common HSV hue for all movement blocks.
 */
Door.Blocks.MOVEMENT_HUE = 290;

/**
 * HSV hue for loop block.
 */
Door.Blocks.LOOPS_HUE = 120;

/**
 * Common HSV hue for all logic blocks.
 */
Door.Blocks.LOGIC_HUE = 210;

/**
 * Left turn arrow to be appended to messages.
 */
Door.Blocks.LEFT_TURN = ' \u21BA';

/**
 * Left turn arrow to be appended to messages.
 */
Door.Blocks.RIGHT_TURN = ' \u21BB';

// Extensions to Blockly's existing blocks and JavaScript generator.

Blockly.Blocks['door_moveblock'] = {
  /**
   * Block for repeat loop.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
       "lastDummyAlign0": "RIGHT",
       "message0": "Block : %1 %2 %3 Move To : %4 %5",
       "args0": [
         {
           "type": "field_number",
           "name": "x1",
           "value": 1,
           "min": 1,
           "max": 6
         },
         {
           "type": "field_number",
           "name": "y1",
           "value": 1,
           "min": 1,
           "max": 5
         },
         {
           "type": "input_dummy",
           "align": "RIGHT"
         },
         {
           "type": "field_number",
           "name": "x2",
           "value": 1,
           "min": 1,
           "max": 6
         },
         {
           "type": "field_number",
           "name": "y2",
           "value": 1,
           "min": 1,
           "max": 5
         }
       ],
       "inputsInline": false,
       "previousStatement": null,
       "nextStatement": null,
       "colour": Door.Blocks.MOVEMENT_HUE,
       "tooltip": BlocklyGames.getMsg('Door_moveTooltip'),
       "helpUrl": ""
     });
  }
};

Blockly.JavaScript['door_moveblock'] = function(block) {
  var x1 = block.getFieldValue('x1');
  var y1 = block.getFieldValue('y1');
  var x2 = block.getFieldValue('x2');
  var y2 = block.getFieldValue('y2');
  // TODO: Assemble JavaScript into code variable.
  return 'moveblock(' + x1 + ', ' + y1 + ', ' + x2 + ', ' + y2 + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['door_rotate'] = {
  /**
   * Block for moving forward.
   * @this {Blockly.Block}
   */
  init: function() {
    this.jsonInit({
      "lastDummyAlign0": "RIGHT",
      "message0": "Block : %1 %2 %3 Rotate : %4  By : %5",
      "args0": [
        {
          "type": "field_number",
          "name": "x1",
          "value": 1,
          "min": 1,
          "max": 6
        },
        {
          "type": "field_number",
          "name": "y1",
          "value": 1,
          "min": 1,
          "max": 5
        },
        {
          "type": "input_dummy"
        },
        {
          "type": "field_dropdown",
          "name": "direction",
          "options": [
            [
              "Right",
              "right"
            ],
            [
              "Left",
              "left"
            ]
          ]
        },
        {
          "type": "field_angle",
          "name": "angle",
          "angle": 0
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Door.Blocks.MOVEMENT_HUE,
      "tooltip": BlocklyGames.getMsg('Door_rotateTooltip'),
      "helpUrl": ""
    });
  }
};
Blockly.JavaScript['door_rotate'] = function(block) {
  var x = block.getFieldValue('x1');
  var y = block.getFieldValue('y1');
  var direction = block.getFieldValue('direction');
  var angle = block.getFieldValue('angle');
  // TODO: Assemble JavaScript into code variable.
  return 'rotateblock(' + x + ', ' + y + ', ' + direction + ', ' + angle + ', \'block_id_' + block.id + '\');\n';
};
