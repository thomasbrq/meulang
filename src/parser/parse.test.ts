import { describe, expect, test, it } from "bun:test";
import { Lexer } from "../lexer/lexer";
import { Parser } from "./parser";
import type {
  BinaryExpression,
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
    test("basic addition.", () => {
      const lexer = new Lexer("1 + 2");
      const parser = new Parser(lexer);
      const program = parser.parse();

      const tests: TestBasicParserType[] = [
        { expectedLeft: 1, expectedRight: 2, expectedOperator: "+" },
      ];

      TestBasicBinaryOperation(program, tests);
    });

    test("basic min.", () => {
      const lexer = new Lexer("10 - 2");
      const parser = new Parser(lexer);
      const program = parser.parse();

      const tests: TestBasicParserType[] = [
        { expectedLeft: 10, expectedRight: 2, expectedOperator: "-" },
      ];

      TestBasicBinaryOperation(program, tests);
    });

    test("basic mult.", () => {
      const lexer = new Lexer("5 * 1");
      const parser = new Parser(lexer);
      const program = parser.parse();

      const tests: TestBasicParserType[] = [
        { expectedLeft: 5, expectedRight: 1, expectedOperator: "*" },
      ];

      TestBasicBinaryOperation(program, tests);
    });

    test("basic div.", () => {
      const lexer = new Lexer("10 / 2");
      const parser = new Parser(lexer);
      const program = parser.parse();

      const tests: TestBasicParserType[] = [
        { expectedLeft: 10, expectedRight: 2, expectedOperator: "/" },
      ];

      TestBasicBinaryOperation(program, tests);
    });

    test("precedence mult", () => {
      const lexer = new Lexer("1+(2*5)");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");
      expect(program.body[0].type).toBe("BinaryExpression");

      let be = program.body[0] as BinaryExpression;
      expect(be.operator).toBe("+");

      let left = be.left as NumericLiteral;
      expect(left.value).toBe(1);

      let right = be.right as BinaryExpression;
      expect(left.value).toBe(1);

      expect(right.operator).toBe("*");
      let right_left = right.left as NumericLiteral;
      let right_right = right.right as NumericLiteral;

      expect(right_left.value).toBe(2);
      expect(right_right.value).toBe(5);
    });

    test("precedence div", () => {
      const lexer = new Lexer("(1+2)/5");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");
      expect(program.body[0].type).toBe("BinaryExpression");

      let be = program.body[0] as BinaryExpression;
      expect(be.operator).toBe("/");

      let left = be.left as BinaryExpression;
      expect(left.operator == "+");

      let right = be.right as NumericLiteral;
      expect(right.value).toBe(5);

      let left_left = left.left as NumericLiteral;
      expect(left_left.value).toBe(1);
      let left_right = left.right as NumericLiteral;
      expect(left_right.value).toBe(2);
    });

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
  });
});
