Blockly.JavaScript['line2'] = function(block) {
  var number_x1 = block.getFieldValue('x1');
  var number_y1 = block.getFieldValue('y1');
  var number_x2 = block.getFieldValue('x2');
  var number_y2 = block.getFieldValue('y2');
  // TODO: Assemble JavaScript into code variable.
  var code = 'x3 = '+(number_x1)+';';
  code+= 'x4 = '+(number_x2)+';';
  code+= 'y3 = '+(-1*number_y1+500)+';';
  code+= 'y4 = '+(-1*number_y2+500)+';';
  return code;
};