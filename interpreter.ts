import { Environment } from "./src/interpreter/environment";
import { evaluate } from "./src/interpreter/interpreter";
import { Lexer } from "./src/lexer/lexer";
import { Parser } from "./src/parser/parser";

import { print } from "./src/native_functions";
import { parseArgs } from "util";

type FilepathResponseData = {
  error: boolean;
  data: string | undefined;
  message: string;
};

function check_file_errors(filepath: string | undefined): FilepathResponseData {
  if (filepath == undefined) {
    return {
      error: true,
      data: filepath,
      message: "The filepath is undefined.",
    };
  }

  const regex = new RegExp("(?:(?!.meu)(?:.|\n))*.meu");
  if (regex.test(filepath)) {
    return {
      error: false,
      data: filepath,
      message: ".meu file expected.",
    };
  }

  return {
    error: true,
    data: filepath,
    message: "Please provide a .meu file.",
  };
}

function get_filepath_from_args(): string | undefined {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      file: {
        type: "string",
        multiple: false,
        default: "main.meu",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  const data = check_file_errors(values.file);
  if (data.error) {
    console.error(data.message);
    process.exit(1);
  }

  return data.data;
}

(async function main() {
  const file_path = get_filepath_from_args();
  if (file_path == undefined) {
    console.error("Error with the provided file.");
    process.exit(1);
  }

  const file = Bun.file(file_path);

  if ((await file.exists()) == false) {
    console.error(`No such file: ${file_path}`);
    process.exit(1);
  }

  const source = await file.text();
  const lexer = new Lexer(source);
  const parser = new Parser(lexer);

  const program = parser.parse();

  const env = new Environment();

  env.declare("print", print, true);

  evaluate(program, env);
})();
