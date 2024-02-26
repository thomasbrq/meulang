import type {
  BinaryExpression,
  BinaryExpressionType,
  NumericLiteral,
  Program,
  Statement,
} from "../parser/types";
import type { NullValue, NumberValue, Value } from "./types";

function evaluate_program(program: Program): Value {
  let evaluated: Value = {
    type: "null",
    value: "null",
  } as NullValue;

  for (const statement of program.body) {
    evaluated = evaluate(statement);
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

function evaluate_binary_expression(expression: BinaryExpression): Value {
  const lhs = evaluate(expression.left);
  const rhs = evaluate(expression.right);
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

export function evaluate(node: Statement): Value {
  switch (node.type) {
    case "Program": {
      return evaluate_program(node as Program);
    }
    case "BinaryExpression": {
      return evaluate_binary_expression(node as BinaryExpression);
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
