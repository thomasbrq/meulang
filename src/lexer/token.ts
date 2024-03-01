export enum TokenType {
  ILLEGAL = "ILLEGAL",
  NULL = "NULL",
  EOF = "EOF",

  OPEN_PAREN = "(",
  CLOSED_PAREN = ")",
  OPEN_BRACE = "{",
  CLOSED_BRACE = "}",

  INT = "INT",
  STRING = "STRING",
  PLUS = "+",
  MINUS = "-",
  MULT = "*",
  DIV = "/",

  IDENTIFIER = "IDENTIFIER",
  FUNCTION = "FUNCTION",
  RETURN = "RETURN",
  VAR = "VAR",
  CONST = "CONST",
  ASSIGN = "=",
  SEMI_COLON = ";",
  COMA = ",",
}

export type Token = {
  type: string;
  value: string;
};

export const keywords = new Map<string, TokenType>([
  ["var", TokenType.VAR],
  ["const", TokenType.CONST],
  ["function", TokenType.FUNCTION],
  ["return", TokenType.RETURN],
]);
