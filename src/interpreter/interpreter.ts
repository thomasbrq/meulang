import type {
  AssignmentExpression,
  BinaryExpression,
  BinaryExpressionType,
  BlockStatement,
  CallExpression,
  CallStatement,
  ExpressionStatement,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  Literal,
  Program,
  ReturnStatement,
  Statement,
  VariableDeclaration,
  WhileStatement,
} from "../parser/types";
import { Environment } from "./environment";
import type {
  BlockValue,
  FunctionValue,
  NativeFunctionValue,
  NullValue,
  NumberValue,
  ReturnValue,
  StringValue,
  Value,
} from "./types";

function evaluate_program(program: Program, env: Environment): Value {
  let evaluated: Value = {
    type: "null",
    value: null,
  } as NullValue;

  for (const statement of program.body) {
    evaluated = evaluate(statement, env);
  }

  return evaluated;
}

function evaluate_binary_operations(
  lhs: NumberValue,
  rhs: NumberValue,
  operator: BinaryExpressionType,
): Value {
  let result;

  switch (operator) {
    case "+":
      {
        result = lhs.value + rhs.value;
      }
      break;
    case "-":
      {
        result = lhs.value - rhs.value;
      }
      break;
    case "*":
      {
        result = lhs.value * rhs.value;
      }
      break;
    case "/":
      {
        // TODO: check division by zero.
        result = lhs.value / rhs.value;
      }
      break;
    case "==":
      {
        result = lhs.value == rhs.value;
      }
      break;
    case ">":
      {
        result = lhs.value > rhs.value;
      }
      break;
    case ">=":
      {
        result = lhs.value >= rhs.value;
      }
      break;
    case "<":
      {
        result = lhs.value < rhs.value;
      }
      break;
    case "<=":
      {
        result = lhs.value <= rhs.value;
      }
      break;
    case "!=": {
      result = lhs.value != rhs.value;
    }
  }

  return {
    type: "number",
    value: result,
  } as Value;
}

function evaluate_binary_expression(
  expression: BinaryExpression,
  env: Environment,
): Value {
  const lhs = evaluate(expression.left, env);
  const rhs = evaluate(expression.right, env);
  const operator = expression.operator;

  if (lhs.type != "null" && rhs.type != "null") {
    return evaluate_binary_operations(
      lhs as NumberValue,
      rhs as NumberValue,
      operator,
    );
  }

  return {
    type: "null",
    value: null,
  } as NullValue;
}

function evaluate_variable_declaration(
  statement: VariableDeclaration,
  env: Environment,
): Value {
  let value = null;

  if (statement.value) {
    value = evaluate(statement.value, env);
  }

  if (value == null) {
    value = {
      type: "null",
      value: null,
    } as NullValue;
  }

  env.declare(statement.name, value, statement.constant);

  return {
    type: "number",
    value: value.value,
  } as NumberValue;
}

function evaluate_assignment_expression(
  node: AssignmentExpression,
  env: Environment,
): Value {
  const name = node.left.name;
  const value = evaluate(node.right, env);

  env.assign(name, value);

  return {
    type: "number",
    value: value.value,
  } as NumberValue;
}

function evaluate_identifier(identifier: Identifier, env: Environment): Value {
  const value = env.get(identifier.name);
  if (value == null) {
    console.error(`${identifier.name} not found.`);
    process.exit(1);
  }

  return value;
}

function evaluate_call_expression(
  expression: CallExpression,
  env: Environment,
): Value {
  const args = expression.arguments.map((arg) => evaluate(arg, env));
  const fn = evaluate(expression.callee, env);

  if (fn.type == "native-fn") {
    return (fn as NativeFunctionValue).call(args, env);
  }

  const function_value = fn as FunctionValue;

  if (args.length < function_value.parameters.length) {
    console.error("too few arguments.");
    process.exit(1);
  } else if (args.length > function_value.parameters.length) {
    console.error("too many arguments.");
    process.exit(1);
  }

  // assign the variables in the scope here.
  function_value.parameters.forEach((arg_name) => {
    const value = args.shift() as Value;
    function_value.scope.assign(arg_name, value);
  });

  let returned_value: Value = {
    type: "null",
    value: null,
  } as NullValue;

  // execute the body statements.
  const expr = evaluate(function_value.body, function_value.scope);
  if (expr.type == "return") {
    returned_value = expr;
  }

  return returned_value;
}

export function evaluate_call_statement(node: CallStatement, env: Environment) {
  return evaluate(node.expression, env);
}

function evaluate_function_declaration(
  node: FunctionDeclaration,
  env: Environment,
): Value {
  const func = {
    type: "function",
    name: node.identifier.name,
    parameters: node.parameters.map((p) => p.name),
    scope: new Environment(env),
    body: node.body,
  } as FunctionValue;

  // declare variables in the function local scope
  func.parameters.forEach((param) =>
    func.scope.declare(
      param,
      { type: "null", value: null } as NullValue,
      false,
    ),
  );

  return env.declare(node.identifier.name, func, true);
}

function evaluate_return_statement(
  statement: ReturnStatement,
  env: Environment,
) {
  const expr = evaluate(statement.argument as ReturnStatement, env);

  return {
    type: "return",
    value: expr.value,
  } as ReturnValue;
}

function evaluate_if_statement(statement: IfStatement, env: Environment) {
  const expr = evaluate(statement.test, env);

  if (expr && expr.value) {
    return evaluate(statement.consequent, env);
  } else {
    if (statement.alternate) return evaluate(statement.alternate, env);
  }

  return expr;
}

function evaluate_block_statement(
  statement: BlockStatement,
  env: Environment,
): Value {
  const body = statement.body;

  const block = {
    type: "block",
    scope: new Environment(env),
  } as BlockValue;

  let value = {
    type: "null",
    value: "null",
  } as Value;
  for (let i = 0; i < body.length; i++) {
    const element = body[i];
    const expr = evaluate(element, block.scope);

    if (expr.type == "return") {
      value = expr;
      break;
    }
  }

  return value;
}

function evaluate_while_statement(
  statement: WhileStatement,
  env: Environment,
): Value {
  let expr = evaluate(statement.test, env);

  while (expr && expr.value) {
    evaluate(statement.body, env);
    expr = evaluate(statement.test, env);
  }

  return expr;
}

function evaluate_expression_statement(
  statement: ExpressionStatement,
  env: Environment,
): Value {
  return evaluate(statement.expression, env);
}

export function evaluate(node: Statement, env: Environment): Value {
  switch (node.type) {
    case "Program": {
      return evaluate_program(node as Program, env);
    }
    case "BinaryExpression": {
      return evaluate_binary_expression(node as BinaryExpression, env);
    }
    case "VariableDeclaration": {
      return evaluate_variable_declaration(node as VariableDeclaration, env);
    }
    case "AssignmentExpression": {
      return evaluate_assignment_expression(node as AssignmentExpression, env);
    }
    case "CallStatement": {
      return evaluate_call_statement(node as CallStatement, env);
    }
    case "ReturnStatement": {
      return evaluate_return_statement(node as ReturnStatement, env);
    }
    case "CallExpression": {
      return evaluate_call_expression(node as CallExpression, env);
    }
    case "FunctionDeclaration": {
      return evaluate_function_declaration(node as FunctionDeclaration, env);
    }
    case "IfStatement": {
      return evaluate_if_statement(node as IfStatement, env);
    }
    case "WhileStatement": {
      return evaluate_while_statement(node as WhileStatement, env);
    }
    case "BlockStatement": {
      return evaluate_block_statement(node as BlockStatement, env);
    }
    case "ExpressionStatement": {
      return evaluate_expression_statement(node as ExpressionStatement, env);
    }
    case "Literal": {
      const n = node as Literal;

      if (typeof n.value == "number") {
        return { type: "number", value: n.value } as NumberValue;
      }

      if (typeof n.value == "string") {
        return { type: "string", value: n.value } as StringValue;
      }

      return { type: "null", value: null } as NullValue;
    }
    case "Identifier": {
      return evaluate_identifier(node as Identifier, env);
    }
    default: {
      console.error(`${node.type} not implemented.`);
      process.exit(1);
    }
  }
}
