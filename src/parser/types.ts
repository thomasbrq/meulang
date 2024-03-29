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
  body: Statement;
}

export interface ReturnStatement extends Statement {
  type: "ReturnStatement";
  argument: Expression;
}

export interface BlockStatement extends Statement {
  type: "BlockStatement";
  body: Statement[];
}

export interface IfStatement extends Statement {
  type: "IfStatement";
  test: Expression;
  consequent: BlockStatement;
  alternate: Statement | null;
}

export interface WhileStatement extends Statement {
  type: "WhileStatement";
  test: Expression;
  body: BlockStatement;
}

export interface ExpressionStatement extends Statement {
  type: "ExpressionStatement";
  expression: Expression;
}

export interface Expression extends Statement {}

export type BinaryExpressionType =
  | "+"
  | "-"
  | "/"
  | "*"
  | "=="
  | ">"
  | ">="
  | "<"
  | "<="
  | "!=";
export interface BinaryExpression extends Expression {
  type: "BinaryExpression";
  left: Expression;
  right: Expression;
  operator: BinaryExpressionType;
}

export interface Literal extends Expression {
  type: "Literal";
  value: number | string | null;
}

export interface Identifier extends Expression {
  type: "Identifier";
  name: string;
}

export interface AssignmentExpression extends Expression {
  type: "AssignmentExpression";
  left: Identifier | MemberExpression;
  right: Expression;
  operator: string;
}

export interface CallExpression extends Expression {
  type: "CallExpression";
  callee: Identifier;
  arguments: Expression[];
}

export interface ArrayExpression extends Expression {
  type: "ArrayExpression";
  elements: Literal[];
}

export interface MemberExpression extends Expression {
  type: "MemberExpression";
  object: Identifier;
  property: Literal;
}