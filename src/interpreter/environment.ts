import type { Value } from "./types";

export class Environment {
  private parent?: Environment;
  private variables = new Map<string, Value>();
  private constants = new Set<string>();

  constructor(parent?: Environment) {
    if (parent) {
      this.parent = parent;
    }
  }

  modify_array(name: string, offset: number | string, new_value: Value) {
    const env = this.get_env(name);
    const variable = this.get(name);

    if (env.constants.has(name)) {
      throw new Error(`cannot assign a value to a constant: ${name}`);
    }

    if (variable == null || variable.value == null) {
      throw new Error(`${name} is null.`);
    }

    // TODO: typescript hack.
    (variable.value as Value[])[offset as any] = new_value;

    return new_value;
  }

  get(name: string): Value {
    let value = Map.prototype.get.call(this.variables, name);
    if (value == undefined && this.parent != undefined) {
      value = this.parent.get(name);
    }

    return value;
  }

  declare(name: string, value: Value, is_constant: boolean) {
    if (this.variables.has(name)) {
      throw new Error(`${name} is already defined.`);
    }

    if (is_constant) {
      this.constants.add(name);
    }

    this.variables.set(name, value);

    return value;
  }

  assign(name: string, value: Value) {
    const env = this.get_env(name);

    if (env.constants.has(name)) {
      throw new Error(`cannot assign a value to a constant: ${name}`);
    }

    env.variables.set(name, value);
  }

  get_env(variable_name: string): Environment {
    if (this.variables.has(variable_name)) {
      return this;
    }

    if (this.parent == undefined) {
      throw new Error(`${variable_name} doesn't exists.`);
    }

    return this.parent.get_env(variable_name);
  }
}
