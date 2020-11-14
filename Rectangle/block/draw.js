Blockly.Blocks['draw'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Draw");
    this.setPreviousStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};