Blockly.Blocks['diagnol'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Select Diagnol to Cut Through");
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["Top-Left to Bottom-Right","1"], ["Bottom-Left to Top-Right","2"]]), "NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};