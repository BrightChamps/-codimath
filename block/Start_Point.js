Blockly.Blocks['StartPoint'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Start Drawing Line at X = ")
        .appendField(new Blockly.FieldNumber(0,-250,250), "xc")
        .appendField(" and Y = ")
        .appendField(new Blockly.FieldNumber(0,-250,250), "yc");
    this.appendDummyInput()
        .appendField("Colour of Line")
        .appendField(new Blockly.FieldColour("#ff0000"), "colour");
    this.appendDummyInput()
        .appendField("Thickness")
        .appendField(new Blockly.FieldNumber(0), "Thickness");
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};
