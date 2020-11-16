Blockly.Blocks['Angle'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Angle of line with +ve X-axis")
        .appendField(new Blockly.FieldNumber(0), "Angle");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};
