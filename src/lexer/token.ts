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
}

export type Token = {
  type: string;
  value: string;
};
