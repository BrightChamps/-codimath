Blockly.JavaScript['angle_hori'] = function(block) {
    var number_name = block.getFieldValue('anghori');
    // TODO: Assemble JavaScript into code variable.
    var code = 'main_ang = '+number_name+';';
    return code;
  };