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

goog.provide('Movie');

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
goog.require('Movie.Answers');
goog.require('Movie.Blocks');
goog.require('Movie.soy');


BlocklyGames.NAME = 'movie';

Movie.HEIGHT = 600;
Movie.WIDTH = 680;
Movie.Coins = 0;
Movie.correctBonus = 20;
/**
 * Number of frames in the animation.
 * First level has only one frame (#0).  The rest have 101 (#0-#100).
 * @type number
 */
Movie.FRAMES = BlocklyGames.LEVEL == 1 ? 0 : 100;

/**
 * Array of pixel errors, one per frame.
 */
Movie.pixelErrors = new Array(Movie.FRAMES);

/**
 * Has the level been solved once?
 */
Movie.success = false;

/**
 * Current frame being shown.
 */
Movie.frameNumber = 0;

/**
 * Initialize Blockly and the movie.  Called on page load.
 */
 Movie.supportsComplete = 0;
Movie.init = function() {
  // Render the Soy template.
  document.body.innerHTML = Movie.soy.start({}, null,
      {lang: BlocklyGames.LANG,
       level: BlocklyGames.LEVEL,
       maxLevel: BlocklyGames.MAX_LEVEL,
       html: BlocklyGames.IS_HTML});

  BlocklyInterface.init();

  var rtl = BlocklyGames.isRtl();
  var blocklyDiv = document.getElementById('blockly');
  var visualization = document.getElementById('visualization');
  var onresize = function(e) {
    var top = visualization.offsetTop;
    blocklyDiv.style.top = Math.max(10, top - window.pageYOffset) + 'px';
    blocklyDiv.style.left = rtl ? '10px' : '700px';
    blocklyDiv.style.width = (window.innerWidth - 720) + 'px';
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

  Movie.ctxDisplay = document.getElementById('display').getContext('2d');
  Movie.ctxDisplay.globalCompositeOperation = 'source-over';
  Movie.ctxScratch = document.getElementById('scratch').getContext('2d');
  // Movie.renderHatching_();
  // Render the frame zero answer because we need it right now.
  Movie.renderAnswer_(0);
  // // Remaining answers may be computed later without slowing down page load.
  function renderRemainingAnswers() {
    for (var f = 1; f <= Movie.FRAMES; f++) {
      Movie.renderAnswer_(f);
    }
  }
  setTimeout(renderRemainingAnswers, 1);
  Movie.renderAxies_();
  Movie.renderSuppourts_();
  Movie.codeChange();
  BlocklyInterface.workspace.addChangeListener(Movie.codeChange);
  Movie.display();
  Movie.rideranimationvalue = true;
  // Movie.rideranimation();
  Movie.riderrotation = true;
  // Movie.rotaterider();
  // setTimeout(function(){
  //   Movie.riderrotation = false;
  // },5000);
  // setTimeout(function(){
//     setTimeout(function(){
//          Movie.riderrotation = true;
//         },1000);
// Movie.rotaterider();

  // Preload the win sound.
  // BlocklyInterface.workspace.getAudioManager().load(
  //     ['movie/win.mp3', 'movie/win.ogg'], 'win');
  // Lazy-load the JavaScript interpreter.
  BlocklyInterface.importInterpreter();
  // Lazy-load the syntax-highlighting.
  BlocklyInterface.importPrettify();

  BlocklyGames.bindClick('helpButton', Movie.showHelp);
  // if (location.hash.length < 2 &&
  //     !BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME,
  //                                        BlocklyGames.LEVEL)) {
  //   // setTimeout(Movie.showHelp, 1000);
  // }

  visualization.addEventListener('mouseover', Movie.showCoordinates);
  visualization.addEventListener('mouseout', Movie.hideCoordinates);
  visualization.addEventListener('mousemove', Movie.updateCoordinates);
};

/**
 * Show the x/y coordinates.
 * @param {!Event} e Mouse over event.
 */
Movie.showCoordinates = function(e) {
  document.getElementById('coordinates').style.display = 'block';
};

/**
 * Hide the x/y coordinates.
 * @param {Event} e Mouse out event.
 */
Movie.hideCoordinates = function(e) {
  document.getElementById('coordinates').style.display = 'none';
};

/**
 * Update the x/y coordinates.
 * @param {!Event} e Mouse move event.
 */
Movie.updateCoordinates = function(e) {
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
  x /= 4;
  y /= 4;
  // Flip the y axis so the origin is at the bottom.
  y = 150 - y;
  if (rtl) {
    x += 180;
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
  if (x >= 0 && x <= 170 && y >= 0 && y <= 150) {
    document.getElementById('x').textContent = 'x = ' + x;
    document.getElementById('y').textContent = 'y = ' + y;
  } else {
    Movie.hideCoordinates();
  }
};

/**
 * Show the help pop-up.
 */
Movie.showHelp = function() {
  var help = document.getElementById('help');
  var button = document.getElementById('helpButton');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };

  if (BlocklyGames.LEVEL == 2) {
    var xml = '<xml><block type="movie_time" x="15" y="10"></block></xml>';
    BlocklyInterface.injectReadonly('sampleHelp2', xml);
  }

  BlocklyDialogs.showDialog(help, button, true, true, style, Movie.hideHelp);
  BlocklyDialogs.startDialogKeyDown();
};

/**
 * Hide the help pop-up.
 */
Movie.hideHelp = function() {
  BlocklyDialogs.stopDialogKeyDown();
};

/**
 * On startup draw the expected answers and save it to answer canvases.
 * @param {number} f Frame number (0-100).
 * @private
 */
Movie.renderAnswer_ = function(f) {
  var div = document.getElementById('visualization');
  Movie.ctxScratch.strokeStyle = '#000';
  Movie.ctxScratch.fillStyle = '#000';
  // Create a new canvas object for each answer.
  // <canvas id="answer1" width="400" height="400" style="display: none">
  // </canvas>
  var canvas = document.createElement('canvas');
  canvas.id = 'answer' + f;
  canvas.width = Movie.WIDTH;
  canvas.height = Movie.HEIGHT;
  canvas.style.display = 'none';
  div.appendChild(canvas);

  // Clear the scratch canvas.
  Movie.ctxScratch.canvas.width = Movie.ctxScratch.canvas.width;
  // Render the answer.
  Movie.answer(f);
  // Copy the scratch canvas to the answer canvas.
  var ctx = canvas.getContext('2d');
  ctx.globalCompositeOperation = 'copy';
  ctx.drawImage(Movie.ctxScratch.canvas, 0, 0);
};

/**
 * On startup draw hatching that will be displayed across the answers.
 * @private
 */
// Movie.renderHatching_ = function() {
//   var ctx = document.getElementById('hatching').getContext('2d');
//   ctx.strokeStyle = '#fff';
//   ctx.lineWidth = 1;
//   for (var i = -Movie.HEIGHT; i < Movie.HEIGHT; i += 4) {
//     ctx.beginPath();
//     ctx.moveTo(i, -i);
//     ctx.lineTo(i + Movie.HEIGHT, -i + Movie.WIDTH);
//     ctx.stroke();
//   }
// };

/**
 * On startup draw the supports and save it to the supports canvases
 */
 Movie.supportangles = [30,120,200,240,300];
 Movie.renderSuppourts_ = function() {
   //centre coordinates
   var rtl = BlocklyGames.isRtl();
   var x = 85 * 4;
   var y = 600 - 75 * 4;
   var radius = 65 * 4;
   var viz = document.getElementById('visualization');
   Movie.circlex = viz.offsetLeft + x;
   Movie.circley = viz.offsetTop + y;
   Movie.radius = radius;

   var support1div = document.getElementById('support1div');
   support1div.style.top = viz.offsetTop + y - radius * Math.sin(-60 * Math.PI/180) + 'px';
   support1div.style.left = viz.offsetLeft + x + radius * Math.cos(-60 * Math.PI/180) + 'px';

   var support2div = document.getElementById('support2div');
   support2div.style.top = viz.offsetTop + y - radius * Math.sin(30 * Math.PI/180) - 40 + 'px';
   support2div.style.left = viz.offsetLeft + x + radius * Math.cos(30 * Math.PI/180) + 'px';

   var support3div = document.getElementById('support3div');
   support3div.style.top = viz.offsetTop + y - radius * Math.sin(110 * Math.PI/180) - 40 + 'px';
   support3div.style.left = viz.offsetLeft + x + radius * Math.cos(110 * Math.PI/180) -40 + 'px';

   var support4div = document.getElementById('support4div');
   support4div.style.top = viz.offsetTop + y - radius * Math.sin(150 * Math.PI/180) - 40 + 'px';
   support4div.style.left = viz.offsetLeft + x + radius * Math.cos(150 * Math.PI/180) - 40 + 'px';

   var support5div = document.getElementById('support5div');
   support5div.style.top = viz.offsetTop + y - radius * Math.sin(210 * Math.PI/180) + 'px';
   support5div.style.left = viz.offsetLeft + x + radius * Math.cos(210 * Math.PI/180) - 40 + 'px';

   var ctx1 = document.getElementById('support1').getContext('2d');
   var ctx2 = document.getElementById('support2').getContext('2d');
   var ctx3 = document.getElementById('support3').getContext('2d');
   var ctx4 = document.getElementById('support4').getContext('2d');
   var ctx5 = document.getElementById('support5').getContext('2d');
   var image = new Image();
   image.src = 'movie/square_1.png';
   //drawing images
   // support1div.style.transformOrigin = 'left top';
   // support1div.style.transform = 'rotate(45deg)';
   ctx1.drawImage(image, 0, 0, 299, 300, 0, 0, 30, 30);
   ctx2.drawImage(image, 0, 0, 299, 300, 0, 0, 40, 40);
   ctx3.drawImage(image, 0, 0, 299, 300, 0, 0, 40, 40);
   ctx4.drawImage(image, 0, 0, 299, 300, 0, 0, 40, 40);
   ctx5.drawImage(image, 0, 0, 299, 300, 0, 0, 40, 40);
 }
 /**
  * When called start support animation
  */
  Movie.sheetwidth = 920;
  Movie.sheetheight = 137;
  Movie.stop = false;
  Movie.supportanimation_ = function(number)
  {
    var canvas = document.getElementById('support' + number);
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.src = 'movie/test4.png';
    var image = new Image();
    image.src = 'movie.square_1.png';
    var srcX = 0;
    var srcY = 0;
    var framecount = 8;
    var currentFrame = 0;
    var width = Movie.sheetwidth / framecount;
    var count = 0;
    var flag = 0;
    function updateFrame(){
      currentFrame = ++currentFrame % framecount;
      srcX = currentFrame * width;
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }
    function draw(){
        updateFrame();
        ctx.drawImage(img, srcX, srcY, width, Movie.sheetheight, 0, 0, canvas.width, canvas.height);
    }
    function timerCode(){
      draw();
      if(!Movie.stop){
        setTimeout(timerCode, 100);
      }
      else{
        Movie.renderSuppourts_();
      }
    }
    setTimeout(timerCode, 100);
  }

/**
 * When drawing complete show quiz.
 */
 Movie.Quiz = function() {
   var blockly = document.getElementById('blockly');
   blockly.style.display = 'none';
   //Questions
   Movie.myQuestions = [
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
      question: "What about triangle CBE ?",
      answers: {
        a: "Isoceles Triangle",
        b: "Acute-angle Triangle",
        c: "Obtuse-angle Triangle",
        d: "Right-angle Isoceles Triangle"
      },
      correctAnswer: 1
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

  Movie.currentSlide = 0;
  Movie.questionsupports = [[2,3,4],[2,3,4],[2,3,5],[1,2,4]];
  function generateQuiz(availableQuesions, previousButton, nextButton){
      var question = document.getElementById('question');
      var choices = Array.from(document.getElementsByClassName('choice-text'));
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
      getNewQuestion(Movie.currentSlide);
      };

      function getNewQuestion(questionIndex) {
          if (availableQuesions.length === 0 || questionCounter >= Movie.myQuestions.length) {
              //go to the end page
              return;
          }
          Movie.currentSlide += questionIndex - Movie.currentSlide;
          questionCounter++;
          Movie.supportsComplete = 0;
          // var questionIndex = Movie.currentSlide++;
          currentQuestion = availableQuesions[questionIndex];
          question.innerText = currentQuestion.question;
          currentanswers = Movie.myQuestions[questionIndex].answers;
          var flag = 'abcd';
          var answers_ = new Array();
          var abc = 0;
          for(var letter in Movie.myQuestions[questionIndex].answers)
          {
            abc++;
          }
          // console.log(abc);
          console.log(Movie.currentSlide);
          console.log(questionIndex);
          switch (abc) {
            case 3:
              answers_.push(Movie.myQuestions[questionIndex].answers.a);
              answers_.push(Movie.myQuestions[questionIndex].answers.b);
              answers_.push(Movie.myQuestions[questionIndex].answers.c);
              break;
            case 4:
              answers_.push(Movie.myQuestions[questionIndex].answers.a);
              answers_.push(Movie.myQuestions[questionIndex].answers.b);
              answers_.push(Movie.myQuestions[questionIndex].answers.c);
              answers_.push(Movie.myQuestions[questionIndex].answers.d);
              break;
          }
          var count = 0;
          // console.log(answers_);
          choices.forEach(function(choice) {
              var number = choice.dataset['number'];
              // console.log(count);
              choice.innerText = answers_[count++];
          });

          // availableQuesions.splice(questionIndex, 1);
          acceptingAnswers = true;
          // if(questionIndex == 0){
          //   previousButton.style.display = "none";
          //   // submitButton.display = "none";
          // }
          if(questionIndex == Movie.myQuestions.length - 1)
          {
            // submitButton.display = 'initial';
            nextButton.style.display = 'none';
            // previousButton.style.display = 'initial';

          }
          // else {
          //   previousButton.style.display = 'initial';
          // }
          // previousButton.disabled = false;
          nextButton.disabled = false;
          Movie.riderrotation = true;
          Movie.stop = false;
          // Movie.renderSuppourts_();
          Movie.rotaterider();
      };
      choices.forEach(function(choice) {
          choice.addEventListener('click', function(e){
              if (!acceptingAnswers) return;

              acceptingAnswers = false;
              var selectedChoice = e.target;
              var correctAnswer_ = currentQuestion.correctAnswer;
              var selectedAnswer = selectedChoice.dataset['number'];
              var correctchoice = document.querySelector('[data-number = "' + correctAnswer_ +'"]');
              // console.log(selectedAnswer);
              var classToApply =
                  selectedAnswer == currentQuestion.correctAnswer ? 'correct' : 'incorrect';

              // if (classToApply === 'incorrect') {
              //     correctchoice.parentElement.classList.add('correct');
              // }
              selectedChoice.parentElement.classList.add(classToApply);
              setTimeout(function(){
                if (classToApply === 'incorrect') {
                    correctchoice.parentElement.classList.add('correct');
                }
              },1000);
              setTimeout(function() {
                  // selectedChoice.parentElement.classList.remove(classToApply);
                  // correctchoice.parentElement.classList.remove('correct');
                  if(Movie.currentSlide < Movie.myQuestions.length-1)
                  {
                    selectedChoice.parentElement.classList.remove(classToApply);
                    correctchoice.parentElement.classList.remove('correct');
                    // Movie.stop = false;
                    getNewQuestion(Movie.currentSlide + 1);
                  }
              }, 3000);
          });
      });
      console.log(Movie.myQuestions.length);
        // previousButton.onclick = function(){
        //   this.disabled = true;
        //   setTimeout(function(){
        //     getNewQuestion(Movie.currentSlide-1);
        //   },500);
        // }
        nextButton.onclick = function(){
          this.disabled = true;
          setTimeout(function(){
            Movie.stop = true;
            Movie.renderSuppourts_();
            getNewQuestion(Movie.currentSlide + 1);
          },500);
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
  generateQuiz(Movie.myQuestions, previousButton, nextButton);
 }

/**
 * On startup draw the axis scales and save it to the axies canvas.
 * @private
 */
Movie.renderAxies_ = function() {
  var ctx = document.getElementById('axies').getContext('2d');
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#bba';
  ctx.fillStyle = '#bba';
  ctx.font = 'normal 14px sans-serif';
  var TICK_LENGTH = 9;
  var major = 1;
  for (var i = 0.1; i < 1.8; i += 0.1) {
    // Bottom edge.
    ctx.beginPath();
    ctx.moveTo(i * Movie.WIDTH * 4 / 6.8, Movie.HEIGHT);
    ctx.lineTo(i * Movie.WIDTH * 4 / 6.8, Movie.HEIGHT - TICK_LENGTH * major);
    ctx.stroke();
    if (major == 2) {
      ctx.fillText(Math.round(i * 100), i * Movie.WIDTH * 4 / 6.8 + 2, Movie.HEIGHT - 4);
    }
    major = major == 1 ? 2 : 1;
  }
  major = 1;
  for (var i = 0.1; i < 1.5; i += 0.1) {
    // Left edge.
    major = major == 1 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(0, i * Movie.HEIGHT * 4 / 6);
    ctx.lineTo(TICK_LENGTH * major, i * Movie.HEIGHT * 4 / 6);
    ctx.stroke();
    if (major == 2) {
      ctx.fillText(Math.round(150 - i * 100), 3, i * Movie.HEIGHT * 4 / 6 - 2);
    }
  }
  //Naming Supports
  ctx.beginPath();
  ctx.font = "20px Georgia";
  ctx.fillStyle = "#1CB67E"
  ctx.fillText('A',85 * 4 + 65 * 4 * Math.cos(60 * Math.PI/180) + 46, 75 * 4 + 65 * 4 * Math.sin(60 * Math.PI/180) + 25);
  ctx.fillText('B',85 * 4 + 65 * 4 * Math.cos(-30 * Math.PI/180) + 46 , 75 * 4 + 65 * 4 * Math.sin(-30 * Math.PI/180) - 15);
  ctx.fillText('C',85 * 4 + 65 * 4 * Math.cos(-110 * Math.PI/180) - 60 , 75 * 4 + 65 * 4 * Math.sin(-110 * Math.PI/180) - 15);
  ctx.fillText('D',85 * 4 + 65 * 4 * Math.cos(-150 * Math.PI/180) - 60, 75 * 4 + 65 * 4 * Math.sin(-150 * Math.PI/180) - 15);
  ctx.fillText('E',85 * 4 + 65 * 4 * Math.cos(-210 * Math.PI/180) - 60, 75 * 4 + 65 * 4 * Math.sin(-210 * Math.PI/180) + 25);

};

/**
 * Draw one frame of the movie.
 * @param {!Interpreter} interpreter A JS-Interpreter loaded with user code.
 * @private
 */
Movie.drawFrame_ = function(interpreter) {
  // Clear the canvas.
  Movie.ctxScratch.canvas.width = Movie.ctxScratch.canvas.width;
  Movie.ctxScratch.strokeStyle = '#000';
  Movie.ctxScratch.fillStyle = '#000';
  // Levels 1-9 should be slightly transparent so eclipsed blocks may be seen.
  // Level 10 should be opaque so that the movie is clean.
  Movie.ctxScratch.globalAlpha =
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
  Movie.rideranimationvalue = false;
  Movie.rideranimation = function(){
    var canvas = document.getElementById('ridercanvas');
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.src = 'movie/test8.png';
    var rider = document.getElementById('rider');
    var x = 85 * 4;
    var y = 600 - 75 * 4;
    var radius = 65 * 4;
    var Sheetwidth1 = 920;
    var Sheetheight1 = 260;
    var frameCount = 8;
    var width = Sheetwidth1/frameCount;
    x -= width/2;
    var viz = document.getElementById('visualization');
    rider.style.top = viz.offsetTop + y + 'px';
    rider.style.left = viz.offsetLeft + x + 'px';
    // rider.style.border = "1px solid #ccc";
    var srcX;
    var srcY;
    var currentFrame = 0;
    console.log("x,y:"+rider.style.top+","+rider.style.left+","+x);
    function updateFrame(){
      currentFrame = ++currentFrame % frameCount;
      srcX = currentFrame * width;
      srcY = 0;
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }
    function draw(){
      updateFrame();
      ctx.drawImage(img,srcX,srcY,width,Sheetheight1,0,0,width,Sheetheight1);
    }
    function timerCode(){
        draw();
        setTimeout(timerCode,100);
    }
    setTimeout(timerCode,100);
  }
  Movie.anglerotation = 2;
  Movie.anglerotated = 0;
  Movie.riderrotation = false;
  Movie.rotaterider = function(){
    var rider = document.getElementById('rider');
    rider.style.transformOrigin = "50% 0";
    function timerCode(){
      if(Movie.riderrotation){
        Movie.anglerotated += Movie.anglerotation;
        rider.style.transform = "rotate(-"+Movie.anglerotated+"deg)";
        if(Movie.anglerotated == 360)
        {
          Movie.anglerotated = 0;
        }
        Movie.questionrotation();
        setTimeout(timerCode,100);
      }
    }
    setTimeout(timerCode,100);
  }
  Movie.questionrotation = function() {
    if(Movie.anglerotated == Movie.supportangles[Movie.questionsupports[Movie.currentSlide][0] - 1] ){
      Movie.supportanimation_(Movie.questionsupports[Movie.currentSlide][0]); Movie.supportsComplete++;}
    else if(Movie.anglerotated == Movie.supportangles[Movie.questionsupports[Movie.currentSlide][1] - 1]){
      Movie.supportanimation_(Movie.questionsupports[Movie.currentSlide][1]);Movie.supportsComplete++;}
    else if(Movie.anglerotated == Movie.supportangles[Movie.questionsupports[Movie.currentSlide][2] - 1]){
      Movie.supportanimation_(Movie.questionsupports[Movie.currentSlide][2]);Movie.supportsComplete++;}
    else if(Movie.anglerotated == (Movie.supportangles[Movie.questionsupports[Movie.currentSlide][2] - 1] + 50) && Movie.supportsComplete == 3)
      Movie.riderrotation = false;
  }
/**
 * Generate new JavaScript if the code has changed.
 * @param {!Blockly.Events.Abstract=} opt_e Change event.
 */
Movie.codeChange = function(opt_e) {
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
  Movie.pixelErrors = new Array(Movie.FRAMES);
  BlocklyInterface.executedJsCode = code;
  BlocklyInterface.executedCode = BlocklyInterface.getCode();
  Movie.display();
};

/**
 * Copy the scratch canvas to the display canvas.
 * @param {number=} opt_frameNumber Which frame to draw (0-100).
 *     If not defined, draws the current frame.
 */
Movie.display = function(opt_frameNumber) {
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
    setTimeout(function() {Movie.display(opt_frameNumber);}, 250);
    return;
  }
  if (typeof opt_frameNumber == 'number') {
    Movie.frameNumber = opt_frameNumber;
  }
  var frameNumber = Movie.frameNumber;

  // Clear the display with white.
  Movie.ctxDisplay.beginPath();
  Movie.ctxDisplay.rect(0, 0,
      Movie.ctxDisplay.canvas.width, Movie.ctxDisplay.canvas.height);
  Movie.ctxDisplay.fillStyle = '#ffffff';
  Movie.ctxDisplay.fill();

  // Copy the answer.
  var answer = document.getElementById('answer' + frameNumber);
  if (answer) {
    Movie.ctxDisplay.globalAlpha = 0.2;
    Movie.ctxDisplay.drawImage(answer, 0, 0);
    Movie.ctxDisplay.globalAlpha = 1;
  }

  // Copy the hatching.
  // var hatching = document.getElementById('hatching');
  // Movie.ctxDisplay.drawImage(hatching, 0, 0);

  // Draw and copy the user layer.
  var code = BlocklyInterface.executedJsCode;
  try {
    var interpreter = new Interpreter(code, Movie.initInterpreter);
  } catch (e) {
    // Trap syntax errors: break outside a loop, or return outside a function.
    console.error(e);
  }
  if (interpreter) {
    Movie.drawFrame_(interpreter);
  } else {
    // In the event of a syntax error, clear the canvas.
    Movie.ctxScratch.canvas.width = Movie.ctxScratch.canvas.width;
  }
  Movie.ctxDisplay.drawImage(Movie.ctxScratch.canvas, 0, 0);

  // Copy the axies.
  Movie.ctxDisplay.drawImage(document.getElementById('axies'), 0, 0);

  Movie.checkFrameAnswer();
  if (BlocklyGames.LEVEL == 1) {
    setTimeout(Movie.checkAnswers, 1000);
  }
  Movie.renderSuppourts_();
  // var number = 1;
  // Movie.stop = false;
  // Movie.supportanimation_(number);
  // function stop(){
  //   Movie.stop = true;
  // }
  // var myvar
  // myvar = setTimeout(Movie.supportanimation_, 5000,2);
  // myvar = setTimeout(stop, 20000);
};

/**
 * Inject the Movie API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS-Interpreter.
 * @param {!Interpreter.Object} globalObject Global object.
 */
Movie.initInterpreter = function(interpreter, globalObject) {
  // API
  var wrapper;
  wrapper = function(x, y, radius, width) {
    Movie.circle(x, y, radius, width);
  };
  interpreter.setProperty(globalObject, 'circle',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(x1, y1, x2, y2, w) {
    Movie.line(x1, y1, x2, y2, w);
  };
  interpreter.setProperty(globalObject, 'line',
      interpreter.createNativeFunction(wrapper));

  wrapper = function(colour) {
    Movie.penColour(colour);
  };
  interpreter.setProperty(globalObject, 'penColour',
      interpreter.createNativeFunction(wrapper));

  wrapper = function() {
    return Movie.frameNumber;
  };
  interpreter.setProperty(globalObject, 'time',
      interpreter.createNativeFunction(wrapper));

};


/**
 * Convert from ideal 0-100 coordinates to canvas's 0-400 coordinates.
 */
Movie.SCALE = 400 / 100;

/**
 * Draw a circle.
 * @param {number} x Horizontal location of centre (0-100).
 * @param {number} y Vertical location of centre (0-100).
 * @param {number} radius Radius of circle.
 */
Movie.circle = function(x, y, radius, width) {
  y = 150 - y;
  x *= Movie.SCALE;
  y *= Movie.SCALE;
  radius = Math.max(radius * Movie.SCALE, 0);
  width = Math.max(width * Movie.SCALE, 0);
  Movie.ctxScratch.beginPath();
  Movie.ctxScratch.lineWidth = width;
  Movie.ctxScratch.arc(x, y, radius, 0, 2 * Math.PI, false);
  Movie.ctxScratch.stroke();
  console.log(x+","+y);
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
Movie.line = function(x1, y1, x2, y2, width) {
  y1 = 150 - y1;
  y2 = 150 - y2;
  x1 *= Movie.SCALE;
  y1 *= Movie.SCALE;
  x2 *= Movie.SCALE;
  y2 *= Movie.SCALE;
  width *= Movie.SCALE;
  Movie.ctxScratch.beginPath();
  Movie.ctxScratch.moveTo(x1, y1);
  Movie.ctxScratch.lineTo(x2, y2);
  Movie.ctxScratch.lineWidth = Math.max(width, 0);
  Movie.ctxScratch.stroke();
};

/**
 * Change the colour of the pen.
 * @param {string} colour Hexadecimal #rrggbb colour string.
 */
Movie.penColour = function(colour) {
  Movie.ctxScratch.strokeStyle = colour;
  Movie.ctxScratch.fillStyle = colour;
};

/**
 * Verify if the answer to this frame is correct.
 */
Movie.checkFrameAnswer = function() {
  // Compare the Alpha (opacity) byte of each pixel in the user's image and
  // the sample answer image.
  var answer = document.getElementById('answer' + Movie.frameNumber);
  if (!answer) {
    return;
  }
  var ctxAnswer = answer.getContext('2d');
  var answerImage = ctxAnswer.getImageData(0, 0, Movie.WIDTH, Movie.HEIGHT);
  var userImage =
      Movie.ctxScratch.getImageData(0, 0, Movie.WIDTH, Movie.HEIGHT);
  var len = Math.min(userImage.data.length, answerImage.data.length);
  var delta = 0;
  // Pixels are in RGBA format.  Only check the Alpha bytes.
  for (var i = 3; i < len; i += 4) {
    // Check the Alpha byte.
    if (Math.abs(userImage.data[i] - answerImage.data[i]) > 96) {
      delta++;
    }
  }
  Movie.pixelErrors[Movie.frameNumber] = delta;
};

/**
 * Verify if all the answers are correct.
 * If so, move on to next level.
 */
Movie.checkAnswers = function() {
  if (BlocklyGames.LEVEL > 1 && Movie.frameNumber != Movie.FRAMES) {
    // Only check answers at the end of the run.
    return;
  }
  if (Movie.isCorrect() && !Movie.success) {
    Movie.success = true;
    // BlocklyInterface.saveToLocalStorage();
    if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
      // No congrats for last level, it is open ended.
      // BlocklyInterface.workspace.getAudioManager().play('win', 0.5);
      // BlocklyDialogs.congratulations();
      setTimeout(Movie.Quiz,3000);
      setTimeout(Movie.rideranimation,3000);
      // setTimeout(Movie.rotaterider,3500);
      // setTimeout(function(){
      //   Movie.riderrotation = false;
      // }, 12500);
    }
  }
};


window.addEventListener('load', Movie.init);
