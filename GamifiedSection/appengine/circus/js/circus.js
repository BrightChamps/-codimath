/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Movie game.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Circus');

goog.require('Blockly.Comment');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FlyoutButton');
goog.require('Blockly.Toolbox');
goog.require('Blockly.Trashcan');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.style');
goog.require('Blockly.VerticalFlyout');
goog.require('Blockly.ZoomControls');
goog.require('BlocklyDialogs');
goog.require('BlocklyGallery');
goog.require('BlocklyGames');
goog.require('BlocklyInterface');
goog.require('Circus.Answers');
goog.require('Circus.Blocks');
goog.require('Circus.soy');


BlocklyGames.NAME = 'circus';

Circus.HEIGHT = 1000;
Circus.WIDTH = 1200;
/**
 * Number of frames in the animation.
 * First level has only one frame (#0).  The rest have 101 (#0-#100).
 * @type number
 */
Circus.FRAMES = BlocklyGames.LEVEL == 1 ? 0 : 100;

/**
 * Array of pixel errors, one per frame.
 */
Circus.pixelErrors = new Array(Circus.FRAMES);

/**
 * Has the level been solved once?
 */
Circus.success = false;
Circus.hidecoords = false;
/**
 * Current frame being shown.
 */
Circus.frameNumber = 0;

/**
 * Initialize Blockly and the Circus.  Called on page load.
 */
 Circus.supportsComplete = 0;
Circus.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Circus.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});
   var ctx1 = document.getElementById('support1').getContext('2d');
   var ctx2 = document.getElementById('support2').getContext('2d');
   var ctx3 = document.getElementById('support3').getContext('2d');
   var ctx4 = document.getElementById('support4').getContext('2d');
   var ctx5 = document.getElementById('support5').getContext('2d');
   var image = new Image();
   image.src = 'circus/GlowRedFinal.png';
   ctx1.drawImage(image, 0, 0, 40, 40, 0, 0, ctx1.canvas.width , ctx1.canvas.height );
   ctx2.drawImage(image, 0, 0, 40, 40, 0, 0, ctx2.canvas.width , ctx2.canvas.height );
   ctx3.drawImage(image, 0, 0, 40, 40, 0, 0, ctx3.canvas.width , ctx3.canvas.height );
   ctx4.drawImage(image, 0, 0, 40, 40, 0, 0, ctx4.canvas.width , ctx4.canvas.height );
   ctx5.drawImage(image, 0, 0, 40, 40, 0, 0, ctx5.canvas.width , ctx5.canvas.height );
  BlocklyInterface.init();
  var rtl = BlocklyGames.isRtl();
  var blocklyDiv = document.getElementById('blockly');
  var visualization = document.getElementById('visualization');
  Circus.WIDTH = 1200 * BlocklyGames.factor;
  Circus.HEIGHT = 1000 * BlocklyGames.factor;
  Circus.renderSuppourts_();
  var containerdiv = document.getElementById('Container');
  var onresize = function(e) {
    var top = visualization.offsetTop;
    blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
    blocklyDiv.style.left = rtl ? '10px' : visualization.offsetLeft + Circus.WIDTH + 20 + 'px';
    blocklyDiv.style.width = (window.innerWidth - (visualization.offsetLeft + Circus.WIDTH + 40)) + 'px';
    containerdiv.style.top = blocklyDiv.style.top;
    containerdiv.style.left = blocklyDiv.style.left;
    containerdiv.style.width = blocklyDiv.offsetWidth - 10 * BlocklyGames.factor + 'px';
    document.getElementById('next').style.top = containerdiv.offsetTop + containerdiv.offsetHeight + 150 * BlocklyGames.factor + 'px';
    document.getElementById('submit').style.top = containerdiv.offsetTop + containerdiv.offsetHeight + 150 * BlocklyGames.factor + 'px';
    document.getElementById('next').style.left = containerdiv.offsetLeft + containerdiv.offsetWidth - 300 * BlocklyGames.factor + 'px';
    document.getElementById('submit').style.left = containerdiv.offsetLeft + containerdiv.offsetWidth - 300 * BlocklyGames.factor + 'px';
    document.getElementById('previous').style.display = 'none';
  };
  window.addEventListener('scroll', function() {
    onresize(null);
    Blockly.svgResize(BlocklyInterface.workspace);
  });
  window.addEventListener('resize', onresize);
  onresize(null);
  if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
    Blockly.FieldColour.COLUMNS = 3;
    Blockly.FieldColour.COLOURS =
        ['#ff0000', '#ffcc33', '#ffff00',
         '#009900', '#3333ff', '#cc33cc',
         '#ffffff', '#999999', '#000000'];
  }

  BlocklyInterface.injectBlockly(
      {'rtl': rtl,
       'trashcan': true,
       'zoom': BlocklyGames.LEVEL == BlocklyGames.MAX_LEVEL ?
           {'controls': true, 'wheel': true} : null});
  // Prevent collisions with user-defined functions or variables.
  Blockly.JavaScript.addReservedWords('circle,line,penColour,time');


  var defaultXml = '<xml></xml>';
  BlocklyInterface.loadBlocks(defaultXml, true);

  Circus.ctxDisplay = document.getElementById('display').getContext('2d');
  Circus.ctxDisplay.globalCompositeOperation = 'source-over';
  Circus.ctxScratch = document.getElementById('scratch').getContext('2d');
  document.getElementById('display').style.width = Circus.WIDTH + 'px';
  document.getElementById('scratch').style.width = Circus.WIDTH + 'px';
  document.getElementById('display').style.height = Circus.HEIGHT + 'px';
  document.getElementById('scratch').style.height = Circus.HEIGHT + 'px';
  document.getElementById('axies').style.width = Circus.WIDTH + 'px';
  document.getElementById('axies').style.height = Circus.HEIGHT + 'px';
  document.getElementById('hatching').style.width = Circus.WIDTH + 'px';
  document.getElementById('hatching').style.height = Circus.HEIGHT + 'px';

  // Circus.renderHatching_();
  // Render the frame zero answer because we need it right now.
  Circus.renderAnswer_(0);
 // // Remaining answers may be computed later without slowing down page load.
 function renderRemainingAnswers() {
   for (var f = 1; f <= Circus.FRAMES; f++) {
     Circus.renderAnswer_(f);
   }
 }
 setTimeout(renderRemainingAnswers, 1);
  Circus.renderAxies_();
  Circus.codeChange();
  BlocklyInterface.workspace.addChangeListener(Circus.codeChange);
  Circus.display();
  Circus.renderSuppourts_();
  Circus.rideranimationvalue = true;
  Circus.riderrotation = true;

  // Preload the win sound.
  // BlocklyInterface.workspace.getAudioManager().load(
  //     ['movie/win.mp3', 'movie/win.ogg'], 'win');
  // Lazy-load the JavaScript interpreter.
  BlocklyInterface.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyInterface.importPrettify();

  BlocklyGames.bindClick('helpButton', Circus.showHelp);
  // if (location.hash.length < 2 &&
  //     !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
  //                                        BlocklyGames.LEVEL)) {
  //   // setTimeout(Circus.showHelp, 1000);
  // }

  visualization.addEventListener('mouseover', Circus.showCoordinates);
  visualization.addEventListener('mouseout', Circus.hideCoordinates);
  visualization.addEventListener('mousemove', Circus.updateCoordinates);
};

/**
 * Show the x/y coordinates.
 * @param {!Event} e Mouse over event.
 */
Circus.showCoordinates = function(e) {
  if(!Circus.hidecoords)
  document.getElementById('coordinates').style.display = 'block';
};

/**
 * Hide the x/y coordinates.
 * @param {Event} e Mouse out event.
 */
Circus.hideCoordinates = function(e) {
  document.getElementById('coordinates').style.display = 'none';
};

/**
 * Update the x/y coordinates.
 * @param {!Event} e Mouse move event.
 */
Circus.updateCoordinates = function(e) {
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
  x = (x * 240 ) / Circus.WIDTH;
  y = (y * 200) / Circus.HEIGHT;
  // Flip the y axis so the origin is at the bottom.
  y = 200 - y;
  if (rtl) {
    x += 240;
  }
  if (BlocklyGames.LEVEL == 10) {
    // Round to the nearest integer.
    x = Math.round(x);
    y = Math.round(y);
  } else {
    // Round to the nearest 10.
    // x = Math.round(x / 10) * 10;
    // y = Math.round(y / 10) * 10;
    x = Math.round(x);
    y = Math.round(y);
  }
  if (x >= 0 && x <= 240 && y >= 0 && y <= 200) {
    document.getElementById('x').textContent = 'x = ' + x;
    document.getElementById('y').textContent = 'y = ' + y;
  } else {
    Circus.hideCoordinates();
  }
};

/**
 * Show the help pop-up.
 */

/**
 * Hide the help pop-up.
 */
 Circus.showHelp = function() {
   var help = document.getElementById('help');
   var button = document.getElementById('helpButton');
   var style = {
     width: '50%',
     left: '25%',
     top: '5em'
   };
   BlocklyDialogs.showDialog(help, button, true, true, style, Circus.hideHelp);
   BlocklyDialogs.bridgeDialogKeyDown();
 };

Circus.hideHelp = function() {
  BlocklyDialogs.stopDialogKeyDown();
};

/**
 * On startup draw the expected answers and save it to answer canvases.
 * @param {number} f Frame number (0-100).
 * @private
 */
Circus.renderAnswer_ = function(f) {
  var div = document.getElementById('visualization');
  Circus.ctxScratch.strokeStyle = '#000';
  Circus.ctxScratch.fillStyle = '#000';
  // Create a new canvas object for each answer.
  // <canvas id="answer1" width="400" height="400" style="display: none">
  // </canvas>
  var canvas = document.createElement('canvas');
  canvas.id = 'answer' + f;
  canvas.width = Circus.WIDTH;
  canvas.height = Circus.HEIGHT;
  canvas.style.display = 'none';
  div.appendChild(canvas);

  // Clear the scratch canvas.
  Circus.ctxScratch.canvas.width = Circus.ctxScratch.canvas.width;
  // Render the answer.
  Circus.answer(f);
  // Copy the scratch canvas to the answer canvas.
  var ctx = canvas.getContext('2d');
  ctx.globalCompositeOperation = 'copy';
  ctx.drawImage(Circus.ctxScratch.canvas, 0, 0);
};

/**
 * On startup draw hatching that will be displayed across the answers.
 * @private
 */
// Circus.renderHatching_ = function() {
//   var ctx = document.getElementById('hatching').getContext('2d');
//   ctx.strokeStyle = '#fff';
//   ctx.lineWidth = 1;
//   for (var i = -Circus.HEIGHT; i < Circus.HEIGHT; i += 4) {
//     ctx.beginPath();
//     ctx.moveTo(i, -i);
//     ctx.lineTo(i + Circus.HEIGHT, -i + Circus.WIDTH);
//     ctx.stroke();
//   }
// };

/**
 * On startup draw the supports and save it to the supports canvases
 */
 Circus.supportangles = [30,102,189,240,282];
 Circus.renderSuppourts_ = function() {
   //centre coordinates
   // alert(BlocklyGames.factor);
   var rtl = BlocklyGames.isRtl();
   var x = (120) * 5 * BlocklyGames.factor;
   var y =   (1000 * BlocklyGames.factor - (100) * 5 * BlocklyGames.factor) ;
   var radius = (80) * 5 * BlocklyGames.factor  ;
   var viz = document.getElementById('visualization');
   Circus.circlex = viz.offsetLeft + x;
   Circus.circley = viz.offsetTop + y;
   Circus.radius = radius;
   // alert(Circus.circlex);
   // alert(x);
   var support1div = document.getElementById('support1div');
   support1div.style.top = viz.offsetTop + y - radius * Math.sin(-60 * Math.PI/180) + 'px';
   support1div.style.left = viz.offsetLeft + x + radius * Math.cos(-60 * Math.PI/180) + 'px';
   support1div.style.width =45.36  * BlocklyGames.factor + 'px';
   support1div.style.height =45.36  * BlocklyGames.factor + 'px';
   var support2div = document.getElementById('support2div');
   support2div.style.top = viz.offsetTop + y - radius * Math.sin(10 * Math.PI/180) -45.36  * BlocklyGames.factor  + 'px';
   support2div.style.left = viz.offsetLeft + x + radius * Math.cos(10 * Math.PI/180) + 'px';
   support2div.style.width =45.36  * BlocklyGames.factor + 'px';
   support2div.style.height =45.36  * BlocklyGames.factor + 'px';
   var support3div = document.getElementById('support3div');
   support3div.style.top = viz.offsetTop + y - radius * Math.sin(110 * Math.PI/180) -45.36  * BlocklyGames.factor  + 'px';
   support3div.style.left = viz.offsetLeft + x + radius * Math.cos(110 * Math.PI/180) - 45.36 * BlocklyGames.factor  + 'px';
   support3div.style.width =45.36  * BlocklyGames.factor + 'px';
   support3div.style.height =45.36  * BlocklyGames.factor + 'px';
   var support4div = document.getElementById('support4div');
   support4div.style.top = viz.offsetTop + y - radius * Math.sin(150 * Math.PI/180) - 45.36  * BlocklyGames.factor  + 'px';
   support4div.style.left = viz.offsetLeft + x + radius * Math.cos(150 * Math.PI/180) - 45.36  * BlocklyGames.factor  + 'px';
   support4div.style.width =45.36  * BlocklyGames.factor + 'px';
   support4div.style.height =45.36  * BlocklyGames.factor + 'px';
   var support5div = document.getElementById('support5div');
   support5div.style.top = viz.offsetTop + y - radius * Math.sin(190 * Math.PI/180) + 'px';
   support5div.style.left = viz.offsetLeft + x + radius * Math.cos(190 * Math.PI/180) - 45.36  * BlocklyGames.factor+ 'px';
   support5div.style.width =45.36  * BlocklyGames.factor + 'px';
   support5div.style.height =45.36  * BlocklyGames.factor + 'px';
   Circus.drawLineCoords = [[y/BlocklyGames.factor - radius/BlocklyGames.factor * Math.sin(-60 * Math.PI/180) , x/BlocklyGames.factor + radius/BlocklyGames.factor * Math.cos(-60 * Math.PI/180)],
                          [y/BlocklyGames.factor - radius/BlocklyGames.factor * Math.sin(10 * Math.PI/180) , x/BlocklyGames.factor + radius/BlocklyGames.factor * Math.cos(10 * Math.PI/180)],
                          [y/BlocklyGames.factor - radius/BlocklyGames.factor * Math.sin(110 * Math.PI/180) , x/BlocklyGames.factor + radius/BlocklyGames.factor * Math.cos(110 * Math.PI/180)],
                          [y/BlocklyGames.factor - radius/BlocklyGames.factor * Math.sin(150 * Math.PI/180) , x/BlocklyGames.factor + radius/BlocklyGames.factor * Math.cos(150 * Math.PI/180)],
                          [y/BlocklyGames.factor - radius/BlocklyGames.factor * Math.sin(190 * Math.PI/180) , x/BlocklyGames.factor + radius/BlocklyGames.factor * Math.cos(190 * Math.PI/180)]]

   var ctx1 = document.getElementById('support1').getContext('2d');
   var ctx2 = document.getElementById('support2').getContext('2d');
   var ctx3 = document.getElementById('support3').getContext('2d');
   var ctx4 = document.getElementById('support4').getContext('2d');
   var ctx5 = document.getElementById('support5').getContext('2d');
   document.getElementById('support1').style.width =45.36  * BlocklyGames.factor + 'px';
   document.getElementById('support2').style.width =45.36  * BlocklyGames.factor + 'px';
   document.getElementById('support3').style.width =45.36  * BlocklyGames.factor + 'px';
   document.getElementById('support4').style.width =45.36  * BlocklyGames.factor + 'px';
   document.getElementById('support5').style.width =45.36  * BlocklyGames.factor + 'px';
   document.getElementById('support1').style.height =45.36  * BlocklyGames.factor + 'px';
   document.getElementById('support2').style.height =45.36  * BlocklyGames.factor + 'px';
   document.getElementById('support3').style.height =45.36  * BlocklyGames.factor + 'px';
   document.getElementById('support4').style.height =45.36  * BlocklyGames.factor + 'px';
   document.getElementById('support5').style.height =45.36  * BlocklyGames.factor + 'px';

   var image = new Image();
   image.src = 'circus/GlowRedFinal.png';
   ctx1.drawImage(image, 0, 0, 40, 40, 0, 0, ctx1.canvas.width , ctx1.canvas.height );
   ctx2.drawImage(image, 0, 0, 40, 40, 0, 0, ctx2.canvas.width , ctx2.canvas.height );
   ctx3.drawImage(image, 0, 0, 40, 40, 0, 0, ctx3.canvas.width , ctx3.canvas.height );
   ctx4.drawImage(image, 0, 0, 40, 40, 0, 0, ctx4.canvas.width , ctx4.canvas.height );
   ctx5.drawImage(image, 0, 0, 40, 40, 0, 0, ctx5.canvas.width , ctx5.canvas.height );
 }
 /**
  * When called start support animation
  */
  Circus.sheetwidth = 2560;
  Circus.sheetheight = 40;
  Circus.stop = false;
  Circus.supportanimation_ = function(number)
  {
    var canvas = document.getElementById('support' + number);
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.src = 'circus/GlowRedFinal.png';
    var image = new Image();
    image.src = 'circus/square_1.png';
    var srcX = 0;
    var srcY = 0;
    var framecount = 64;
    var currentFrame = 0;
    var width = Circus.sheetwidth / framecount;
    var count = 0;
    var flag = 0;
    function updateFrame(){
      currentFrame = ++currentFrame % framecount;
      srcX = currentFrame * width;
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }
    function draw(){
        updateFrame();
        ctx.drawImage(img, srcX, srcY, width, Circus.sheetheight, 0, 0, canvas.width, canvas.height);
    }
    function timerCode(){
      draw();
      if(!Circus.stop){
        setTimeout(timerCode, 100);
      }
      else{
        Circus.renderSuppourts_();
      }
    }
    setTimeout(timerCode, 100);
  }

/**
 * When drawing complete show quiz.
 */
 Circus.Quiz = function() {
   var blockly = document.getElementById('blockly');
   blockly.style.display = 'none';
   //Questions
   Circus.myQuestions = [
    {
      question: "What kind of triangle is formed when he crosses the joints in the upper half of the circle?",
      answers: {
        a: "Right-angle Triangle",
        b: "Isoceles Triangle",
        c: "Acute-angle Triangle",
        d: "Obtuse-angle Triangle"
      },
      correctAnswer: 4
    },
    {
      question: "Where is the circumcentre of that triangle?",
      answers: {
        a: "On the largest side",
        b: "Outside the Traingle",
        c: "Inside the Triangle"
      },
      correctAnswer: 2
    },
    {
      question: "What about triangle BCE ?",
      answers: {
        a: "Isoceles Triangle",
        b: "Acute-angle Triangle",
        c: "Obtuse-angle Triangle",
        d: "Right-angle Isoceles Triangle"
      },
      correctAnswer: 4
    },
    {
      question: "What about triangle ABD ?",
      answers: {
        a: "Acute-angle traingle circumcentre lies on largest side",
        b: "Obtuse-angle triangle circumcentre lies outside",
        c: "Right-angle triangle circumcentre lies on largest side",
        d: "Acute-angle triangle circumcentre lies inside"
      },
      correctAnswer: 4
    }
  ];

  Circus.currentSlide = 0;
  Circus.questionsupports = [[2,3,4],[2,3,4],[2,3,5],[1,2,4]];
  function generateQuiz(availableQuesions, previousButton, nextButton){
      var question = document.getElementById('question');
      var choices = Array.from(document.getElementsByClassName('choice-text'));
      var choiceContainer = Array.from(document.getElementsByClassName('choice-container'));
      var currentQuestion = {};
      var currentanswers = {}
      var acceptingAnswers = false;
      var score = 0;
      var questionCounter = 0;
      // var availableQuesions = [];

      function startGame() {
      questionCounter = 0;
      score = 0;
      // availableQuesions = questions;
      getNewQuestion(Circus.currentSlide);
      };

      function getNewQuestion(questionIndex) {
          if (availableQuesions.length === 0 || questionCounter >= Circus.myQuestions.length) {
              //go to the end page
              return;
          }
          Circus.updateDisplay();
          Circus.namingSupports();
          Circus.currentSlide += questionIndex - Circus.currentSlide;
          questionCounter++;
          Circus.supportsComplete = 0;
          // var questionIndex = Circus.currentSlide++;
          currentQuestion = availableQuesions[questionIndex];
          question.innerText = currentQuestion.question;
          currentanswers = Circus.myQuestions[questionIndex].answers;
          var flag = 'abcd';
          var answers_ = new Array();
          var abc = 0;
          for(var letter in Circus.myQuestions[questionIndex].answers)
          {
            abc++;
          }
          switch (abc) {
            case 3:
              answers_.push(Circus.myQuestions[questionIndex].answers.a);
              answers_.push(Circus.myQuestions[questionIndex].answers.b);
              answers_.push(Circus.myQuestions[questionIndex].answers.c);
              break;
            case 4:
              answers_.push(Circus.myQuestions[questionIndex].answers.a);
              answers_.push(Circus.myQuestions[questionIndex].answers.b);
              answers_.push(Circus.myQuestions[questionIndex].answers.c);
              answers_.push(Circus.myQuestions[questionIndex].answers.d);
              break;
          }
          var count = 0;
          choices.forEach(function(choice) {
              var number = choice.dataset['number'];
              choice.innerText = answers_[count++];
          });
          choiceContainer.forEach(function(choice) {
            choice.style.visibility = 'hidden';
          })
          acceptingAnswers = true;
          nextButton.style.display = 'none';
          nextButton.disabled = false;
          Circus.riderrotation = true;
          Circus.stop = false;
          Circus.rotaterider();
      };
      choices.forEach(function(choice) {
          choice.addEventListener('click', function(e){
              if (!acceptingAnswers) return;

              acceptingAnswers = false;
              var selectedChoice = e.target;
              var correctAnswer_ = currentQuestion.correctAnswer;
              var selectedAnswer = selectedChoice.dataset['number'];
              Circus.correctchoice = document.querySelector('[data-number = "' + correctAnswer_ +'"]');
              var classToApply =
                  selectedAnswer == currentQuestion.correctAnswer ? 'correct' : 'incorrect';
              if(selectedAnswer!=null)
                BlocklyGames.coinval += selectedAnswer == currentQuestion.correctAnswer ? 10 : -10;
              BlocklyGames.updatecoinvalue();
              selectedChoice.parentElement.classList.add(classToApply);
              setTimeout(function(){
                if (classToApply === 'incorrect') {
                    Circus.correctchoice.parentElement.classList.add('correct');
                }
              },1000);
              setTimeout(function() {
                  if(Circus.currentSlide < Circus.myQuestions.length-1)
                  {
                    selectedChoice.parentElement.classList.remove(classToApply);
                    Circus.correctchoice.parentElement.classList.remove('correct');
                    setTimeout(function(){
                      Circus.stop = true;
                      Circus.renderSuppourts_();
                    },100);
                    setTimeout(function(){
                      getNewQuestion(Circus.currentSlide + 1);
                    },400);

                  }
              }, 2000);
          });
      });
      Circus.greencorrect = function() {
        Circus.correctchoice = document.querySelector('[data-number = "' + Circus.myQuestions[Circus.currentSlide].correctAnswer +'"]');
        Circus.correctchoice.parentElement.classList.add('correct');
        setTimeout(function () {
          Circus.correctchoice.parentElement.classList.remove('correct');
        },2000)
      };
        submitButton.onclick = function(){
          this.disabled = true;
          Circus.greencorrect();
          setTimeout(function(){
            BlocklyInterface.nextLevel();
          },2200);
        }
        nextButton.onclick = function(){
          this.disabled = true;
          Circus.greencorrect();
          setTimeout(function(){
            Circus.stop = true;
            Circus.renderSuppourts_();
          },2100);
          setTimeout(function(){
            getNewQuestion(Circus.currentSlide + 1);
          },2400);
        }

      startGame();
  }

  var submitButton = document.getElementById("submit");
  var previousButton = document.getElementById("previous");
  var nextButton = document.getElementById("next");

  submitButton.style.minWidth = previousButton.offsetWidth + 'px';
  submitButton.style.display = 'none';
  previousButton.style.display = 'none';
  nextButton.style.minWidth = previousButton.offsetWidth + 'px';
  generateQuiz(Circus.myQuestions, previousButton, nextButton);
 }

/**
 * On startup draw the axis scales and save it to the axies canvas.
 * @private
 */
Circus.renderAxies_ = function() {
  var ctx = document.getElementById('axies').getContext('2d');
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#bba';
  ctx.fillStyle = '#bba';
  ctx.font = 'normal 14px sans-serif';
  var TICK_LENGTH = 9;
  var major = 1;
  // alert(Circus.HEIGHT);
  for (var i = 0.1; i < 2.4; i += 0.1) {
    // Bottom edge.
    ctx.beginPath();
    ctx.moveTo(i * (ctx.canvas.width / 2.4) , ctx.canvas.height);
    ctx.lineTo(i * (ctx.canvas.width / 2.4), ctx.canvas.height - TICK_LENGTH * major);
    ctx.stroke();
    if (major == 2) {
      ctx.fillText(Math.round(i * 100), i * (ctx.canvas.width / 2.4) + 2, ctx.canvas.height - 4);
    }
    major = major == 1 ? 2 : 1;
  }
  major = 1;
  for (var i = 0.1; i < 2; i += 0.1) {
    // Left edge.
    ctx.beginPath();
    ctx.moveTo(0, i * (ctx.canvas.height / 2));
    ctx.lineTo(TICK_LENGTH * major, i * (ctx.canvas.height / 2));
    ctx.stroke();
    if (major == 2) {
      ctx.fillText(Math.round(200 - i * 100), 3, i * (ctx.canvas.height / 2) - 2);
    }
    major = major == 1 ? 2 : 1;
  }
  //Naming Supports
};
Circus.namingSupports = function() {
  Circus.ctxDisplay.beginPath();
  Circus.ctxDisplay.font = 45 * BlocklyGames.factor + "px Georgia";
  Circus.ctxDisplay.fillStyle = "#1CB67E";
  var viz = document.getElementById('visualization');
  var x = 120 * 5 ;
  var y = (100 * 5) ;
  var radius = 80 * 5 ;
  // Circus.ctxDisplay.fillText('A',x , y);
  Circus.ctxDisplay.fillText('A',x + radius * Math.cos(60 * Math.PI/180) + 50 , y + radius * Math.sin(60 * Math.PI/180) + 32.5);
  Circus.ctxDisplay.fillText('B',x + radius * Math.cos(-10 * Math.PI/180) + 50, y + radius * Math.sin(-10 * Math.PI/180) + - 12.5);
  Circus.ctxDisplay.fillText('C',x + radius * Math.cos(-110 * Math.PI/180) - 75, y + radius * Math.sin(-110 * Math.PI/180) + - 12.5);
  Circus.ctxDisplay.fillText('D',x + radius * Math.cos(-150 * Math.PI/180) - 75, y + radius * Math.sin(-150 * Math.PI/180) + - 12.5);
  Circus.ctxDisplay.fillText('E',x + radius * Math.cos(-190 * Math.PI/180) - 75, y + radius * Math.sin(-190 * Math.PI/180) + 32.5);
}
/**
 * Draw one frame of the Circus.
 * @param {!Interpreter} interpreter A JS-Interpreter loaded with user code.
 * @private
 */
Circus.drawFrame_ = function(interpreter) {
  // Clear the canvas.
  Circus.ctxScratch.canvas.width = Circus.ctxScratch.canvas.width;
  Circus.ctxScratch.strokeStyle = '#000';
  Circus.ctxScratch.fillStyle = '#000';
  // Levels 1-9 should be slightly transparent so eclipsed blocks may be seen.
  // Level 10 should be opaque so that the circus is clean.
  Circus.ctxScratch.globalAlpha =
      (BlocklyGames.LEVEL == BlocklyGames.MAX_LEVEL) ? 1 : 0.9;

  var go = true;
  for (var tick = 0; go && tick < 10000; tick++) {
    try {
      go = interpreter.step();
    } catch (e) {
      // User error, terminate in shame.
      alert(e);
      go = false;
    }
  }
};
  Circus.rideranimationvalue = false;
  Circus.rideranimation = function(){
    var canvas = document.getElementById('ridercanvas');
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.src = 'circus/bike.png';
    var rider = document.getElementById('rider');
    var x = 120 * 5 * BlocklyGames.factor;
    var y = 100 * 5 * BlocklyGames.factor;
    var radius = 80 * 5 * BlocklyGames.factor;
    var Sheetwidth1 = 920;
    var Sheetheight1 = 260;
    var frameCount = 8;
    var width = Sheetwidth1/frameCount;
    canvas.style.width = (115 /0.6614397743911439)  * BlocklyGames.factor + 'px';
    canvas.style.height = radius + 'px';
    x = x - (canvas.offsetWidth/2);
    var viz = document.getElementById('visualization');
    rider.style.top = viz.offsetTop + y + 'px';
    rider.style.left = viz.offsetLeft + x + 'px';
    // rider.style.border = "1px solid #ccc";
    var srcX;
    var srcY;
    var currentFrame = 0;
    function updateFrame(){
      currentFrame = ++currentFrame % frameCount;
      srcX = currentFrame * width;
      srcY = 0;
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }
    function draw(){
      updateFrame();
      ctx.drawImage(img,srcX,srcY,width,Sheetheight1,0,0,canvas.width,canvas.height);
    }
    function timerCode(){
        draw();
        setTimeout(timerCode,100);
    }
    setTimeout(timerCode,100);
  }
  Circus.anglerotation = 3;
  Circus.anglerotated = 0;
  Circus.riderrotation = false;
  Circus.rotaterider = function(){
    var rider = document.getElementById('rider');
    rider.style.transformOrigin = "50% 0";
    function timerCode(){
      if(Circus.riderrotation){
        Circus.anglerotated += Circus.anglerotation;
        rider.style.transform = "rotate(-"+Circus.anglerotated+"deg)";
        if(Circus.anglerotated == 360)
        {
          Circus.anglerotated = 0;
        }
        Circus.questionrotation();
        setTimeout(timerCode,100);
      }
    }
    setTimeout(timerCode,100);
  }
  Circus.questionrotation = function() {
    if(Circus.anglerotated == Circus.supportangles[Circus.questionsupports[Circus.currentSlide][0] - 1] ){
      Circus.supportanimation_(Circus.questionsupports[Circus.currentSlide][0]); Circus.supportsComplete++;}
    else if(Circus.anglerotated == Circus.supportangles[Circus.questionsupports[Circus.currentSlide][1] - 1]){
      Circus.supportanimation_(Circus.questionsupports[Circus.currentSlide][1]);Circus.supportsComplete++;}
    else if(Circus.anglerotated == Circus.supportangles[Circus.questionsupports[Circus.currentSlide][2] - 1]){
      Circus.supportanimation_(Circus.questionsupports[Circus.currentSlide][2]);Circus.supportsComplete++;}
    else if(Circus.anglerotated == (Circus.supportangles[Circus.questionsupports[Circus.currentSlide][2] - 1] + 60) && Circus.supportsComplete == 3){
      Circus.riderrotation = false;
      var choiceContainer = Array.from(document.getElementsByClassName('choice-container'));
      choiceContainer.forEach(function(choice) {
        choice.style.visibility = 'visible';
      })
      Circus.drawLines();
      document.getElementById("next").style.display = 'initial';
      if(Circus.currentSlide == Circus.myQuestions.length - 1)
      {
        document.getElementById("submit").style.display = 'initial';
        document.getElementById("next").style.display = 'none';
      }
    }
  }
  Circus.drawLines = function() {
    var ctx = document.getElementById('axies').getContext('2d');
    Circus.ctxDisplay.beginPath();
    Circus.ctxDisplay.strokeStyle = 'black';
    Circus.ctxDisplay.setLineDash([5,3]);
    Circus.ctxDisplay.lineWidth = 2;
    setTimeout(function() {
      Circus.ctxDisplay.moveTo(Circus.drawLineCoords[Circus.questionsupports[Circus.currentSlide][0] - 1][1] , Circus.drawLineCoords[Circus.questionsupports[Circus.currentSlide][0] - 1][0]);
      Circus.ctxDisplay.lineTo(Circus.drawLineCoords[Circus.questionsupports[Circus.currentSlide][1] - 1][1] , Circus.drawLineCoords[Circus.questionsupports[Circus.currentSlide][1] - 1][0]);
      Circus.ctxDisplay.stroke();
    } ,150)
    setTimeout(function() {
      Circus.ctxDisplay.moveTo(Circus.drawLineCoords[Circus.questionsupports[Circus.currentSlide][1] - 1][1] , Circus.drawLineCoords[Circus.questionsupports[Circus.currentSlide][1] - 1][0]);
      Circus.ctxDisplay.lineTo(Circus.drawLineCoords[Circus.questionsupports[Circus.currentSlide][2] - 1][1] , Circus.drawLineCoords[Circus.questionsupports[Circus.currentSlide][2] - 1][0]);
      Circus.ctxDisplay.stroke();
    } ,300)
    setTimeout(function() {
      Circus.ctxDisplay.moveTo(Circus.drawLineCoords[Circus.questionsupports[Circus.currentSlide][2] - 1][1] , Circus.drawLineCoords[Circus.questionsupports[Circus.currentSlide][2] - 1][0]);
      Circus.ctxDisplay.lineTo(Circus.drawLineCoords[Circus.questionsupports[Circus.currentSlide][0] - 1][1] , Circus.drawLineCoords[Circus.questionsupports[Circus.currentSlide][0] - 1][0]);
      Circus.ctxDisplay.stroke();
      Circus.ctxDisplay.setLineDash([]);
    } ,450)
  }
  Circus.updateDisplay = function() {
    Circus.ctxDisplay.beginPath();
    Circus.ctxDisplay.rect(0, 0,
        Circus.ctxDisplay.canvas.width, Circus.ctxDisplay.canvas.height);
    Circus.ctxDisplay.fillStyle = '#ffffff';
    Circus.ctxDisplay.fill();
    Circus.ctxDisplay.drawImage(Circus.ctxScratch.canvas, 0, 0);
    Circus.namingSupports();
    Circus.hidecoords = true;
  }
/**
 * Generate new JavaScript if the code has changed.
 * @param {!Blockly.Events.Abstract=} opt_e Change event.
 */
Circus.codeChange = function(opt_e) {
  if (opt_e instanceof Blockly.Events.Ui) {
    return;
  }
  if (BlocklyInterface.workspace.isDragging()) {
    // Don't update code during a drag (insertion markers mess everything up).
    return;
  }
  var code = BlocklyInterface.getJsCode();
  if (BlocklyInterface.executedJsCode == code) {
    return;
  }
  // Code has changed, clear all recorded frame info.
  Circus.pixelErrors = new Array(Circus.FRAMES);
  BlocklyInterface.executedJsCode = code;
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
  Circus.display();
};

Circus.BikeEntry = function(){
  Circus.ctxDisplay.beginPath();
  Circus.ctxDisplay.rect(0, 0,
      Circus.ctxDisplay.canvas.width, Circus.ctxDisplay.canvas.height);
  Circus.ctxDisplay.fillStyle = '#ffffff';
  Circus.ctxDisplay.fill();
  var img = new Image();
  img.src = "circus/circus-side-view1.png";
  var srcX;
  var srcY;
  var currentFrame = 0;
  var frameCount = 2;
  Circus.hidecoords = true;
  Circus.hideSupports();
  function update() {
    currentFrame = ++currentFrame % frameCount;
    srcX = currentFrame * 1200;
    srcY = 0;
    Circus.ctxDisplay.rect(0, 0,
        Circus.ctxDisplay.canvas.width, Circus.ctxDisplay.canvas.height);
    Circus.ctxDisplay.fillStyle = '#ffffff';
    Circus.ctxDisplay.fill();
  }
  function draw() {
    update();
    Circus.ctxDisplay.drawImage(img, srcX, srcY, 1200, 1000, 0 , 0, Circus.ctxDisplay.canvas.width, Circus.ctxDisplay.canvas.height);
  }
  function timerCode(){
      draw();
      if(!Circus.entry)
      setTimeout(timerCode,200);
  }
  setTimeout(timerCode,200);
}
Circus.hideSupports = function() {
  document.getElementById('support1').style.display = "none";
  document.getElementById('support2').style.display = "none";
  document.getElementById('support3').style.display = "none";
  document.getElementById('support4').style.display = "none";
  document.getElementById('support5').style.display = "none";
}
Circus.showSupports = function() {
  document.getElementById('support1').style.display = "initial";
  document.getElementById('support2').style.display = "initial";
  document.getElementById('support3').style.display = "initial";
  document.getElementById('support4').style.display = "initial";
  document.getElementById('support5').style.display = "initial";
}
Circus.riderEntry = function() {
  var canvas = document.getElementById('ridercanvas');
  var ctx = canvas.getContext('2d');
  var img = new Image();
  img.src = 'circus/bike.png';
  var rider = document.getElementById('rider');
  var xfinal = 120 * 5 * BlocklyGames.factor;
  var x = 0;
  var y = 100 * 5 * BlocklyGames.factor;
  var radius = 80 * 5 * BlocklyGames.factor;
  var Sheetwidth1 = 920;
  var Sheetheight1 = 260;
  var frameCount = 8;
  var width = Sheetwidth1/frameCount;
  canvas.style.width = (115 /0.6614397743911439)  * BlocklyGames.factor + 'px';
  canvas.style.height = radius + 'px';
  x = x - (canvas.offsetWidth/2);
  var viz = document.getElementById('visualization');
  rider.style.top = viz.offsetTop + y + 'px';
  rider.style.left = viz.offsetLeft + x + 'px';
  // rider.style.border = "1px solid #ccc";
  var srcX;
  var srcY;
  var currentFrame = 0;
  function updateFrame(){
    rider.style.left = viz.offsetLeft + x + 'px';
    x += 5;
    currentFrame = ++currentFrame % frameCount;
    srcX = currentFrame * width;
    srcY = 0;
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  function draw(){
    updateFrame();
    ctx.drawImage(img,srcX,srcY,width,Sheetheight1,0,0,canvas.width,canvas.height);
  }
  function timerCode(){
      draw();
      if(x >= xfinal){
        Circus.entry = true;
        setTimeout(Circus.updateDisplay, 500);
        setTimeout(Circus.showSupports,500);
        setTimeout(Circus.namingSupports,500);
        setTimeout(Circus.Quiz,500);
        setTimeout(Circus.rideranimation,500);
      }
      else {
        setTimeout(timerCode,100);
      }
  }
  setTimeout(timerCode,100);
}

/**
 * Copy the scratch canvas to the display canvas.
 * @param {number=} opt_frameNumber Which frame to draw (0-100).
 *     If not defined, draws the current frame.
 */
Circus.display = function(opt_frameNumber) {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(function() {Circus.display(opt_frameNumber);}, 250);
    return;
  }
  if (typeof opt_frameNumber == 'number') {
    Circus.frameNumber = opt_frameNumber;
  }
  var frameNumber = Circus.frameNumber;

  // Clear the display with white.
  Circus.ctxDisplay.beginPath();
  Circus.ctxDisplay.rect(0, 0,
      Circus.ctxDisplay.canvas.width, Circus.ctxDisplay.canvas.height);
  Circus.ctxDisplay.fillStyle = '#ffffff';
  Circus.ctxDisplay.fill();

  // Copy the answer.
  // var answer = document.getElementById('answer' + frameNumber);
  // if (answer) {
  //   Circus.ctxDisplay.globalAlpha = 0.2;
  //   Circus.ctxDisplay.drawImage(answer, 0, 0);
  //   Circus.ctxDisplay.globalAlpha = 1;
  // }

  // Copy the hatching.
  // var hatching = document.getElementById('hatching');
  // Circus.ctxDisplay.drawImage(hatching, 0, 0);

  // Draw and copy the user layer.
  var code = BlocklyInterface.executedJsCode;
  try {
    var interpreter = new Interpreter(code, Circus.initInterpreter);
  } catch (e) {
    // Trap syntax errors: break outside a loop, or return outside a function.
    console.error(e);
  }
  if (interpreter) {
    Circus.drawFrame_(interpreter);
  } else {
    // In the event of a syntax error, clear the canvas.
    Circus.ctxScratch.canvas.width = Circus.ctxScratch.canvas.width;
  }
  Circus.ctxDisplay.drawImage(Circus.ctxScratch.canvas, 0, 0);

  // Copy the axies.
  Circus.ctxDisplay.drawImage(document.getElementById('axies'), 0, 0);
  Circus.namingSupports();

  Circus.checkFrameAnswer();
  if (BlocklyGames.LEVEL == 1) {
    setTimeout(Circus.checkAnswers, 1000);
  }
  Circus.renderSuppourts_();
};

/**
 * Inject the Movie API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS-Interpreter.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Circus.initInterpreter = function(interpreter, globalObject) {
  // API
  var wrapper;
  wrapper = function(x, y, radius, width) {
    Circus.circle(x, y, radius, width);
  };
  interpreter.setProperty(globalObject, 'circle',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(x1, y1, x2, y2, w) {
    Circus.line(x1, y1, x2, y2, w);
  };
  interpreter.setProperty(globalObject, 'line',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(x1, y1, x2, y2) {
    Circus.midpoint(x1, y1, x2, y2);
  };
  interpreter.setProperty(globalObject, 'midpoint',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(x1, y1, x2, y2) {
    Circus.radiusCalculate(x1, y1, x2, y2);
  };
  interpreter.setProperty(globalObject, 'radiusCalculate',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(x1, y1, x2, y2, w, l) {
    Circus.perpendicularline(x1, y1, x2, y2, w, l);
  };
  interpreter.setProperty(globalObject, 'perpendicularline',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(colour) {
    Circus.penColour(colour);
  };
  interpreter.setProperty(globalObject, 'penColour',
      interpreter.createNativeFunction(wrapper));

  wrapper = function() {
    return Circus.frameNumber;
  };
  interpreter.setProperty(globalObject, 'time',
      interpreter.createNativeFunction(wrapper));
};

/**
 * Convert from ideal 0-100 coordinates to canvas's 0-400 coordinates.
 */
Circus.SCALE = (Circus.WIDTH / 240);
// alert((Circus.WIDTH / 240) + ', ' + (Circus.HEIGHT / 200));
/**
 * Draw a circle.
 * @param {number} x Horizontal location of centre (0-100).
 * @param {number} y Vertical location of centre (0-100).
 * @param {number} radius Radius of circle.
 */
Circus.circle = function(x, y, radius, width) {
  y = 200 - y;
  x *= Circus.SCALE;
  y *= Circus.SCALE;
  radius = Math.max(radius * Circus.SCALE, 0);
  width = Math.max(width * Circus.SCALE, 0);
  Circus.ctxScratch.beginPath();
  Circus.ctxScratch.lineWidth = width;
  Circus.ctxScratch.arc(x, y, radius, 0, 2 * Math.PI, false);
  Circus.ctxScratch.stroke();
};

/**

/**
 * Draw a rectangle.
 * @param {number} x1 Horizontal location of start (0-100).
 * @param {number} y1 Vertical location of start (0-100).
 * @param {number} x2 Horizontal location of end (0-100).
 * @param {number} y2 Vertical location of end (0-100).
 * @param {number} width Width of line.
 */
Circus.line = function(x1, y1, x2, y2, width) {
  y1 = 200 - y1;
  y2 = 200 - y2;
  x1 *= Circus.SCALE;
  y1 *= Circus.SCALE;
  x2 *= Circus.SCALE;
  y2 *= Circus.SCALE;
  width *= Circus.SCALE;
  Circus.ctxScratch.beginPath();
  Circus.ctxScratch.moveTo(x1, y1);
  Circus.ctxScratch.lineTo(x2, y2);
  Circus.ctxScratch.lineWidth = Math.max(width, 0);
  Circus.ctxScratch.stroke();
};

Circus.midpoint = function(x1,y1,x2,y2) {
  var answerX = (x1 + x2) / 2;
  var answerY = (y1 + y2) / 2;
  document.getElementById('functionvalue').style.display = 'block';
  document.getElementById('returnvalue').textContent = 'Mid Point : x = ' + answerX + '    y = ' + answerY;
}
Circus.radiusCalculate = function(x1,y1,x2,y2) {
  var radius = Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1),2))
  document.getElementById('functionvalue').style.display = 'block';
  document.getElementById('returnvalue').textContent = 'Radius : ' + radius;
}

Circus.perpendicularline = function(x1, y1, x2, y2, width, length) {
  y1 = 200 - y1;
  y2 = 200 - y2;
  x1 *= Circus.SCALE;
  y1 *= Circus.SCALE;
  x2 *= Circus.SCALE;
  y2 *= Circus.SCALE;
  width *= Circus.SCALE;
  length *= Circus.SCALE;
  Circus.ctxScratch.beginPath();
  Circus.ctxScratch.moveTo(x1, y1);
  var angle = Math.atan((y1-y2) /(x1-x2)) * 180 / Math.PI;
  var x, y;
  if(angle > 0)
  {
    x = x1 + length * Math.cos(-(angle + 90) * Math.PI / 180)
    y = y1 - length * Math.sin(-(angle + 90) * Math.PI / 180);
  }
  else {
    x = x1 + length * Math.cos((-angle + 90) * Math.PI / 180);
    y = y1 - length * Math.sin((-angle + 90) * Math.PI / 180);
  }
  Circus.ctxScratch.lineTo(x,y);
  Circus.ctxScratch.lineWidth = Math.max(width, 0);
  Circus.ctxScratch.stroke();
};

/**
 * Change the colour of the pen.
 * @param {string} colour Hexadecimal #rrggbb colour string.
 */
Circus.penColour = function(colour) {
  Circus.ctxScratch.strokeStyle = colour;
  Circus.ctxScratch.fillStyle = colour;
};

/**
 * Verify if the answer to this frame is correct.
 */
Circus.checkFrameAnswer = function() {
  // Compare the Alpha (opacity) byte of each pixel in the user's image and
  // the sample answer image.
  var answer = document.getElementById('answer' + Circus.frameNumber);
  if (!answer) {
    return;
  }
  var ctxAnswer = answer.getContext('2d');
  var answerImage = ctxAnswer.getImageData(0, 0, Circus.WIDTH, Circus.HEIGHT);
  var userImage =
      Circus.ctxScratch.getImageData(0, 0, Circus.WIDTH, Circus.HEIGHT);
  var len = Math.min(userImage.data.length, answerImage.data.length);
  var delta = 0;
  // Pixels are in RGBA format.  Only check the Alpha bytes.
  for (var i = 3; i < len; i += 4) {
    // Check the Alpha byte.
    if (Math.abs(userImage.data[i] - answerImage.data[i]) > 96) {
      delta++;
    }
  }
  Circus.pixelErrors[Circus.frameNumber] = delta;
};

/**
 * Verify if all the answers are correct.
 * If so, move on to next level.
 */
Circus.checkAnswers = function() {
  if (BlocklyGames.LEVEL > 1 && Circus.frameNumber != Circus.FRAMES) {
    // Only check answers at the end of the run.
    return;
  }
  if (Circus.isCorrect() && !Circus.success) {
    Circus.success = true;
    // BlocklyInterface.saveToLocalStorage();
    if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
      // No congrats for last level, it is open ended.
      // BlocklyInterface.workspace.getAudioManager().play('win', 0.5);
      // BlocklyDialogs.congratulations();
      // setTimeout(Circus.Quiz,3000);
      // setTimeout(Circus.rideranimation,3000);
      Circus.entry = false;
      setTimeout(Circus.BikeEntry, 2000);
      setTimeout(Circus.riderEntry, 2000);
    }
  }
};


window.addEventListener('load', Circus.init);
