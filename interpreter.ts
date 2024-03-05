import { Environment } from "./src/interpreter/environment";
import { evaluate } from "./src/interpreter/interpreter";
import { Lexer } from "./src/lexer/lexer";
import { Parser } from "./src/parser/parser";

import { print } from "./src/native_functions";

(async function main() {
  const path = "test.meu";
  const file = Bun.file(path);

  const source = await file.text();
  const lexer = new Lexer(source);
  const parser = new Parser(lexer);

  const program = parser.parse();

  const env = new Environment();

  env.declare("print", print, true);

  evaluate(program, env);
})();
