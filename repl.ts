import { Environment } from "./src/interpreter/environment";
import { Lexer } from "./src/lexer/lexer";
import { Parser } from "./src/parser/parser";

import { print } from "./src/native_functions";
import { evaluate } from "./src/interpreter/interpreter";

(async function main() {
  console.log("\nMeu lang v0.1 - REPL");
  console.log("Available commands: exit");

  const env = new Environment();
  env.declare("print", print, true);

  while (true) {
    const prompt = ">> ";
    process.stdout.write(prompt);

    for await (const line of console) {
      if (line == "exit") {
        process.exit(0);
      }

      const lexer = new Lexer(line);
      const parser = new Parser(lexer);
      const program = parser.parse();

      evaluate(program, env);
    }
  }
})();
