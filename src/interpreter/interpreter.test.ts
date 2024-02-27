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

  test("declare variable with a value", () => {
    const lexer = new Lexer("var a = 1;");
    const parser = new Parser(lexer);
    const program = parser.parse();

    const env = new Environment();
    const result = evaluate(program, env);

    const v = env.get("a");
    expect(v.value).toBe(1);
  });

  test("declare variable without value", () => {
    const lexer = new Lexer("var a;");
    const parser = new Parser(lexer);
    const program = parser.parse();

    const env = new Environment();
    const result = evaluate(program, env);

    const v = env.get("a");
    expect(v.value).toBe("null");
  });

  test("declare const with a value", () => {
    const lexer = new Lexer("const abc = 10;");
    const parser = new Parser(lexer);
    const program = parser.parse();

    const env = new Environment();
    const result = evaluate(program, env);

    const v = env.get("abc");
    expect(v.value).toBe(10);
  });

  test("assign a new value to an initialized variable", () => {
    const lexer = new Lexer("var hello = 0;\nhello = 15;");
    const parser = new Parser(lexer);
    const program = parser.parse();

    const env = new Environment();
    const result = evaluate(program, env);

    const v = env.get("hello");
    expect(v.value).toBe(15);
  });

  test("assign a new value to a declared variable but not initialized", () => {
    const lexer = new Lexer("var hello;\nhello = 777;");
    const parser = new Parser(lexer);
    const program = parser.parse();

    const env = new Environment();
    const result = evaluate(program, env);

    const v = env.get("hello");
    expect(v.value).toBe(777);
  });

  test("assign a variable with another variable", () => {
    const lexer = new Lexer("var one = 1;\nvar two = one + 1;");
    const parser = new Parser(lexer);
    const program = parser.parse();

    const env = new Environment();
    const result = evaluate(program, env);

    expect(env.get("one").value).toBe(1);
    expect(env.get("two").value).toBe(2);
  });

  test("assign a variable with a const", () => {
    const lexer = new Lexer("const hate_u = 0;\nvar love_u = hate_u + 1;");
    const parser = new Parser(lexer);
    const program = parser.parse();

    const env = new Environment();
    const result = evaluate(program, env);

    expect(env.get("hate_u").value).toBe(0);
    expect(env.get("love_u").value).toBe(1);
  });

  test("init a const with a var", () => {
    const lexer = new Lexer("var likes = 10;\nconst n_likes = likes;");
    const parser = new Parser(lexer);
    const program = parser.parse();

    const env = new Environment();
    const result = evaluate(program, env);

    expect(env.get("likes").value).toBe(10);
    expect(env.get("n_likes").value).toBe(10);
  });

  test("init a const with a const", () => {
    const lexer = new Lexer("const teamo = 1000;\nconst yotambien = teamo;");
    const parser = new Parser(lexer);
    const program = parser.parse();

    const env = new Environment();
    const result = evaluate(program, env);

    expect(env.get("teamo").value).toBe(1000);
    expect(env.get("yotambien").value).toBe(1000);
  });
});
