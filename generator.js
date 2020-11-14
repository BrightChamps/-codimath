Blockly.JavaScript['start'] = function(block) {
    // TODO: Assemble JavaScript into code variable.
    var code = '';
    return code;
  };

  Blockly.JavaScript['coordinates'] = function(block) {
    var number_x1 = block.getFieldValue('x1');
    var number_y1 = block.getFieldValue('y1');
    var number_x2 = block.getFieldValue('x2');
    var number_y2 = block.getFieldValue('y2');
    var number_x3 = block.getFieldValue('x3');
    var number_y3 = block.getFieldValue('y3');
    // TODO: Assemble JavaScript into code variable.
    var code = 'x1 = '+(125+number_x1)+';';
    code+='x2 = '+(125+number_x2)+';';
    code+='x3 = '+(125+number_x3)+';';
    code+='y1 = '+(125-number_y1)+';';
    code+='y2 = '+(125-number_y2)+';';
    code+='y3 = '+(125-number_y3)+';';
    return code;
  };

  Blockly.JavaScript['draw'] = function(block) {
    // TODO: Assemble JavaScript into code variable.
    var code = '';
    return code;
  };