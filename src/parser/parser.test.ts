import { describe, expect, test, it } from "bun:test";
import { Lexer } from "../lexer/lexer";
import { Parser } from "./parser";
import type {
  AssignmentExpression,
  BinaryExpression,
  BlockStatement,
  CallExpression,
  CallStatement,
  Expression,
  FunctionDeclaration,
  Identifier,
  NumericLiteral,
  Program,
  ReturnStatement,
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

    test("declare function", () => {
      const lexer = new Lexer("function add(a) {     print(); }");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");

      expect(program.body[0].type).toBe("FunctionDeclaration");

      const b1 = program.body[0] as FunctionDeclaration;
      const identifier = b1.identifier as Identifier;

      expect(identifier.type).toBe("Identifier");
      expect(identifier.name).toBe("add");

      const parameters = b1.parameters;

      expect(parameters[0].type).toBe("Identifier");
      expect(parameters[0].name).toBe("a");

      expect(b1.body.type).toBe("BlockStatement");
      const bs = b1.body as BlockStatement;

      const body = bs.body;

      const bb = body[0] as CallStatement;

      const expr = bb.expression;

      expect(expr.type).toBe("CallExpression");

      const callee = expr.callee as Identifier;
      expect(callee.name).toBe("print");
    });

    test("valid program functions call", () => {
      const lexer = new Lexer(
        "function add(a, b) {     const z = 0;     var x = (a * 5) * add(1, z);     print(a, x * 10 + add(5,5)); }",
      );
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");
    });

    test("return statement", () => {
      const lexer = new Lexer(" function one(a, b) {     return a + b; }");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");

      expect(program.body[0].type).toBe("FunctionDeclaration");

      const function_declaration = program.body[0] as FunctionDeclaration;

      expect(function_declaration.body.type).toBe("BlockStatement");

      const body = function_declaration.body as BlockStatement;

      expect(body.body[0].type).toBe("ReturnStatement");
      const rs = body.body[0] as ReturnStatement;

      const args = rs.argument;
      expect(args.type).toBe("BinaryExpression");

      const be = args as BinaryExpression;

      expect(be.left.type).toBe("Identifier");
      const left = be.left as Identifier;
      expect(left.name).toBe("a");

      expect(be.right.type).toBe("Identifier");
      const right = be.right as Identifier;
      expect(right.name).toBe("b");
    });

    test("return statement", () => {
      const lexer = new Lexer(" function one(a, b) {     return (a + b); }");
      const parser = new Parser(lexer);
      const program = parser.parse();

      expect(program.type).toBe("Program");

      expect(program.body[0].type).toBe("FunctionDeclaration");

      const function_declaration = program.body[0] as FunctionDeclaration;

      expect(function_declaration.body.type).toBe("BlockStatement");
      const bs = function_declaration.body as BlockStatement;

      expect(bs.body[0].type).toBe("ReturnStatement");

      const body = bs.body[0] as ReturnStatement;

      expect(body.argument.type).toBe("BinaryExpression");
      const be = body.argument as BinaryExpression;

      expect(be.operator).toBe("+");

      expect(be.left.type).toBe("Identifier");
      const left = be.left as Identifier;
      expect(left.name).toBe("a");

      expect(be.right.type).toBe("Identifier");
      const right = be.right as Identifier;
      expect(right.name).toBe("b");
    });

    test("valid program function call", () => {
      const lexer = new Lexer(
        "function add(a, b) {           return a + b;       }       print(  add( add( add(10,10), add(10,10) ) , add( add(2,2), add(2,2) ) )  ); -- should return 48",
      );
      const parser = new Parser(lexer);
      const program = parser.parse();
    });

    test("valid program function call", () => {
      const lexer = new Lexer(
        "function add(a, b) {     return a + b;     return (a+b); }  print(  add( add( add(10,10), add(10,10) ) , add( add(2,2), add(2,2) ) )  ); -- should return 48",
      );
      const parser = new Parser(lexer);
      const program = parser.parse();
    });

    test("valid program function call", () => {
      const lexer = new Lexer(
        "function add(a, b) {     return a + b; }  const a = add(5, 5); const b = add(10, 10);  print(a, b);",
      );
      const parser = new Parser(lexer);
      const program = parser.parse();
    });

    test("valid program function call", () => {
      const lexer = new Lexer(
        "function add(a, b) {     return a + b; }  const a = add(5, 5); const b = add(10, 10);  var c = add(a, b);  print(c);",
      );
      const parser = new Parser(lexer);
      const program = parser.parse();
    });

    test("valid program strings", () => {
      const lexer = new Lexer(
        'print("Hello world!"); print("Hello" + " " + "world!");  const a = "Hello world!"; const b = "Hello " + "world!"; print(a); print(b); print("result: ", a+b);',
      );
      const parser = new Parser(lexer);
      const program = parser.parse();
    });
  });
});
