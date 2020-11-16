Blockly.Blocks['background_colour'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Colour of Background")
        .appendField(new Blockly.FieldColour("#ff0000"), "Background_colour");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};