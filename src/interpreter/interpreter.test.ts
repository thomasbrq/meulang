import { describe, expect, it, test } from "bun:test";
import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { evaluate } from "./interpreter";
import { Environment } from "./environment";

describe("Interpreter", () => {
  test("basic mult", () => {
    const lexer = new Lexer("1 +  1");
    const parser = new Parser(lexer);
    const program = parser.parse();

    const env = new Environment();

    const result = evaluate(program, env);
    expect(result.value).toBe(2);
    expect(result.type).toBe("number");
  });
  test("various binops", () => {
    const lexer = new Lexer("((5-1)+(10*10)) / 2");
    const parser = new Parser(lexer);
    const program = parser.parse();

    const env = new Environment();
    const result = evaluate(program, env);
    expect(result.value).toBe(52);
    expect(result.type).toBe("number");
  });
  test("various binops 2", () => {
    const lexer = new Lexer("1000 * 2 + 5 / 2 * 10 + 5");
    const parser = new Parser(lexer);
    const program = parser.parse();

    const env = new Environment();
    const result = evaluate(program, env);
    expect(result.value).toBe(2030);
    expect(result.type).toBe("number");
  });
  test("mul precedence", () => {
    const lexer = new Lexer("10+5*2");
    const parser = new Parser(lexer);
    const program = parser.parse();

    const env = new Environment();
    const result = evaluate(program, env);
    expect(result.value).toBe(20);
    expect(result.type).toBe("number");
  });
  test("mul precedence 2", () => {
    const lexer = new Lexer("(10+5)*2");
    const parser = new Parser(lexer);
    const program = parser.parse();

    const env = new Environment();
    const result = evaluate(program, env);
    expect(result.value).toBe(30);
    expect(result.type).toBe("number");
  });
  test("empty program", () => {
    const lexer = new Lexer("  ");
    const parser = new Parser(lexer);
    const program = parser.parse();

    const env = new Environment();
    const result = evaluate(program, env);
    expect(result.value).toBe("null");
    expect(result.type).toBe("null");
  });
});
