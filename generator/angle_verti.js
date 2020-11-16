Blockly.JavaScript['angle_verti'] = function(block) {
  var number_ang = block.getFieldValue('ang');
  var dropdown_ang_wrt = block.getFieldValue('Ang_wrt');
  if(dropdown_ang_wrt==1) number_ang = 90 - number_ang;
  // TODO: Assemble JavaScript into code variable.
  var code = 'main_ang = '+number_ang+';';
  return code;
  };