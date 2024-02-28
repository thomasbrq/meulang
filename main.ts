import { Environment } from "./src/interpreter/environment";
import { evaluate } from "./src/interpreter/interpreter";
import type {
  NativeFunctionValue,
  NullValue,
  NumberValue,
  Value,
} from "./src/interpreter/types";
import { Lexer } from "./src/lexer/lexer";
import { Parser } from "./src/parser/parser";

const print = {
  type: "native-fn",
  call: (args: Value[], env: Environment) => {
    const a = args.map((arg: Value) => arg.value);
    console.log(...a);
    return {
      type: "null",
      value: "null",
    } as NullValue;
  },
} as NativeFunctionValue;

const get_one = {
  type: "native-fn",
  call: (args: Value[], env: Environment) => {
    return {
      type: "number",
      value: 1,
    } as NumberValue;
  },
} as NativeFunctionValue;

(async function main() {
  const path = "test.meu";
  const file = Bun.file(path);

  const source = await file.text();
  const lexer = new Lexer(source);

  const parser = new Parser(lexer);
  const program = parser.parse();

  // console.log(program, true);

  const env = new Environment();

  env.declare("print", print, true);
  env.declare("get_one", get_one, true);

  const result = evaluate(program, env);

  // console.log("result: ", result);
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
