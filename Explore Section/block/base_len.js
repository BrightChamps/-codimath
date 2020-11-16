Blockly.Blocks['base_len'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Length of Base Line")
        .appendField(new Blockly.FieldNumber(0,100,500), "base_len");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};
