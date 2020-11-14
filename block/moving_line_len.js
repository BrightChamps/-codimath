Blockly.Blocks['moving_line_len'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Length of Moveable line")
        .appendField(new Blockly.FieldNumber(0,50,200), "moving_line_len");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};
