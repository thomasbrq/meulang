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

export interface Indentifier extends Expression {
  type: "Identifier";
  name: string;
}

export interface AssignmentExpression extends Expression {
  type: "AssignmentExpression";
  left: Indentifier;
  right: Expression;
  operator: string;
}
