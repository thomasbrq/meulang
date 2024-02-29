import { describe, expect, test, it } from "bun:test";
import { Lexer } from "../lexer/lexer";
import { Parser } from "./parser";
import type {
  AssignmentExpression,
  BinaryExpression,
  CallExpression,
  CallStatement,
  Expression,
  Identifier,
  NumericLiteral,
  Program,
  VariableDeclaration,
} from "./types";

type TestBasicParserType = {
  expectedLeft: number;
  expectedRight: number;
  expectedOperator: "+" | "-" | "/" | "*";
};

function TestBasicBinaryOperation(
  program: Program,
  tests: TestBasicParserType[],
) {
  for (const test of tests) {
    expect(program.type).toBe("Program");
    expect(program.body[0].type).toBe("BinaryExpression");

    let be = program.body[0] as BinaryExpression;
    expect(be.operator).toBe(test.expectedOperator);

    let left = be.left as NumericLiteral;
    let right = be.right as NumericLiteral;
    expect(left.value).toBe(test.expectedLeft);
    expect(right.value).toBe(test.expectedRight);
  }
}

describe("Parser", () => {
  describe("parse program", () => {
    test("var declaration no value", () => {
      const lexer = new Lexer("var a;");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");

      const body = program.body[0] as VariableDeclaration;

      expect(body.type).toBe("VariableDeclaration");
      expect(body.name).toBe("a");
      expect(body.constant).toBe(false);
    });

    test("var declaration with value", () => {
      const lexer = new Lexer("var a = 5;");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");

      const body = program.body[0] as VariableDeclaration;

      expect(body.type).toBe("VariableDeclaration");
      expect(body.name).toBe("a");
      expect(body.value?.type).toBe("NumericLiteral");
      expect(body.value?.value).toBe(5);
      expect(body.constant).toBe(false);
    });

    test("const declaration with value", () => {
      const lexer = new Lexer("const a = 10;");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");

      const body = program.body[0] as VariableDeclaration;

      expect(body.type).toBe("VariableDeclaration");
      expect(body.name).toBe("a");
      expect(body.value?.type).toBe("NumericLiteral");
      expect(body.value?.value).toBe(10);
      expect(body.constant).toBe(true);
    });

    test("basic function call statement", () => {
      const lexer = new Lexer("print(1);");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");

      expect(program.body[0].type).toBe("CallStatement");

      const call_expr = program.body[0] as CallStatement;
      const expr = call_expr.expression;

      expect(expr.type).toBe("CallExpression");

      const callee = expr.callee as Identifier;
      const args = expr.arguments as Expression[];

      expect(callee.type).toBe("Identifier");
      expect(callee.name).toBe("print");

      expect(args[0].type).toBe("NumericLiteral");
      const num = args[0] as NumericLiteral;

      expect(num.value).toBe(1);
    });

    test("basic init const with call function", () => {
      const lexer = new Lexer("const hello = add(1, 2);");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");

      expect(program.body[0].type).toBe("VariableDeclaration");

      const declaration = program.body[0] as VariableDeclaration;

      expect(declaration.name).toBe("hello");
      expect(declaration.constant).toBe(true);
      expect(declaration.value?.type).toBe("CallExpression");

      const expr = declaration.value as CallExpression;

      const callee = expr.callee as Identifier;
      expect(callee.type).toBe("Identifier");
      expect(callee.name).toBe("add");
      const args = expr.arguments as Expression[];

      const num1 = args[0] as NumericLiteral;
      expect(num1.type).toBe("NumericLiteral");
      expect(num1.value).toBe(1);

      const num2 = args[1] as NumericLiteral;
      expect(num2.type).toBe("NumericLiteral");
      expect(num2.value).toBe(2);
    });

    test("basic init var with call function", () => {
      const lexer = new Lexer("var hello = add(1, 2);");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");

      expect(program.body[0].type).toBe("VariableDeclaration");

      const declaration = program.body[0] as VariableDeclaration;

      expect(declaration.name).toBe("hello");
      expect(declaration.constant).toBe(false);
      expect(declaration.value?.type).toBe("CallExpression");

      const expr = declaration.value as CallExpression;

      const callee = expr.callee as Identifier;
      expect(callee.type).toBe("Identifier");
      expect(callee.name).toBe("add");
      const args = expr.arguments as Expression[];

      const num1 = args[0] as NumericLiteral;
      expect(num1.type).toBe("NumericLiteral");
      expect(num1.value).toBe(1);

      const num2 = args[1] as NumericLiteral;
      expect(num2.type).toBe("NumericLiteral");
      expect(num2.value).toBe(2);
    });

    test("basic var assign, with call function", () => {
      const lexer = new Lexer("var hello; hello = add(5, 1);");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");

      expect(program.body[0].type).toBe("VariableDeclaration");
      const declaration = program.body[0] as VariableDeclaration;
      expect(declaration.name).toBe("hello");

      expect(program.body[1].type).toBe("AssignmentExpression");
      const b1 = program.body[1] as AssignmentExpression;

      expect(b1.operator).toBe("=");

      const left = b1.left as Identifier;
      expect(left.name).toBe("hello");

      expect(b1.right.type).toBe("CallExpression");
      const right = b1.right as CallExpression;

      const callee = right.callee as Identifier;
      expect(callee.name).toBe("add");
      const args = right.arguments as Expression[];
      expect(args[0].type).toBe("NumericLiteral");
      expect(args[1].type).toBe("NumericLiteral");

      const a = args[0] as NumericLiteral;
      const b = args[1] as NumericLiteral;
      expect(a.value).toBe(5);
      expect(b.value).toBe(1);
    });

    test("basic var reassign, with call function", () => {
      const lexer = new Lexer("var hello = 0; hello = add(5, 1);");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");

      expect(program.body[0].type).toBe("VariableDeclaration");
      const declaration = program.body[0] as VariableDeclaration;
      expect(declaration.name).toBe("hello");
      expect(declaration.value?.type).toBe("NumericLiteral");

      const t = declaration.value as NumericLiteral;
      expect(t.value).toBe(0);

      expect(program.body[1].type).toBe("AssignmentExpression");
      const b1 = program.body[1] as AssignmentExpression;

      expect(b1.operator).toBe("=");

      const left = b1.left as Identifier;
      expect(left.name).toBe("hello");

      expect(b1.right.type).toBe("CallExpression");
      const right = b1.right as CallExpression;

      const callee = right.callee as Identifier;
      expect(callee.name).toBe("add");
      const args = right.arguments as Expression[];
      expect(args[0].type).toBe("NumericLiteral");
      expect(args[1].type).toBe("NumericLiteral");

      const a = args[0] as NumericLiteral;
      const b = args[1] as NumericLiteral;
      expect(a.value).toBe(5);
      expect(b.value).toBe(1);
    });

    test("valid nested functions", () => {
      const lexer = new Lexer("print( print() );");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");
    });

    test("valid nested functions", () => {
      const lexer = new Lexer("const a = add(add(5, 3) + add(4, 5), 5);");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");
    });

    test("valid nested functions", () => {
      const lexer = new Lexer("const a = add((add(5, 3) + add(4, 5)), 5);");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");
    });

    test("valid nested functions", () => {
      const lexer = new Lexer(
        "const a = add((add(5, add(1,3)) + add(4, 5)), 5);",
      );
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");
    });

    test("valid program functions call", () => {
      const lexer = new Lexer("var a; a = add(5,3);");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");
    });

    test("valid program functions call", () => {
      const lexer = new Lexer("var a; a = add(5,3) + add(4,3);");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");
    });

    test("valid program functions call", () => {
      const lexer = new Lexer(
        "var a = add(1, 5 * add(5,5) ) + add(2,2);  const x = a + add(1,1) * 5; print(x * 10);",
      );
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");
    });

    test("valid program functions call", () => {
      const lexer = new Lexer(
        "var a = add(1, 5 * add(5,5) ) + add(2,2) * 45;  const H = 850; const J = add(7,7) * 777 + a;  const x = (a + add(1,1) * 5) * 10 + H / J; print(print(x * 10));",
      );
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");
    });
  });
});
