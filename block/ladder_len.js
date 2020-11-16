Blockly.Blocks['ladder_len'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Make ladder of ")
        .appendField(new Blockly.FieldNumber(0,100,500), "ladlen")
        .appendField("feet");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};