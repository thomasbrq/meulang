import type { Environment } from "./environment";

export type ValueType = "null" | "number" | "native-fn";

export interface Value {
  type: ValueType;
  value: string | number;
}

export interface NullValue extends Value {
  type: "null";
  value: "null";
}

export interface NumberValue extends Value {
  type: "number";
  value: number;
}

export type FunctionCall = (args: Value[], env: Environment) => Value;
export interface NativeFunctionValue extends Value {
  type: ValueType;
  call: FunctionCall;
}
