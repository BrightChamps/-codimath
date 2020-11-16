Blockly.JavaScript['ladder_len'] = function(block) {
  var number_name = block.getFieldValue('ladlen');
  // TODO: Assemble JavaScript into code variable.
  var code = 'lad_len = '+number_name+';';
  return code;
};