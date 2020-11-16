Blockly.Blocks['len_block'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Length")
        .appendField(new Blockly.FieldNumber(0,300,500), "Length");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};
