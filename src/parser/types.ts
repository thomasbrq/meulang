export interface Statement {
  type: string;
}

export interface Program extends Statement {
  type: "Program";
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
