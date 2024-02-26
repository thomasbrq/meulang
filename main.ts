import { Environment } from "./src/interpreter/environment";
import { evaluate } from "./src/interpreter/interpreter";
import { Lexer } from "./src/lexer/lexer";
import { Parser } from "./src/parser/parser";

(async function main() {
  const path = "test.meu";
  const file = Bun.file(path);

  const source = await file.text();
  const lexer = new Lexer(source);

  const parser = new Parser(lexer);
  const program = parser.parse();

  const env = new Environment();
  const result = evaluate(program, env);

  console.log("result: ", result);
})();

// (async function main() {
//   console.log("\nMeu lang v0.1 - REPL");
//   console.log("Available commands: exit");

//   while (true) {
//     const prompt = ">> ";
//     process.stdout.write(prompt);

//     for await (const line of console) {
//       if (line == "exit") {
//         process.exit(0);
//       }

//       const lexer = new Lexer(line);
//       const parser = new Parser(lexer);
//       const program = parser.parse();
//       console.log(program, true);
//       // const result = evaluate(program);

//       // console.log(result.value);

//       process.stdout.write(prompt);
//     }
//   }
// })();
