Blockly.JavaScript['background_colour'] = function(block) {
  var colour_background_colour = block.getFieldValue('Background_colour');
  // TODO: Assemble JavaScript into code variable.
  var code = 'bc = "'+colour_background_colour+'";';
  return code;
};