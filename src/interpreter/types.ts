export type ValueType = "null" | "number";

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
