Blockly.JavaScript['diagnol'] = function(block) {
  var dropdown_name = block.getFieldValue('NAME');
  // TODO: Assemble JavaScript into code variable.
  var code = 'var Choice = '+dropdown_name+';\n';
  return code;
};