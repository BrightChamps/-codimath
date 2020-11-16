/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Sample answers for Turtle levels. Used for prompts and marking.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Circus.Answers');


/**
 * Sample solutions for each level.
 * To create an answer, just solve the level in Blockly, then paste the
 * resulting JavaScript here, moving any functions to the beginning of
 * this function.
 * @param {number} f Frame number (0-100).
 */
Circus.answer = function(f) {
  function time() {
    return f;
  }
  switch (BlocklyGames.LEVEL) {
    case 1:
      // Static person.
      Circus.penColour('#ff0000');
      Circus.circle(120, 100, 80, 2);
      break;
    case 2:
      // Right hand moving up.
      Circus.penColour('#ff0000');
      Circus.circle(50, 70, 10);
      Circus.penColour('#3333ff');
      Circus.rect(50, 40, 20, 40);
      Circus.penColour('#000000');
      Circus.line(40, 50, 20, 70, 5);
      Circus.line(60, 50, 80, time(), 5);
      break;
    case 3:
      // Left hand moving down.
      Circus.penColour('#ff0000');
      Circus.circle(50, 70, 10);
      Circus.penColour('#3333ff');
      Circus.rect(50, 40, 20, 40);
      Circus.penColour('#000000');
      Circus.line(40, 50, 20, 100 - time(), 5);
      Circus.line(60, 50, 80, time(), 5);
      break;
    case 4:
      // Legs cross.
      Circus.penColour('#ff0000');
      Circus.circle(50, 70, 10);
      Circus.penColour('#3333ff');
      Circus.rect(50, 40, 20, 40);
      Circus.penColour('#000000');
      Circus.line(40, 50, 20, 100 - time(), 5);
      Circus.line(60, 50, 80, time(), 5);
      Circus.line(40, 20, time(), 0, 5);
      Circus.line(60, 20, 100 - time(), 0, 5);
      break;
    case 5:
      // Right arm parabola.
      Circus.penColour('#ff0000');
      Circus.circle(50, 70, 10);
      Circus.penColour('#3333ff');
      Circus.rect(50, 40, 20, 40);
      Circus.penColour('#000000');
      Circus.line(40, 50, 20, 100 - time(), 5);
      Circus.line(60, 50, 80, Math.pow((time() - 50) / 5, 2), 5);
      Circus.line(40, 20, time(), 0, 5);
      Circus.line(60, 20, 100 - time(), 0, 5);
      break;
    case 6:
      // Hands.
      Circus.penColour('#ff0000');
      Circus.circle(50, 70, 10);
      Circus.penColour('#3333ff');
      Circus.rect(50, 40, 20, 40);
      Circus.penColour('#000000');
      Circus.line(40, 50, 20, 100 - time(), 5);
      Circus.line(60, 50, 80, Math.pow((time() - 50) / 5, 2), 5);
      Circus.line(40, 20, time(), 0, 5);
      Circus.line(60, 20, 100 - time(), 0, 5);
      Circus.penColour('#ff0000');
      Circus.circle(20, 100 - time(), 5);
      Circus.circle(80, Math.pow((time() - 50) / 5, 2), 5);
      break;
    case 7:
      // Head.
      Circus.penColour('#ff0000');
      if (time() < 50) {
        Circus.circle(50, 70, 10);
      } else {
        Circus.circle(50, 80, 20);
      }
      Circus.penColour('#3333ff');
      Circus.rect(50, 40, 20, 40);
      Circus.penColour('#000000');
      Circus.line(40, 50, 20, 100 - time(), 5);
      Circus.line(60, 50, 80, Math.pow((time() - 50) / 5, 2), 5);
      Circus.line(40, 20, time(), 0, 5);
      Circus.line(60, 20, 100 - time(), 0, 5);
      Circus.penColour('#ff0000');
      Circus.circle(20, 100 - time(), 5);
      Circus.circle(80, Math.pow((time() - 50) / 5, 2), 5);
      break;
    case 8:
      // Legs reverse.
      Circus.penColour('#ff0000');
      if (time() < 50) {
        Circus.circle(50, 70, 10);
      } else {
        Circus.circle(50, 80, 20);
      }
      Circus.penColour('#3333ff');
      Circus.rect(50, 40, 20, 40);
      Circus.penColour('#000000');
      Circus.line(40, 50, 20, 100 - time(), 5);
      Circus.line(60, 50, 80, Math.pow((time() - 50) / 5, 2), 5);
      if (time() < 50) {
        Circus.line(40, 20, time(), 0, 5);
        Circus.line(60, 20, 100 - time(), 0, 5);
      } else {
        Circus.line(40, 20, 100 - time(), 0, 5);
        Circus.line(60, 20, time(), 0, 5);
      }
      Circus.penColour('#ff0000');
      Circus.circle(20, 100 - time(), 5);
      Circus.circle(80, Math.pow((time() - 50) / 5, 2), 5);
      break;
    case 9:
      // Background.
      Circus.penColour('#00ff00');
      Circus.circle(50, time() / 2, time() / 2);
      Circus.penColour('#ff0000');
      if (time() < 50) {
        Circus.circle(50, 70, 10);
      } else {
        Circus.circle(50, 80, 20);
      }
      Circus.penColour('#3333ff');
      Circus.rect(50, 40, 20, 40);
      Circus.penColour('#000000');
      Circus.line(40, 50, 20, 100 - time(), 5);
      Circus.line(60, 50, 80, Math.pow((time() - 50) / 5, 2), 5);
      if (time() < 50) {
        Circus.line(40, 20, time(), 0, 5);
        Circus.line(60, 20, 100 - time(), 0, 5);
      } else {
        Circus.line(40, 20, 100 - time(), 0, 5);
        Circus.line(60, 20, time(), 0, 5);
      }
      Circus.penColour('#ff0000');
      Circus.circle(20, 100 - time(), 5);
      Circus.circle(80, Math.pow((time() - 50) / 5, 2), 5);
      break;
  }
};

/**
 * Validate whether the user's answer is correct.
 * @return {boolean} True if the level is solved, false otherwise.
 */
Circus.isCorrect = function() {
  if (BlocklyGames.LEVEL == BlocklyGames.MAX_LEVEL) {
    // Any non-null answer is correct.
    return BlocklyInterface.workspace.getAllBlocks().length > 1;
  }
  // Check the already recorded pixel errors on every frame.
  for (var f = 0; f <= Circus.FRAMES; f++) {
    if (f == 50) {
      // Don't check the middle frame.  Makes pesky off-by-one errors go away.
      // E.g. if (time < 50) vs if (time <= 50)
      continue;
    } else if (Circus.pixelErrors[f] === undefined) {
      // Not rendered yet.
      return false;
    } else if (Circus.pixelErrors[f] > 100) {
      // Too many errors.
      console.log('Pixel errors (frame ' + f + '): ' + Circus.pixelErrors[f]);
      return false;
    }
  }
  if (BlocklyGames.LEVEL == 9) {
    // Ensure that the background is behind the figure, not in front.
    var blocks = BlocklyInterface.workspace.getAllBlocks(true);
    for (var i = 0, block; (block = blocks[i]); i++) {
      if (block.type == 'movie_circle') {
        // Check that the radius on the first circle block is connected to a
        // division block.
        if (block.getInputTargetBlock('RADIUS').type != 'math_arithmetic') {
          var content = document.getElementById('helpLayer');
          var style = {
            'width': '30%',
            'left': '35%',
            'top': '12em'
          };
          BlocklyDialogs.showDialog(content, null, false, true, style,
              BlocklyDialogs.stopDialogKeyDown);
          BlocklyDialogs.startDialogKeyDown();
          return false;
        }
        break;
      }
    }
  }
  return true;
};
