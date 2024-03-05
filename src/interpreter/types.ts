import type { BlockStatement } from "../parser/types";
import type { Environment } from "./environment";

export type ValueType =
  | "null"
  | "number"
  | "string"
  | "native-fn"
  | "function"
  | "return"
  | "block"
  | "array";

export interface Value {
  type: ValueType;
  value: number | string | Value[] | null;
}

export interface NullValue extends Value {
  type: "null";
  value: null;
}

export interface NumberValue extends Value {
  type: "number";
  value: number;
}

export interface StringValue extends Value {
  type: "string";
  value: string;
}

export interface ReturnValue extends Value {
  type: "return";
  value: number;
}

export interface ArrayValue extends Value {
  type: "array";
  value: Value[];
}

export type FunctionCall = (args: Value[], env: Environment) => Value;
export interface NativeFunctionValue extends Value {
  type: ValueType;
  call: FunctionCall;
}

export interface FunctionValue extends Value {
  type: "function";
  name: string;
  parameters: string[];
  scope: Environment;
  body: BlockStatement;
}

export interface BlockValue extends Value {
  type: "block";
  scope: Environment;
}
