Blockly.JavaScript['line_colour'] = function(block) {
  var colour_line_colour = block.getFieldValue('line_colour');
  // TODO: Assemble JavaScript into code variable.
  var code = 'lc = "'+colour_line_colour+'";';
  return code;
};