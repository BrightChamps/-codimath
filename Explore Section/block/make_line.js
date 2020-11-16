Blockly.Blocks['make_line'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldLabelSerializable("Move to"), "NAME")
        .appendField("X-Coordinate")
        .appendField(new Blockly.FieldNumber(0, -250, 250), "xc")
        .appendField("Y-Coordinate")
        .appendField(new Blockly.FieldNumber(0, -250, 250), "yc");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};
