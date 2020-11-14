Blockly.JavaScript['line1'] = function(block) {
  var number_x1 = block.getFieldValue('x1');
  var number_y1 = block.getFieldValue('y1');
  var number_x2 = block.getFieldValue('x2');
  var number_y2 = block.getFieldValue('y2');
  // TODO: Assemble JavaScript into code variable.
  var code = 'x1 = '+(number_x1)+';';
  code+= 'x2 = '+(number_x2)+';';
  code+= 'y1 = '+(-1*number_y1+500)+';';
  code+= 'y2 = '+(-1*number_y2+500)+';';
  return code;
};