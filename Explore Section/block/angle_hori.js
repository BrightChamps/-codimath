Blockly.Blocks['angle_hori'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Change angle with floor to")
          .appendField(new Blockly.FieldNumber(0), "anghori")
          .appendField("degrees");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };