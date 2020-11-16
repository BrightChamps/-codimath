Blockly.Blocks['bre_block'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Breadth")
        .appendField(new Blockly.FieldNumber(0,300,500), "Breadth");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};
