import { evaluate } from "./src/interpreter/interpreter";
import { Lexer } from "./src/lexer/lexer";
import { Parser } from "./src/parser/parser";

(async function main() {
  console.log("\nMeu lang v0.1 - REPL");
  console.log("Available commands: exit");

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
      const result = evaluate(program);

      console.log(result.value);

      process.stdout.write(prompt);
    }
  }
})();
