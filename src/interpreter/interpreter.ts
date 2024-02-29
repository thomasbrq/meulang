import type {
  AssignmentExpression,
  BinaryExpression,
  BinaryExpressionType,
  CallExpression,
  CallStatement,
  Expression,
  FunctionDeclaration,
  Identifier,
  NumericLiteral,
  Program,
  Statement,
  VariableDeclaration,
} from "../parser/types";
import { Environment } from "./environment";
import type {
  FunctionValue,
  NativeFunctionValue,
  NullValue,
  NumberValue,
  Value,
} from "./types";

function evaluate_program(program: Program, env: Environment): Value {
  let evaluated: Value = {
    type: "null",
    value: "null",
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

  if (lhs.type == "number" && rhs.type == "number") {
    return evaluate_binary_operations(
      lhs as NumberValue,
      rhs as NumberValue,
      operator,
    );
  }

  return {
    type: "null",
    value: "null",
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
      value: "null",
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

  // declare the variables in the scope.
  function_value.parameters.forEach((param) =>
    function_value.scope.declare(param, args.shift() as Value, false),
  );

  // execute the body statements.
  function_value.body.forEach((expr) => evaluate(expr, function_value.scope));

  // TODO: implements the return keyword.
  return {
    type: "null",
    value: "null",
  } as NullValue;
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

  return env.declare(node.identifier.name, func, true);
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
    case "CallExpression": {
      return evaluate_call_expression(node as CallExpression, env);
    }
    case "FunctionDeclaration": {
      return evaluate_function_declaration(node as FunctionDeclaration, env);
    }
    case "NumericLiteral": {
      const n = node as NumericLiteral;
      return {
        type: "number",
        value: n.value,
      } as NumberValue;
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
