Blockly.JavaScript['base_len'] = function(block) {
  var number_base_len = block.getFieldValue('base_len');
  // TODO: Assemble JavaScript into code variable.
  var code = 'len = '+number_base_len+';';
  return code;
};
