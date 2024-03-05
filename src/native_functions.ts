import type { Environment } from "./interpreter/environment";
import type {
  NativeFunctionValue,
  NullValue,
  Value,
} from "./interpreter/types";

const print = {
  type: "native-fn",
  call: (args: Value[], env: Environment) => {
    const a = args.map((arg: Value) => arg.value);
    console.log(...a);
    return {
      type: "null",
      value: null,
    } as NullValue;
  },
} as NativeFunctionValue;

export { print };
