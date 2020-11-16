Blockly.JavaScript['draw'] = function(block) {
  // TODO: Assemble JavaScript into code variable.
  // var code = 'ctx.beginPath();\n';
  // code+='ctx.strokeStyle = "red";';
  // code+='ctx.rect(20, 20,bre,len);';
  // code+='ctx.stroke();\n';
  // code+='if(Choice=="1"){'
  // code+='ctx.beginPath();';
  // code+='ctx.strokeStyle = "green";';
  // code+='ctx.moveTo(20,40+len);';
  // code+='ctx.lineTo(20,40+len+len);';
  // code+='ctx.lineTo(20+bre,40+len+len);';
  // code+='ctx.closePath();'
  // code+='ctx.stroke();\n'
  // code+='ctx.beginPath();';
  // code+='ctx.strokeStyle = "green";';
  // code+='ctx.moveTo(30+bre,40+len+len);';
  // code+='ctx.lineTo(30+bre,40+len);';
  // code+='ctx.lineTo(30,40+len);';
  // code+='ctx.closePath();';
  // code+='ctx.fillStyle="#FFCC00";';
  // code+='ctx.stroke();';
  // code+='}';
  // code+='else {';
  // code+='ctx.beginPath();';
  // code+='ctx.strokeStyle = "green";';
  // code+='ctx.moveTo(20,40+len);';
  // code+='ctx.lineTo(20+bre,40+len);';
  // code+='ctx.lineTo(20,40+len+len);';
  // code+='ctx.closePath();'
  // code+='ctx.stroke();\n'
  // code+='ctx.beginPath();';
  // code+='ctx.strokeStyle = "green";';
  // code+='ctx.moveTo(30+bre,40+len);';
  // code+='ctx.lineTo(30+bre,40+len+len);';
  // code+='ctx.lineTo(30,40+len+len);';
  // code+='ctx.closePath();';
  // code+='ctx.fillStyle="#FFCC00";';
  // code+='ctx.stroke();';
  // code+='}';
  var code = 'var cont = document.getElementById("containe");';
  code+= 'cont.style.height = len+"px";';
  code+= 'cont.style.width = bre+"px";';
  code+= 'cont.style.display = "block";';
  code+= 'cont.style.left = ((500-bre)/2)+"px";';
  code+= 'cont.style.top = ((500-len)/2)+"px";';
  code+= 'glen=len;';
  code+= 'gbre=bre;';
  code+= 'if(Choice==1){myMove();}';
  code+= 'else{myMove2();}';
  return code;
};