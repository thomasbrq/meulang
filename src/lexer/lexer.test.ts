import { describe, expect, it, test } from "bun:test";
import { Lexer } from "./lexer";
import { TokenType, type Token } from "./token";

class LexerTest extends Lexer {
  constructor(source: string) {
    super(source);
  }

  IsDigit(character: string): boolean {
    return this.is_digit(character);
  }

  IsAlphaNum(character: string): boolean {
    return this.is_alphanum(character);
  }

  ParseDigits(): string {
    return this.parse_digits();
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

  describe("is_digit", () => {
    const lexer = new LexerTest("1+1");

    it("should return true when valid digits", () => {
      expect(lexer.IsDigit("1")).toBe(true);
      expect(lexer.IsDigit("5")).toBe(true);
      expect(lexer.IsDigit("9")).toBe(true);
      expect(lexer.IsDigit("3")).toBe(true);
    });

    it("should return false when invalid.", () => {
      expect(lexer.IsDigit("10")).toBe(false);
      expect(lexer.IsDigit("-1")).toBe(false);
      expect(lexer.IsDigit("")).toBe(false);
      expect(lexer.IsDigit("x")).toBe(false);
      expect(lexer.IsDigit("abc")).toBe(false);
      expect(lexer.IsDigit("O")).toBe(false);
      expect(lexer.IsDigit("o")).toBe(false);
      expect(lexer.IsDigit("😀")).toBe(false);
    });
  });

  describe("is_alphanum", () => {
    const lexer = new LexerTest("abc");
    it("should return true when valid alphanum", () => {
      expect(lexer.IsAlphaNum("a")).toBe(true);
      expect(lexer.IsAlphaNum("x")).toBe(true);
      expect(lexer.IsAlphaNum("Z")).toBe(true);
      expect(lexer.IsAlphaNum("D")).toBe(true);
      expect(lexer.IsAlphaNum("1")).toBe(true);
      expect(lexer.IsAlphaNum("5")).toBe(true);
      expect(lexer.IsAlphaNum("_")).toBe(true);
    });
    it("should return false when invalid alphanum", () => {
      expect(lexer.IsAlphaNum("-")).toBe(false);
      expect(lexer.IsAlphaNum("((")).toBe(false);
      expect(lexer.IsAlphaNum(";")).toBe(false);
      expect(lexer.IsAlphaNum(";")).toBe(false);
    });
  });

  describe("parse_digits", () => {
    it("should return '123'", () => {
      const lexer = new LexerTest("123");
      const result = lexer.ParseDigits();

      expect(result).toBe("123");
      expect(typeof result).toBe("string");
    });

    it("should return '1'", () => {
      const lexer = new LexerTest("1 + 1");
      const result = lexer.ParseDigits();

      expect(result).toBe("1");
      expect(typeof result).toBe("string");
    });

    it("should return ''", () => {
      const lexer = new LexerTest("");
      const result = lexer.ParseDigits();

      expect(result).toBe("");
      expect(typeof result).toBe("string");
    });
  });

  describe("next_token", () => {
    test("no whitespace", () => {
      const lexer = new LexerTest("1+1");
      const expecteds: TestTokenType[] = [
        { expectedType: TokenType.INT, expectedValue: "1" },
        { expectedType: TokenType.PLUS, expectedValue: "+" },
        { expectedType: TokenType.INT, expectedValue: "1" },
      ];
      testTokens(lexer, expecteds);
    });

    test("whitespaces.", () => {
      const lexer = new LexerTest("5            +         5     ");
      const expecteds: TestTokenType[] = [
        { expectedType: TokenType.INT, expectedValue: "5" },
        { expectedType: TokenType.PLUS, expectedValue: "+" },
        { expectedType: TokenType.INT, expectedValue: "5" },
      ];
      testTokens(lexer, expecteds);
    });

    test("whitespaces and newline", () => {
      const lexer = new LexerTest(
        "777            +  777 +        5 + \n 55+12     ",
      );
      const expecteds: TestTokenType[] = [
        { expectedType: TokenType.INT, expectedValue: "777" },
        { expectedType: TokenType.PLUS, expectedValue: "+" },
        { expectedType: TokenType.INT, expectedValue: "777" },
        { expectedType: TokenType.PLUS, expectedValue: "+" },
        { expectedType: TokenType.INT, expectedValue: "5" },
        { expectedType: TokenType.PLUS, expectedValue: "+" },
        { expectedType: TokenType.INT, expectedValue: "55" },
        { expectedType: TokenType.PLUS, expectedValue: "+" },
        { expectedType: TokenType.INT, expectedValue: "12" },
      ];
      testTokens(lexer, expecteds);
    });

    test("basic tokens", () => {
      const lexer = new LexerTest("()+-*/1;={}");
      const expecteds: TestTokenType[] = [
        { expectedType: TokenType.OPEN_PAREN, expectedValue: "(" },
        { expectedType: TokenType.CLOSED_PAREN, expectedValue: ")" },
        { expectedType: TokenType.PLUS, expectedValue: "+" },
        { expectedType: TokenType.MINUS, expectedValue: "-" },
        { expectedType: TokenType.MULT, expectedValue: "*" },
        { expectedType: TokenType.DIV, expectedValue: "/" },
        { expectedType: TokenType.INT, expectedValue: "1" },
        { expectedType: TokenType.SEMI_COLON, expectedValue: ";" },
        { expectedType: TokenType.ASSIGN, expectedValue: "=" },
        { expectedType: TokenType.OPEN_BRACE, expectedValue: "{" },
        { expectedType: TokenType.CLOSED_BRACE, expectedValue: "}" },
        { expectedType: TokenType.EOF, expectedValue: "EOF" },
      ];
      testTokens(lexer, expecteds);
    });

    test("keyword tokens", () => {
      const lexer = new LexerTest("const var function return");
      const expecteds: TestTokenType[] = [
        { expectedType: TokenType.CONST, expectedValue: "const" },
        { expectedType: TokenType.VAR, expectedValue: "var" },
        { expectedType: TokenType.FUNCTION, expectedValue: "function" },
        { expectedType: TokenType.RETURN, expectedValue: "return" },
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
  });
});
