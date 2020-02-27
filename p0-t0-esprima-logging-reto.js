const escodegen = require('escodegen');
const espree = require('espree');
const estraverse = require('estraverse');
var fs = require('fs');

function addLogging(code) {
  const ast = espree.parse(code, {ecmaVersion:6}); //Convierte code en un elemento procesable en tiempo de ejecución (en lugar de string y lo guarda en ast)
  estraverse.traverse(ast, { //Divide el código en partes y se puede acceder a éstas
    enter: function(node, parent) {
      if (node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression') { //Cuando encuentra una función ejecuta addBeforeCode
        addBeforeCode(node, code);
      }
      if (node.type === 'ArrowFunctionExpression') { //Cuando encuentra una función ejecuta addBeforeCode
        addBeforeCode2(node, code);
      }
    }
  });
  return escodegen.generate(ast); //Reconvierte ast en código y lo devuelve
}

function addBeforeCode(node, code) {
  const name = node.id ? node.id.name : '<anonymous function>'; //Si no se ha encontrado un nombre para la función (node.id se convierte a false) se le llama <anonymous function>
  
  let temp = "console.log('Entering " + name + "(";
  for (a = 0; a < node.params.length; a++)
    temp = temp + (a ? ", ' + " : "' + ") + node.params[a].name + " + '";
  
  let linea = 1;
  for (a = 0; a < node.start; a++)
    if (code [a] == '\n')
      linea++;
  
  const beforeCode = temp + ") at line " + linea + "');";

  const beforeNodes = espree.parse(beforeCode).body;
  node.body.body = beforeNodes.concat(node.body.body); //Añade el console.log al principio de la función
}

function addBeforeCode2(node, code) {
  let temp = "console.log('Entering <anonymous function>(";
  for (a = 0; a < node.params.length; a++)
    temp = temp + (a ? ", ' + " : "' + ") + node.params[a].name + " + '";
  
  let linea = 1;
  for (a = 0; a < node.start; a++)
    if (code [a] == '\n')
      linea++;
  
  const beforeCode = temp + ") at line " + linea + "');";

  const beforeNodes = espree.parse(beforeCode).body;
  node.body.body = beforeNodes.concat(node.body.body); //Añade el console.log al principio de la función
}

let actual = 2;
let output = "";
let input = "";
if (process.argv.length < 3){
  console.log("\nUsage: p0-t0-esprima-logging-sol [options] <filename> [...]\n\nOptions:\n  -V, --version            output the version number\n  -o, --output <filename>  \n  -h, --help               output usage information\n");
} else {
  while (actual < process.argv.length){
    let opcion = false;
    if ((process.argv[actual] == '-h')||(process.argv[actual] == '--help')){
      opcion = true;
      console.log("\nUsage: p0-t0-esprima-logging-sol [options] <filename> [...]\n\nOptions:\n  -V, --version            output the version number\n  -o, --output <filename>  \n  -h, --help               output usage information\n");
    }
    if ((process.argv[actual] == '-V')||(process.argv[actual] == '--version')){
      opcion = true;
      console.log("\nv 1.0\n");
    }
    if ((process.argv[actual] == '-o')||(process.argv[actual] == '--output')){
      opcion = true;
      if (process.argv.length > actual + 1){
        output = process.argv[actual + 1];
        actual++;
      } else {
        console.log("\nUsage: p0-t0-esprima-logging-sol [options] <filename> [...]\n\nOptions:\n  -V, --version            output the version number\n  -o, --output <filename>  \n  -h, --help               output usage information\n");
        break;
      }
    }
    if (!opcion){
      if (output){
        input = process.argv[actual];
      } else {
        console.log("\nUsage: p0-t0-esprima-logging-sol [options] <filename> [...]\n\nOptions:\n  -V, --version            output the version number\n  -o, --output <filename>  \n  -h, --help               output usage information\n");
      }
      break;
    }
    actual++;
  }
}

if (input){
  fs.readFile(input, temp);
  
  function temp (err, data){
    if (err){
      Function("error","throw error")(err)
    } else {
      input = data.toString('utf8');
      next();
    }
  };
  
  function next (){
    console.log('\nInput:\n\n' + input);
    
    let codeMod = addLogging(input);
    
    fs.writeFile(output, codeMod, (err) => {
      if (err) throw err;
    });
    
    console.log('\nOutput in file: ' + output + '\n');
  }
}






/*

console.log(addLogging(`
function foo(a, b) {   
  var x = 'blah';   
  var y = (function () {
    return 3;
  })();
}
foo(1, 'wut', 3);
`));
*/