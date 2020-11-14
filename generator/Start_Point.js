Blockly.JavaScript['StartPoint'] = function(block) {
  var number_xc = block.getFieldValue('xc') + 250;
  var number_yc = 250 - block.getFieldValue('yc');
  var colour_colour = block.getFieldValue('colour');
  var number_thickness = block.getFieldValue('Thickness');
  // TODO: Assemble JavaScript into code variable.
  var code = 'ctx.lineWidth = '+number_thickness+';\n';
  code +='ctx.strokeStyle = "' + colour_colour +'";\n';
  code += 'ctx.moveTo('+number_xc+','+number_yc+');\n';
  return code;
};
