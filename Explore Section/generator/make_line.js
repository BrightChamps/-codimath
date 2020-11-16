Blockly.JavaScript['make_line'] = function(block) {
  var number_xc = block.getFieldValue('xc') + 250;
  var number_yc = 250 - block.getFieldValue('yc');
  // TODO: Assemble JavaScript into code variable.
    var code = 'ctx.lineTo('+number_xc+','+number_yc+');\n';
  return code;
};
