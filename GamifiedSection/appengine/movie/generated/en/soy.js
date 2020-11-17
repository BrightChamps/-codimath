// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Movie.soy.
 */

goog.provide('Movie.soy');

goog.require('soy');
goog.require('soydata');
goog.require('BlocklyGames.soy');


Movie.soy.messages = function(opt_data, opt_ignored, opt_ijData) {
  return BlocklyGames.soy.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Movie_x">x</span><span id="Movie_y">y</span><span id="Movie_x1">start x</span><span id="Movie_y1">start y</span><span id="Movie_x2">end x</span><span id="Movie_y2">end y</span><span id="Movie_radius">radius</span><span id="Movie_width">width</span><span id="Movie_height">height</span><span id="Movie_circleTooltip">Draws a circle at the specified location and with the specified radius.</span><span id="Movie_circleDraw">circle</span><span id="Movie_lineTooltip">Draws a line from one point to another with the specified width.</span><span id="Movie_lineDraw">line</span><span id="Movie_timeTooltip">Returns the current time in the animation (0-100).</span><span id="Movie_colourTooltip">Changes the colour of the pen.</span><span id="Movie_setColour">set colour to</span><span id="Movie_submitDisabled">Your movie doesn\'t move. Use blocks to make something interesting. Then you may submit your movie to the gallery.</span></div>';
};
if (goog.DEBUG) {
  Movie.soy.messages.soyTemplateName = 'Movie.soy.messages';
}


Movie.soy.start = function(opt_data, opt_ignored, opt_ijData) {
  return '' + Movie.soy.messages(null, null, opt_ijData) + BlocklyGames.soy.headerBar({appName: 'CircumCircle', levelLinkSuffix: '', hasLinkButton: true, hasHelpButton: true, farLeftHtml: ''}, null, opt_ijData) + '<div id="visualization" display = "none"><div id="coordinates"><span id="x"></span><span id="y"></span></div><div id="rider" width="115" height="260"><canvas id="ridercanvas" width="115" height="260"></canvas></div><canvas id="scratch" width="680" height="600" style="display: none"></canvas><canvas id="hatching" width="680" height="600" style="display: none"></canvas><canvas id="axies" width="680" height="600" style="display: none" dir="ltr"></canvas><canvas id="display" width="680" height="600" style="vertical-align: bottom"></canvas><div id="support1div" width="" height="40"><canvas id="support1" width="30" height="30"  ></canvas></div><div id="support2div" width="40" height="40"><canvas id="support2" width="40" height="40"  ></canvas></div><div id="support3div" width="40" height="40"><canvas id="support3" width="40" height="40"  ></canvas></div><div id="support4div" width="40" height="40"><canvas id="support4" width="40" height="40"  ></canvas></div><div id="support5div" width="40" height="40"><canvas id="support5" width="40" height="40"  ></canvas></div></div><div id = "Container" ><div class="quizContainer"><div id ="quiz"><h2 id="question"></h2><div class="choice-container"><p class="choice-prefix">A</p><p class="choice-text" data-number="1"></p></div><div class="choice-container"><p class="choice-prefix">B</p><p class="choice-text" data-number="2"></p></div><div class="choice-container"><p class="choice-prefix">C</p><p class="choice-text" data-number="3"></p></div><div class="choice-container"><p class="choice-prefix">D</p><p class="choice-text" data-number="4"></p></div></div></div><button id="previous">Previous Question</button><button id="next">Skip Question</button><button id="submit">Submit Quiz</button></div>' + Movie.soy.toolbox(null, null, opt_ijData) + '<div id="blockly"></div>' + BlocklyGames.soy.dialog(null, null, opt_ijData) + BlocklyGames.soy.doneDialog(null, null, opt_ijData) + BlocklyGames.soy.abortDialog(null, null, opt_ijData) + BlocklyGames.soy.storageDialog(null, null, opt_ijData) + ((opt_ijData.level == 9) ? '<div id="helpLayer" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">Move the background circle to the top of your program.  Then it will appear behind the person.</div>' + BlocklyGames.soy.ok(null, null, opt_ijData) + '</div>' : '') + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">' + ((opt_ijData.level == 1) ? 'Use simple shapes to draw this person.' : (opt_ijData.level == 2) ? 'This level is a movie. You want the person\'s arm to move across the screen. Press the play button to see a preview.<div id="sampleHelp2" class="readonly"></div>As the movie plays, the value of the \'time\' block counts from 0 to 100. Since you want the \'y\' position of the arm to start at 0 and go to 100 this should be easy.' : (opt_ijData.level == 3) ? 'The \'time\' block counts from 0 to 100. But now you want the \'y\' position of the other arm to start at 100 and go to 0. Can you figure out a simple mathematical formula that flips the direction?' : (opt_ijData.level == 4) ? 'Use what you learned in the previous level to make legs that cross.' : (opt_ijData.level == 5) ? 'The mathematical formula for the arm is complicated. Here\'s the answer:<br><br><code class="ltr">y = ((time - 50) &divide; 5) ^ 2</code><code class="rtl">&lrm;2 ^ (5 &divide; (50 - time)) = y&lrm;</code>' : (opt_ijData.level == 6) ? 'Give the person a couple of hands.' : (opt_ijData.level == 7) ? 'Use the \'if\' block to draw a small head for the first half of the movie. Then draw a big head for the second half of the movie.' : (opt_ijData.level == 8) ? 'Make the legs reverse direction half way through the movie.' : (opt_ijData.level == 9) ? 'Draw an expanding circle behind the person.' : (opt_ijData.level == 10) ? 'Make a movie of anything you want. You\'ve got a huge number of new blocks you can explore. Have fun!' + ((! opt_ijData.html) ? '<br><br>Use the "See Gallery" button to see movies that other people have made. If you make an interesting movie, use the "Submit to Gallery" button to publish it.' : '') : '') + '</div>' + BlocklyGames.soy.ok(null, null, opt_ijData) + '</div>';
};
if (goog.DEBUG) {
  Movie.soy.start.soyTemplateName = 'Movie.soy.start';
}


Movie.soy.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" xmlns="https://developers.google.com/blockly/xml"><category name="Movie"><block type="movie_circle"><value name="X"><shadow type="math_number"><field name="NUM">50</field></shadow></value><value name="Y"><shadow type="math_number"><field name="NUM">50</field></shadow></value><value name="RADIUS"><shadow type="math_number"><field name="NUM">10</field></shadow></value><value name="WIDTH"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block><block type="movie_line"><value name="X1"><shadow type="math_number"><field name="NUM">40</field></shadow></value><value name="Y1"><shadow type="math_number"><field name="NUM">40</field></shadow></value><value name="X2"><shadow type="math_number"><field name="NUM">60</field></shadow></value><value name="Y2"><shadow type="math_number"><field name="NUM">60</field></shadow></value><value name="WIDTH"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block>' + ((opt_ijData.level > 1) ? '<block type="movie_time"></block>' : '') + '</category><category name="Colour"><block type="movie_colour"><value name="COLOUR"><shadow type="colour_picker"></shadow></value></block></category></xml>';
};
if (goog.DEBUG) {
  Movie.soy.toolbox.soyTemplateName = 'Movie.soy.toolbox';
}
