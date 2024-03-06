import type { Environment } from "./interpreter/environment";
import type {
  NativeFunctionValue,
  NullValue,
  Value,
} from "./interpreter/types";

function Presenter(arg: Value) {
  if (arg.type == "array") {
    return (arg.value as Value[]).map((a) => a.value);
  }

  return arg.value;
}

const print = {
  type: "native-fn",
  call: (args: Value[], env: Environment) => {
    const a = args.map((arg: Value) => Presenter(arg));
    console.log(...a);
    return {
      type: "null",
      value: null,
    } as NullValue;
  },
} as NativeFunctionValue;

export { print };
