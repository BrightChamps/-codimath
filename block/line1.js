Blockly.Blocks['line1'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Enter end points of first line");
    this.appendDummyInput()
        .appendField("X1 = ")
        .appendField(new Blockly.FieldNumber(0), "x1")
        .appendField("Y1 = ")
        .appendField(new Blockly.FieldNumber(0), "y1");
    this.appendDummyInput()
        .appendField("X2 = ")
        .appendField(new Blockly.FieldNumber(0), "x2")
        .appendField(" Y2 = ")
        .appendField(new Blockly.FieldNumber(0), "y2");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};