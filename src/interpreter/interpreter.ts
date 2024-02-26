import type { AssignmentOperator } from "typescript";
import type {
  BinaryExpression,
  BinaryExpressionType,
  NumericLiteral,
  Program,
  Statement,
  VariableDeclaration,
} from "../parser/types";
import type { Environment } from "./environment";
import type { NullValue, NumberValue, Value } from "./types";

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

  if (value == null)
    return {
      type: "null",
      value: "null",
    } as Value;

  env.set(statement.name, value);
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
    case "NumericLiteral": {
      const n = node as NumericLiteral;
      return {
        type: "number",
        value: n.value,
      } as NumberValue;
    }
    default: {
      console.error(`${node.type} not implemented.`);
      process.exit(1);
    }
  }
}
