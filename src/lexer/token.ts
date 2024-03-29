export enum TokenType {
  ILLEGAL = "ILLEGAL",
  EOF = "EOF",

  OPEN_PAREN = "(",
  CLOSED_PAREN = ")",
  OPEN_BRACE = "{",
  CLOSED_BRACE = "}",
  OPEN_BRACKET = "[",
  CLOSED_BRACKET = "]",
  ASSIGN = "=",
  SEMI_COLON = ";",
  COMA = ",",

  EQUAL = "==",
  GT = ">",
  GE = ">=",
  LT = "<",
  LE = "<=",
  DT = "!=",

  PLUS = "+",
  MINUS = "-",
  MULT = "*",
  DIV = "/",

  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  STRING = "STRING",

  FUNCTION = "FUNCTION",
  RETURN = "RETURN",
  VAR = "VAR",
  CONST = "CONST",
  IF = "IF",
  ELSE = "ELSE",
  WHILE = "WHILE",
  NULL = "NULL",
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
  ["if", TokenType.IF],
  ["else", TokenType.ELSE],
  ["while", TokenType.WHILE],
  ["null", TokenType.NULL],
]);
