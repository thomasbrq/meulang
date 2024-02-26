export enum TokenType {
  ILLEGAL = "ILLEGAL",
  NULL = "NULL",
  EOF = "EOF",

  OPEN_PAREN = "(",
  CLOSED_PAREN = ")",

  INT = "INT",
  PLUS = "+",
  MINUS = "-",
  MULT = "*",
  DIV = "/",

  IDENTIFIER = "IDENTIFIER",
  VAR = "VAR",
  CONST = "CONST",
  ASSIGN = "=",
  SEMI_COLON = ";",
}

export type Token = {
  type: string;
  value: string;
};

export const keywords = new Map<string, TokenType>([
  ["var", TokenType.VAR],
  ["const", TokenType.CONST],
]);
