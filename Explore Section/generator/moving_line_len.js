Blockly.JavaScript['moving_line_len'] = function(block) {
  var number_base_len = block.getFieldValue('moving_line_len');
  // TODO: Assemble JavaScript into code variable.
  var code = 'mlen = '+number_base_len+';';
  return code;
};
