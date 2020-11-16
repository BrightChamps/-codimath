Blockly.Blocks['start'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Start Drawing a Triangle");
      this.setNextStatement(true, null);
      this.setColour(230);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };

  Blockly.Blocks['coordinates'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Enter Point Coordinates of triangle");
      this.appendDummyInput()
          .appendField("X1 = ")
          .appendField(new Blockly.FieldNumber(0,-75,75), "x1")
          .appendField(" Y1 = ")
          .appendField(new Blockly.FieldNumber(0,-75,75), "y1");
      this.appendDummyInput()
          .appendField("X2 = ")
          .appendField(new Blockly.FieldNumber(0,-75,75), "x2")
          .appendField(" Y2 = ")
          .appendField(new Blockly.FieldNumber(0,-75,75), "y2");
      this.appendDummyInput()
          .appendField("X3 = ")
          .appendField(new Blockly.FieldNumber(0,-75,75), "x3")
          .appendField(" Y3 = ")
          .appendField(new Blockly.FieldNumber(0,-75,75), "y3");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };

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