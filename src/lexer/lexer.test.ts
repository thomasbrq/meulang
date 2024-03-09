import { describe, expect, it, test } from "bun:test";
import { Lexer } from "./lexer";
import { TokenType, type Token } from "./token";

class LexerTest extends Lexer {
  constructor(source: string) {
    super(source);
  }

  ParseNumber(): string {
    return this.parse_number();
  }

  NextToken(): Token {
    return this.next_token();
  }
}

type TestTokenType = {
  expectedType: TokenType;
  expectedValue: string;
};

describe("Lexer class", () => {
  function testTokens(lexer: LexerTest, expecteds: TestTokenType[]) {
    for (const expected of expecteds) {
      const token = lexer.NextToken();
      expect(token.type).toBe(expected.expectedType);
      expect(token.value).toBe(expected.expectedValue);
    }
  }

  describe("parse_digits", () => {
    it("should return '123'", () => {
      const lexer = new LexerTest("123");
      const result = lexer.ParseNumber();

      expect(result).toBe("123");
      expect(typeof result).toBe("string");
    });

    it("should return '1'", () => {
      const lexer = new LexerTest("1 + 1");
      const result = lexer.ParseNumber();

      expect(result).toBe("1");
      expect(typeof result).toBe("string");
    });

    it("should return ''", () => {
      const lexer = new LexerTest("");
      const result = lexer.ParseNumber();

      expect(result).toBe("");
      expect(typeof result).toBe("string");
    });
  });

  describe("next_token", () => {
    test("no whitespace", () => {
      const lexer = new LexerTest("1+1");
      const expecteds: TestTokenType[] = [
        { expectedType: TokenType.NUMBER, expectedValue: "1" },
        { expectedType: TokenType.PLUS, expectedValue: "+" },
        { expectedType: TokenType.NUMBER, expectedValue: "1" },
      ];
      testTokens(lexer, expecteds);
    });

    test("whitespaces.", () => {
      const lexer = new LexerTest("5            +         5     ");
      const expecteds: TestTokenType[] = [
        { expectedType: TokenType.NUMBER, expectedValue: "5" },
        { expectedType: TokenType.PLUS, expectedValue: "+" },
        { expectedType: TokenType.NUMBER, expectedValue: "5" },
      ];
      testTokens(lexer, expecteds);
    });

    test("whitespaces and newline", () => {
      const lexer = new LexerTest(
        "777            +  777 +        5 + \n 55+12     777.777",
      );
      const expecteds: TestTokenType[] = [
        { expectedType: TokenType.NUMBER, expectedValue: "777" },
        { expectedType: TokenType.PLUS, expectedValue: "+" },
        { expectedType: TokenType.NUMBER, expectedValue: "777" },
        { expectedType: TokenType.PLUS, expectedValue: "+" },
        { expectedType: TokenType.NUMBER, expectedValue: "5" },
        { expectedType: TokenType.PLUS, expectedValue: "+" },
        { expectedType: TokenType.NUMBER, expectedValue: "55" },
        { expectedType: TokenType.PLUS, expectedValue: "+" },
        { expectedType: TokenType.NUMBER, expectedValue: "12" },
        { expectedType: TokenType.NUMBER, expectedValue: "777.777" },
      ];
      testTokens(lexer, expecteds);
    });

    test("basic tokens", () => {
      const lexer = new LexerTest("()+-*/1;={}[]");
      const expecteds: TestTokenType[] = [
        { expectedType: TokenType.OPEN_PAREN, expectedValue: "(" },
        { expectedType: TokenType.CLOSED_PAREN, expectedValue: ")" },
        { expectedType: TokenType.PLUS, expectedValue: "+" },
        { expectedType: TokenType.MINUS, expectedValue: "-" },
        { expectedType: TokenType.MULT, expectedValue: "*" },
        { expectedType: TokenType.DIV, expectedValue: "/" },
        { expectedType: TokenType.NUMBER, expectedValue: "1" },
        { expectedType: TokenType.SEMI_COLON, expectedValue: ";" },
        { expectedType: TokenType.ASSIGN, expectedValue: "=" },
        { expectedType: TokenType.OPEN_BRACE, expectedValue: "{" },
        { expectedType: TokenType.CLOSED_BRACE, expectedValue: "}" },
        { expectedType: TokenType.OPEN_BRACKET, expectedValue: "[" },
        { expectedType: TokenType.CLOSED_BRACKET, expectedValue: "]" },
        { expectedType: TokenType.EOF, expectedValue: "EOF" },
      ];
      testTokens(lexer, expecteds);
    });

    test("keyword tokens", () => {
      const lexer = new LexerTest(
        "const var function return if else while null",
      );
      const expecteds: TestTokenType[] = [
        { expectedType: TokenType.CONST, expectedValue: "const" },
        { expectedType: TokenType.VAR, expectedValue: "var" },
        { expectedType: TokenType.FUNCTION, expectedValue: "function" },
        { expectedType: TokenType.RETURN, expectedValue: "return" },
        { expectedType: TokenType.IF, expectedValue: "if" },
        { expectedType: TokenType.ELSE, expectedValue: "else" },
        { expectedType: TokenType.WHILE, expectedValue: "while" },
        { expectedType: TokenType.NULL, expectedValue: "null" },
        { expectedType: TokenType.EOF, expectedValue: "EOF" },
      ];
      testTokens(lexer, expecteds);
    });

    test("string", () => {
      const lexer = new LexerTest('"Hello world!" "l\nl"');
      const expecteds: TestTokenType[] = [
        { expectedType: TokenType.STRING, expectedValue: "Hello world!" },
        { expectedType: TokenType.STRING, expectedValue: "l\nl" },
        { expectedType: TokenType.EOF, expectedValue: "EOF" },
      ];
      testTokens(lexer, expecteds);
    });

    test("identifiers", () => {
      const lexer = new LexerTest("  abc constvar");
      const expecteds: TestTokenType[] = [
        { expectedType: TokenType.IDENTIFIER, expectedValue: "abc" },
        { expectedType: TokenType.IDENTIFIER, expectedValue: "constvar" },
      ];
      testTokens(lexer, expecteds);
    });

    test("test operators", () => {
      const lexer = new LexerTest("= == > >= < <= !=");
      const expecteds: TestTokenType[] = [
        { expectedType: TokenType.ASSIGN, expectedValue: "=" },
        { expectedType: TokenType.EQUAL, expectedValue: "==" },
        { expectedType: TokenType.GT, expectedValue: ">" },
        { expectedType: TokenType.GE, expectedValue: ">=" },
        { expectedType: TokenType.LT, expectedValue: "<" },
        { expectedType: TokenType.LE, expectedValue: "<=" },
        { expectedType: TokenType.DT, expectedValue: "!=" },
      ];
      testTokens(lexer, expecteds);
    });
  });
});
