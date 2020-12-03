// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace BlocklyGames.soy.
 */

goog.provide('BlocklyGames.soy');

goog.require('soy');
goog.require('soydata');


BlocklyGames.soy.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Games_name">Bright Champs</span><span id="Games_puzzle">Puzzle</span><span id="Games_maze">Maze</span><span id="Games_bird">Bird</span><span id="Games_turtle">Turtle</span><span id="Games_movie">CircumCircle</span><span id="Games_door">Door</span><span id="Games_findfriend">Find Friend</span><span id="Games_mazeperimeter">Perimeter</span><span id="Games_mazeangle">Angle</span><span id="Games_ocean">Ocean</span><span id="Games_bridge">Bridge</span><span id="Games_circus">Circus</span><span id="Games_start">Treasure Hunt</span><span id="Games_music">Music</span><span id="Games_pondTutor">Pond Tutor</span><span id="Games_pond">Pond</span><span id="Games_genetics">Genetics</span><span id="Games_linesOfCode1">You solved this level with 1 line of JavaScript:</span><span id="Games_linesOfCode2">You solved this level with %1 lines of JavaScript:</span><span id="Games_nextLevel">Are you ready for level %1?</span><span id="Games_finalLevel">Are you ready for the next challenge?</span><span id="Games_submitTitle">Title:</span><span id="Games_linkTooltip">Save and link to blocks.</span><span id="Games_runTooltip">Run the program you wrote.</span><span id="Games_runProgram">Run Program</span><span id="Games_resetTooltip">Stop the program and reset the level.</span><span id="Games_resetProgram">Reset</span><span id="Games_help">Help</span><span id="Games_dialogOk">OK</span><span id="Games_dialogCancel">Cancel</span><span id="Games_catLogic">Logic</span><span id="Games_catLoops">Loops</span><span id="Games_catMath">Math</span><span id="Games_catText">Text</span><span id="Games_catLists">Lists</span><span id="Games_catColour">Colour</span><span id="Games_catVariables">Variables</span><span id="Games_catProcedures">Functions</span><span id="Games_httpRequestError">There was a problem with the request.</span><span id="Games_linkAlert">Share your blocks with this link:\\n\\n%1</span><span id="Games_hashError">Sorry, \'%1\' doesn\'t correspond with any saved program.</span><span id="Games_xmlError">Could not load your saved file. Perhaps it was created with a different version of Blockly?</span><span id="Games_submitted">Thank you for this program!  If our staff of trained monkeys like it, they will publish it to the gallery within a couple of days.</span><span id="Games_listVariable">list</span><span id="Games_textVariable">text</span><span id="Games_breakLink">Once you start editing JavaScript, you can\'t go back to editing blocks. Is this OK?</span><span id="Games_blocks">Blocks</div></div>';
};
if (goog.DEBUG) {
  BlocklyGames.soy.messages.soyTemplateName = 'BlocklyGames.soy.messages';
}


BlocklyGames.soy.headerBar = function(opt_data, opt_ignored, opt_ijData) {
  return '<table width="100%"><tr><td style="display : none"><h1>' + BlocklyGames.soy.titleSpan(opt_data, null, opt_ijData) + ((opt_ijData.level) ? BlocklyGames.soy.levelLinks({suffix: '' + ((opt_data.levelLinkSuffix) ? soy.$$escapeHtml(opt_data.levelLinkSuffix) : '')}, null, opt_ijData) : '') + '</h1></td><td id ="brightChampsLogo" class ="companylogo"><a href="https://www.brightchamps.com/"><img id= "BClogo" src="Bright Champs logo.png" height="45px" ></a></td><td class ="farSide"><div id = "coinanimation" ><canvas id ="coin" width ="45px" height="45px" ></canvas><canvas id="coinvalue" width="80px" height="45px"></canvas><button id="helpButton">Help</button></div></td><td id="header_cta" class="farSide" width="325" style="display :none"><select id="languageMenu" style="display :none"></select>' + ((opt_data.hasLinkButton) ? '&nbsp;<button id="linkButton" style="display :none" title="Save and link to blocks."><img src="common/1x1.gif" class="link icon21"></button>' : '') + ((opt_data.hasHelpButton) ? '&nbsp;' : '') + ((opt_data.farLeftHtml) ? '&nbsp;' + soy.$$filterNoAutoescape(opt_data.farLeftHtml) : '') + '</td></tr></table><div id="fullscreenloader" class="fsloverlay"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 325 100"><path fill-opacity="0" stroke-width="1" stroke="#05eb9803" stroke-linecap="round" d="M10,10 l0,40 l8,0 c18,0,18,-25,0,-25 l-8,0 l8,0 c10,0,10,-13.5,0,-13.5 l-8,0z"/><path id="heart-pathB" fill-opacity="0" stroke-width="6" stroke="#4360FD" stroke-linecap="round" d="M10,60 l0,34 l8,0 c14,0,14,-19,0,-19 l-8,0 l8,0 c8,0,8,-15,0,-15 l-8,0z"/><path id="heart-pathr" fill-opacity="0" stroke-width="6" stroke="#4360FD" stroke-linecap="round" d="M38,95 l0,-20 m0,20 l0-10 q4-10,12,-10"/><path id="heart-pathi" fill-opacity="0" stroke-width="6" stroke="#4360FD" stroke-linecap="round" d="M60,95 l0,-20"/><path id="heart-patho" fill-opacity="0" stroke-width="4" stroke="#4360FD" d="M58,65 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0"/><path id="heart-pathg" fill-opacity="0" stroke-width="6" stroke="#4360FD" stroke-linecap="round" d="M72,95 q4,2,10,0 l0,-20 M72,95 q4,2,10,0 l0,-17 c-15,-10,-15,18,0,8"/><path id="heart-pathh" fill-opacity="0" stroke-width="6" stroke="#4360FD" stroke-linecap="round" d="M93,95 l0,-34 M93,95 l0,-10 c2,-13,15,-9,15,-2 l0,12"/><path id="heart-patht" fill-opacity="0" stroke-width="6" stroke="#4360FD" stroke-linecap="round" d="M120,64 l0,28 M120,64 l0,8 l-5,0 M120,64 l0,8 l7,0 M120,64 l0,28 c0,4,7,4,7,3.5"/><path id="heart-pathC" fill-opacity="0" stroke-width="6" stroke="#FD4343" stroke-linecap="round" d="M158,80 m0,-16 a16,16 0 1,0 3,28"/><path id="heart-pathH" fill-opacity="0" stroke-width="6" stroke="#FF8900" stroke-linecap="round" d="M171,95 l0,-34 M171,95 l0,-17 l19,0 l0,17 M171,95 l0,-17 l19,0 l0,-17"/><path id="heart-pathA" fill-opacity="0" stroke-width="6" stroke="#FFDA0B" stroke-linecap="round" d="M210.5,61 l-11,34 M210.5,61 l11,34 M210.5,61 l-8.735,27 l8.735,0 M210.5,61 l8.735,27 l-8.735,0"/><path id="heart-pathM" fill-opacity="0" stroke-width="6" stroke="#46DE60" stroke-linecap="round" d="M232,95 l0,-30 l12,15 l12,-15 l0,30"/><path id="heart-pathP" fill-opacity="0" stroke-width="6" stroke="#42C0FA" stroke-linecap="round" d="M267,95 l0,-34 l7,0 a9,9 0 0,1 0,18 l-7,0"/><path id="heart-pathS" fill-opacity="0" stroke-width="6" stroke="#F840B8" stroke-linecap="round" d="M299,68 m6.36,-6.36 a9,9 0 1,0 -8,16 l6,2  a9,9 0 0,1 -8,16 a9,9 0 0,1 -4,-3"/></svg></div><div id="miniloader" class="mloverlay"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 325 200"><path fill-opacity="0" stroke-width="1" stroke="#05eb9803" stroke-linecap="round" d="M10,10 l0,40 l8,0 c18,0,18,-25,0,-25 l-8,0 l8,0 c10,0,10,-13.5,0,-13.5 l-8,0z"/><path id="heart-mpathB" fill-opacity="0" stroke-width="6" stroke="#4360FD" stroke-linecap="round" d="M10,110 l0,34 l8,0 c14,0,14,-19,0,-19 l-8,0 l8,0 c8,0,8,-15,0,-15 l-8,0z"/><path id="heart-mpathr" fill-opacity="0" stroke-width="6" stroke="#4360FD" stroke-linecap="round" d="M38,145 l0,-20 m0,20 l0-10 q4-10,12,-10"/><path id="heart-mpathi" fill-opacity="0" stroke-width="6" stroke="#4360FD" stroke-linecap="round" d="M60,145 l0,-20"/><path id="heart-mpatho" fill-opacity="0" stroke-width="4" stroke="#4360FD" d="M58,115 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0"/><path id="heart-mpathg" fill-opacity="0" stroke-width="6" stroke="#4360FD" stroke-linecap="round" d="M72,145 q4,2,10,0 l0,-20 M72,145 q4,2,10,0 l0,-17 c-15,-10,-15,18,0,8"/><path id="heart-mpathh" fill-opacity="0" stroke-width="6" stroke="#4360FD" stroke-linecap="round" d="M93,145 l0,-34 M93,145 l0,-10 c2,-13,15,-9,15,-2 l0,12"/><path id="heart-mpatht" fill-opacity="0" stroke-width="6" stroke="#4360FD" stroke-linecap="round" d="M120,114 l0,28 M120,114 l0,8 l-5,0 M120,114 l0,8 l7,0 M120,114 l0,28 c0,4,7,4,7,3.5"/><path id="heart-mpathC" fill-opacity="0" stroke-width="6" stroke="#FD4343" stroke-linecap="round" d="M158,130 m0,-16 a16,16 0 1,0 3,28"/><path id="heart-mpathH" fill-opacity="0" stroke-width="6" stroke="#FF8900" stroke-linecap="round" d="M171,145 l0,-34 M171,145 l0,-17 l19,0 l0,17 M171,145 l0,-17 l19,0 l0,-17"/><path id="heart-mpathA" fill-opacity="0" stroke-width="6" stroke="#FFDA0B" stroke-linecap="round" d="M210.5,111 l-11,34 M210.5,111 l11,34 M210.5,111 l-8.735,27 l8.735,0 M210.5,111 l8.735,27 l-8.735,0"/><path id="heart-mpathM" fill-opacity="0" stroke-width="6" stroke="#46DE60" stroke-linecap="round" d="M232,145 l0,-30 l12,15 l12,-15 l0,30"/><path id="heart-mpathP" fill-opacity="0" stroke-width="6" stroke="#42C0FA" stroke-linecap="round" d="M267,145 l0,-34 l7,0 a9,9 0 0,1 0,18 l-7,0"/><path id="heart-mpathS" fill-opacity="0" stroke-width="6" stroke="#F840B8" stroke-linecap="round" d="M299,118 m6.36,-6.36 a9,9 0 1,0 -8,16 l6,2  a9,9 0 0,1 -8,16 a9,9 0 0,1 -4,-3"/></svg></div>';
};
if (goog.DEBUG) {
  BlocklyGames.soy.headerBar.soyTemplateName = 'BlocklyGames.soy.headerBar';
}


BlocklyGames.soy.titleSpan = function(opt_data, opt_ignored, opt_ijData) {
  return '<span id="title">' + ((opt_ijData.html) ? '<a href="index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">' : '<a href="./?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">') + 'Blockly Games</a> : ' + soy.$$escapeHtml(opt_data.appName) + '</span>';
};
if (goog.DEBUG) {
  BlocklyGames.soy.titleSpan.soyTemplateName = 'BlocklyGames.soy.titleSpan';
}


BlocklyGames.soy.levelLinks = function(opt_data, opt_ignored, opt_ijData) {
  var output = ' &nbsp; ';
  var iLimit247 = opt_ijData.maxLevel + 1;
  for (var i247 = 1; i247 < iLimit247; i247++) {
    var url__soy248 = '?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i247) + ((opt_data.suffix) ? '&' + soy.$$escapeHtml(opt_data.suffix) : '');
    output += ' ' + ((i247 == opt_ijData.level) ? '<span class="level_number level_done" id="level' + soy.$$escapeHtml(i247) + '">' + soy.$$escapeHtml(i247) + '</span>' : (i247 == opt_ijData.maxLevel) ? '<a class="level_number" id="level' + soy.$$escapeHtml(i247) + '" href="' + soy.$$escapeHtml(url__soy248) + '">' + soy.$$escapeHtml(i247) + '</a>' : '<a class="level_dot" id="level' + soy.$$escapeHtml(i247) + '" href="' + soy.$$escapeHtml(url__soy248) + '"></a>');
  }
  return output;
};
if (goog.DEBUG) {
  BlocklyGames.soy.levelLinks.soyTemplateName = 'BlocklyGames.soy.levelLinks';
}


BlocklyGames.soy.dialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogShadow" class="dialogAnimate"></div><div id="dialogBorder"></div><div id="dialog"></div>';
};
if (goog.DEBUG) {
  BlocklyGames.soy.dialog.soyTemplateName = 'BlocklyGames.soy.dialog';
}


BlocklyGames.soy.doneDialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogDone" class="dialogHiddenContent"><div style="font-size: large; margin: 1em;">Congratulations!</div><div id="dialogLinesText" style="font-size: large; margin: 1em;"></div><pre id="containerCode"></pre><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"><button id="doneOk" class="secondary">OK</button></div></div>';
};
if (goog.DEBUG) {
  BlocklyGames.soy.doneDialog.soyTemplateName = 'BlocklyGames.soy.doneDialog';
}


BlocklyGames.soy.abortDialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogAbort" class="dialogHiddenContent">This level is extremely difficult. Would you like to skip it and go onto the next game? You can always come back later.<div class="farSide" style="padding: 1ex 3ex 0"><button id="abortCancel">Cancel</button><button id="abortOk" class="secondary">OK</button></div></div>';
};
if (goog.DEBUG) {
  BlocklyGames.soy.abortDialog.soyTemplateName = 'BlocklyGames.soy.abortDialog';
}


BlocklyGames.soy.storageDialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogStorage" class="dialogHiddenContent"><div id="containerStorage"></div>' + BlocklyGames.soy.ok(null, null, opt_ijData) + '</div>';
};
if (goog.DEBUG) {
  BlocklyGames.soy.storageDialog.soyTemplateName = 'BlocklyGames.soy.storageDialog';
}


BlocklyGames.soy.ok = function(opt_data, opt_ignored, opt_ijData) {
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyDialogs.hideDialog(true)">OK</button></div>';
};
if (goog.DEBUG) {
  BlocklyGames.soy.ok.soyTemplateName = 'BlocklyGames.soy.ok';
}
