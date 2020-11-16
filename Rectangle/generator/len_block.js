Blockly.JavaScript['len_block'] = function(block) {
  var number_length = block.getFieldValue('Length');
  // TODO: Assemble JavaScript into code variable.
  var code = 'var len = '+number_length+';\n';
  return code;
};