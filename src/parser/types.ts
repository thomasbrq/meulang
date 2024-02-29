import type { System } from "typescript";

export interface Statement {
  type: string;
}

export interface Program extends Statement {
  type: "Program";
  body: Statement[];
}

export interface VariableDeclaration extends Statement {
  type: "VariableDeclaration";
  name: string;
  value?: Expression;
  constant: boolean;
}

export interface CallStatement extends Statement {
  type: "CallStatement";
  expression: CallExpression;
}

export interface FunctionDeclaration extends Statement {
  type: "FunctionDeclaration";
  identifier: Identifier;
  parameters: Identifier[];
  body: Statement[];
}

export interface Expression extends Statement {}

export type BinaryExpressionType = "+" | "-" | "/" | "*";
export interface BinaryExpression extends Expression {
  type: "BinaryExpression";
  left: Expression;
  right: Expression;
  operator: BinaryExpressionType;
}

export interface NumericLiteral extends Expression {
  type: "NumericLiteral";
  value: number;
}

export interface Identifier extends Expression {
  type: "Identifier";
  name: string;
}

export interface AssignmentExpression extends Expression {
  type: "AssignmentExpression";
  left: Identifier;
  right: Expression;
  operator: string;
}

export interface CallExpression extends Expression {
  type: "CallExpression";
  callee: Identifier;
  arguments: Expression[];
}
