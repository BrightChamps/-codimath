Blockly.Blocks['angle_verti'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Change angle to")
        .appendField(new Blockly.FieldNumber(0, 0, 90), "ang")
        .appendField("degree with respect to")
        .appendField(new Blockly.FieldDropdown([["Wall","1"], ["Floor","2"]]), "Ang_wrt");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
 this.setTooltip("");
 this.setHelpUrl("");
  }
};