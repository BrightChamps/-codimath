/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Load the correct language pack for the current application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

// Redirect to new domain.
// if (location.host == 'blockly-games.appspot.com') {
//   location.replace('https://blockly.games' +
//       location.pathname + location.search + location.hash);
// }

(function() {
  // Application path.
  var appName = location.pathname.match(/\/([-\w]+)(\.html)?$/);
  appName = appName ? appName[1].replace('-', '/') : 'index';

  // Supported languages (consistent across all apps).
  window['BlocklyGamesLanguages'] = [
    'ar', 'be', 'be-tarask', 'bg', 'bn', 'br', 'cs', 'da', 'de', 'el',
    'en', 'eo', 'es', 'eu', 'fa', 'fi', 'fo', 'fr', 'gl', 'ha', 'he',
    'hi', 'hu', 'hy', 'ia', 'id', 'ig', 'is', 'it', 'ja', 'kab', 'ko',
    'lt', 'lv', 'ms', 'my', 'nb', 'nl', 'pl', 'pms', 'pt', 'pt-br',
    'ro', 'ru', 'sc', 'sk', 'sl', 'sq', 'sr', 'sv', 'th', 'ti', 'tr',
    'uk', 'ur', 'vi', 'yo', 'zh-hans', 'zh-hant'
  ];

  // Use a series of heuristics that determine the likely language of this user.
  // First choice: The URL specified language.
  var param = location.search.match(/[?&]lang=([^&]+)/);
  var lang = param ? param[1].replace(/\+/g, '%20') : null;
  if (window['BlocklyGamesLanguages'].indexOf(lang) != -1) {
    // Save this explicit choice as cookie.
    var exp = (new Date(Date.now() + 2 * 31536000000)).toUTCString();
    document.cookie = 'lang=' + escape(lang) + '; expires=' + exp + 'path=/';
  } else {
    // Second choice: Language cookie.
    var cookie = document.cookie.match(/(^|;)\s*lang=([\w\-]+)/);
    lang = cookie ? unescape(cookie[2]) : null;
    if (window['BlocklyGamesLanguages'].indexOf(lang) == -1) {
      // Third choice: The browser's language.
      lang = navigator.language;
      if (window['BlocklyGamesLanguages'].indexOf(lang) == -1) {
        // Fourth choice: English.
        lang = 'en';
      }
    }
  }
  window.loadscreen = function (){
    if(typeof successfulload === 'undefined'){
      setTimeout(loadscreen,15);
    }
    else {
      var myProgress = new ProgressBar.Path('#heart-pathB', {
        easing: 'easeIn',
         duration: 1400,
         attachment: document.querySelector('#example > svg'),
         from: { color: '#eee' },
          to: { color: '#000' },
          step: function(state, path, attachment) {
          }
       });
      var myProgress2 = new ProgressBar.Path('#heart-pathr', {
         easing: 'easeIn',
          duration: 1400,
          attachment: document.querySelector('#example > svg'),
          from: { color: '#eee' },
           to: { color: '#000' },
           step: function(state, path, attachment) {
           }
        });
      var myProgressi = new ProgressBar.Path('#heart-pathi', {
          easing: 'easeIn',
           duration: 1400,
           attachment: document.querySelector('#example > svg'),
           from: { color: '#eee' },
            to: { color: '#000' },
            step: function(state, path, attachment) {
            }
         });
      var myProgresso = new ProgressBar.Path('#heart-patho', {
         easing: 'easeIn',
          duration: 1400,
          attachment: document.querySelector('#example > svg'),
          from: { color: '#eee' },
           to: { color: '#000' },
           step: function(state, path, attachment) {
           }
        });
      var myProgressg = new ProgressBar.Path('#heart-pathg', {
         easing: 'easeIn',
          duration: 1400,
          attachment: document.querySelector('#example > svg'),
          from: { color: '#eee' },
           to: { color: '#000' },
           step: function(state, path, attachment) {
           }
        });
      var myProgressh = new ProgressBar.Path('#heart-pathh', {
         easing: 'easeIn',
          duration: 1400,
          attachment: document.querySelector('#example > svg'),
          from: { color: '#eee' },
           to: { color: '#000' },
           step: function(state, path, attachment) {
           }
        });
      var myProgresst = new ProgressBar.Path('#heart-patht', {
         easing: 'easeIn',
          duration: 1400,
          attachment: document.querySelector('#example > svg'),
          from: { color: '#eee' },
           to: { color: '#000' },
           step: function(state, path, attachment) {
           }
        });
      var myProgressC = new ProgressBar.Path('#heart-pathC', {
         easing: 'easeIn',
          duration: 1400,
          attachment: document.querySelector('#example > svg'),
          from: { color: '#eee' },
           to: { color: '#000' },
           step: function(state, path, attachment) {
           }
        });
      var myProgressH = new ProgressBar.Path('#heart-pathH', {
           easing: 'easeIn',
            duration: 1400,
            attachment: document.querySelector('#example > svg'),
            from: { color: '#eee' },
             to: { color: '#000' },
             step: function(state, path, attachment) {
             }
          });
      var myProgressA = new ProgressBar.Path('#heart-pathA', {
             easing: 'easeIn',
              duration: 1400,
              attachment: document.querySelector('#example > svg'),
              from: { color: '#eee' },
               to: { color: '#000' },
               step: function(state, path, attachment) {
               }
            });
      var myProgressM = new ProgressBar.Path('#heart-pathM', {
               easing: 'easeIn',
                duration: 1400,
                attachment: document.querySelector('#example > svg'),
                from: { color: '#eee' },
                 to: { color: '#000' },
                 step: function(state, path, attachment) {
                 }
              });
      var myProgressP = new ProgressBar.Path('#heart-pathP', {
                 easing: 'easeIn',
                  duration: 1400,
                  attachment: document.querySelector('#example > svg'),
                  from: { color: '#eee' },
                   to: { color: '#000' },
                   step: function(state, path, attachment) {
                   }
                });
      var myProgressS = new ProgressBar.Path('#heart-pathS', {
                   easing: 'easeIn',
                    duration: 1400,
                    attachment: document.querySelector('#example > svg'),
                    from: { color: '#eee' },
                     to: { color: '#000' },
                     step: function(state, path, attachment) {
                     }
                  });
      myProgress.set(0);
      myProgress.animate(1.0);  // Number from 0.0 to 1.0
      myProgress2.set(0);
      myProgress2.animate(1.0);  // Number from 0.0 to 1.0
      myProgressi.set(0);
      myProgressi.animate(1.0);  // Number from 0.0 to 1.0
      myProgresso.set(0);
      myProgresso.animate(1.0);  // Number from 0.0 to 1.0
      myProgressg.set(0);
      myProgressg.animate(1.0);  // Number from 0.0 to 1.0
      myProgressh.set(0);
      myProgressh.animate(1.0);  // Number from 0.0 to 1.0
      myProgresst.set(0);
      myProgresst.animate(1.0);  // Number from 0.0 to 1.0
      myProgressC.set(0);
      myProgressC.animate(1.0);  // Number from 0.0 to 1.0
      myProgressH.set(0);
      myProgressH.animate(1.0);  // Number from 0.0 to 1.0
      myProgressA.set(0);
      myProgressA.animate(1.0);  // Number from 0.0 to 1.0
      myProgressM.set(0);
      myProgressM.animate(1.0);  // Number from 0.0 to 1.0
      myProgressP.set(0);
      myProgressP.animate(1.0);  // Number from 0.0 to 1.0
      myProgressS.set(0);
      myProgressS.animate(1.0);  // Number from 0.0 to 1.0
      setTimeout(function(){
        document.getElementById('fullscreenloader').style.display = 'none';
        document.getElementById('miniloader').style.display = 'none';
      },2000);
    }
  };
  window.miniloader = function (){
    if(typeof successfulload === 'undefined'){
      setTimeout(loadscreen,15);
    }
    else {
      // document.getElementById('miniloader').stye.display='block';
      var myProgress = new ProgressBar.Path('#heart-mpathB', {
        easing: 'easeIn',
         duration: 1400,
         attachment: document.querySelector('#example > svg'),
         from: { color: '#eee' },
          to: { color: '#000' },
          step: function(state, path, attachment) {
          }
       });
      var myProgress2 = new ProgressBar.Path('#heart-mpathr', {
         easing: 'easeIn',
          duration: 1400,
          attachment: document.querySelector('#example > svg'),
          from: { color: '#eee' },
           to: { color: '#000' },
           step: function(state, path, attachment) {
           }
        });
      var myProgressi = new ProgressBar.Path('#heart-mpathi', {
          easing: 'easeIn',
           duration: 1400,
           attachment: document.querySelector('#example > svg'),
           from: { color: '#eee' },
            to: { color: '#000' },
            step: function(state, path, attachment) {
            }
         });
      var myProgresso = new ProgressBar.Path('#heart-mpatho', {
         easing: 'easeIn',
          duration: 1400,
          attachment: document.querySelector('#example > svg'),
          from: { color: '#eee' },
           to: { color: '#000' },
           step: function(state, path, attachment) {
           }
        });
      var myProgressg = new ProgressBar.Path('#heart-mpathg', {
         easing: 'easeIn',
          duration: 1400,
          attachment: document.querySelector('#example > svg'),
          from: { color: '#eee' },
           to: { color: '#000' },
           step: function(state, path, attachment) {
           }
        });
      var myProgressh = new ProgressBar.Path('#heart-mpathh', {
         easing: 'easeIn',
          duration: 1400,
          attachment: document.querySelector('#example > svg'),
          from: { color: '#eee' },
           to: { color: '#000' },
           step: function(state, path, attachment) {
           }
        });
      var myProgresst = new ProgressBar.Path('#heart-mpatht', {
         easing: 'easeIn',
          duration: 1400,
          attachment: document.querySelector('#example > svg'),
          from: { color: '#eee' },
           to: { color: '#000' },
           step: function(state, path, attachment) {
           }
        });
      var myProgressC = new ProgressBar.Path('#heart-mpathC', {
         easing: 'easeIn',
          duration: 1400,
          attachment: document.querySelector('#example > svg'),
          from: { color: '#eee' },
           to: { color: '#000' },
           step: function(state, path, attachment) {
           }
        });
      var myProgressH = new ProgressBar.Path('#heart-mpathH', {
           easing: 'easeIn',
            duration: 1400,
            attachment: document.querySelector('#example > svg'),
            from: { color: '#eee' },
             to: { color: '#000' },
             step: function(state, path, attachment) {
             }
          });
      var myProgressA = new ProgressBar.Path('#heart-mpathA', {
             easing: 'easeIn',
              duration: 1400,
              attachment: document.querySelector('#example > svg'),
              from: { color: '#eee' },
               to: { color: '#000' },
               step: function(state, path, attachment) {
               }
            });
      var myProgressM = new ProgressBar.Path('#heart-mpathM', {
               easing: 'easeIn',
                duration: 1400,
                attachment: document.querySelector('#example > svg'),
                from: { color: '#eee' },
                 to: { color: '#000' },
                 step: function(state, path, attachment) {
                 }
              });
      var myProgressP = new ProgressBar.Path('#heart-mpathP', {
                 easing: 'easeIn',
                  duration: 1400,
                  attachment: document.querySelector('#example > svg'),
                  from: { color: '#eee' },
                   to: { color: '#000' },
                   step: function(state, path, attachment) {
                   }
                });
      var myProgressS = new ProgressBar.Path('#heart-mpathS', {
                   easing: 'easeIn',
                    duration: 1400,
                    attachment: document.querySelector('#example > svg'),
                    from: { color: '#eee' },
                     to: { color: '#000' },
                     step: function(state, path, attachment) {
                     }
                  });
      myProgress.set(0);
      myProgress.animate(1.0);  // Number from 0.0 to 1.0
      myProgress2.set(0);
      myProgress2.animate(1.0);  // Number from 0.0 to 1.0
      myProgressi.set(0);
      myProgressi.animate(1.0);  // Number from 0.0 to 1.0
      myProgresso.set(0);
      myProgresso.animate(1.0);  // Number from 0.0 to 1.0
      myProgressg.set(0);
      myProgressg.animate(1.0);  // Number from 0.0 to 1.0
      myProgressh.set(0);
      myProgressh.animate(1.0);  // Number from 0.0 to 1.0
      myProgresst.set(0);
      myProgresst.animate(1.0);  // Number from 0.0 to 1.0
      myProgressC.set(0);
      myProgressC.animate(1.0);  // Number from 0.0 to 1.0
      myProgressH.set(0);
      myProgressH.animate(1.0);  // Number from 0.0 to 1.0
      myProgressA.set(0);
      myProgressA.animate(1.0);  // Number from 0.0 to 1.0
      myProgressM.set(0);
      myProgressM.animate(1.0);  // Number from 0.0 to 1.0
      myProgressP.set(0);
      myProgressP.animate(1.0);  // Number from 0.0 to 1.0
      myProgressS.set(0);
      myProgressS.animate(1.0);  // Number from 0.0 to 1.0
      setTimeout(function(){
        document.getElementById('miniloader').style.display = 'none';
      },2000);
    }
  };
  window['BlocklyGamesLang'] = lang;
  var script = document.createElement('script');
  var debug = true;
  try {
    debug = !!sessionStorage.getItem('debug');
    if (debug) {
      console.info('Loading uncompressed JavaScript.');
    }
  } catch (e) {
    // Don't even think of throwing an error.
  }
  script.src = appName + '/generated/' + lang +
      (debug ? '/uncompressed.js' : '/compressed.js');
  // script.src = appName + '/generated/' + lang +
  //     '/uncompressed.js';
  script.type = 'text/javascript';
  document.head.appendChild(script);
  // Load the chosen language pack.

})();
