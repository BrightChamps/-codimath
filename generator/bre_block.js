Blockly.JavaScript['bre_block'] = function(block) {
  var number_breadth = block.getFieldValue('Breadth');
  // TODO: Assemble JavaScript into code variable.
  var code = 'var bre = '+number_breadth+';\n';
  return code;
};