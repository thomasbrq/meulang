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
  });
});
