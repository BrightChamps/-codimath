Blockly.Blocks['line_colour'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Colour of line")
        .appendField(new Blockly.FieldColour("#ff0000"), "line_colour");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};