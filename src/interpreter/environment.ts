import type { Value } from "./types";

export class Environment {
  private parent?: Environment;
  private values = new Map<string, Value>();

  constructor(parent?: Environment) {
    if (parent) {
      this.parent = parent;
    }
  }

  get(name: string): Value {
    let value = Map.prototype.get.call(this.values, name);
    if (value == undefined && this.parent != undefined) {
      value = this.parent.get(name);
    }

    if (value == undefined) {
      throw new Error(`undefined variable ${name}`);
    }

    return value;
  }

  set(name: string, value: Value) {
    if (this.values.has(name)) {
      throw new Error(`${name} already declared.`);
    }
    this.values.set(name, value);
  }
}
