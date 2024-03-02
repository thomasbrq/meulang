import { isToken } from "typescript";
import { TokenType, type Token, keywords } from "./token";

export type LexerType = {
  source: string;
  position: number;
  nextPosition: number;
  character: string;
};

export class Lexer {
  public data: LexerType;

  constructor(source: string) {
    this.data = {
      source: source,
      position: 0,
      nextPosition: 0,
      character: "",
    };
    this.read_character();
  }

  protected read_character() {
    if (this.is_eof()) {
      this.data.character = "";
    } else {
      this.data.character = this.data.source[this.data.nextPosition];
    }
    this.data.position = this.data.nextPosition;
    this.data.nextPosition += 1;
  }

  public is_eof(): boolean {
    if (this.data.position >= this.data.source.length) {
      return true;
    }
    return false;
  }

  protected new_token(type: string, value: string): Token {
    return {
      type,
      value,
    };
  }

  protected is_digit(character: string): boolean {
    if (character.length > 1) {
      return false;
    }
    return character >= "0" && character <= "9";
  }

  protected is_alpha(character: string): boolean {
    return (
      (character >= "a" && character <= "z") ||
      (character >= "A" && character <= "Z") ||
      character == "_"
    );
  }

  protected is_alphanum(character: string): boolean {
    if (character.length > 1) {
      return false;
    }

    const is_alpha = this.is_alpha(character);
    const is_num = this.is_digit(character);

    return is_alpha || is_num;
  }

  protected parse_digits(): string {
    let string = "";

    while (!this.is_eof() && this.is_digit(this.data.character)) {
      string += this.data.character;
      this.read_character();
    }

    return string;
  }

  protected parse_identifier_string(): string {
    let string = "";

    while (!this.is_eof() && this.is_alphanum(this.data.character)) {
      string += this.data.character;
      this.read_character();
    }

    return string;
  }

  protected is_whitespace(character: string): boolean {
    if (character.length > 1) {
      return false;
    }

    return (
      character == " " ||
      character == "\t" ||
      character == "\n" ||
      character == "\r"
    );
  }

  protected skip_whitespaces(): void {
    while (!this.is_eof() && this.is_whitespace(this.data.character)) {
      this.read_character();
    }
  }

  private skip_comments(): void {
    while (!this.is_eof() && this.data.character != "\n") {
      this.read_character();
    }
  }

  protected parse_sign(character: string): Token {
    switch (character) {
      case "+": {
        return this.new_token(TokenType.PLUS, character);
      }
      case "-": {
        return this.new_token(TokenType.MINUS, character);
      }
      case "*": {
        return this.new_token(TokenType.MULT, character);
      }
      case "/": {
        return this.new_token(TokenType.DIV, character);
      }
    }

    return this.new_token(TokenType.ILLEGAL, "ILLEGAL");
  }

  private parse_string(): string {
    let string = "";

    while (!this.is_eof() && this.data.character != '"') {
      string += this.data.character;
      this.read_character();
    }

    return string;
  }

  public next_token(): Token {
    let token = this.new_token(TokenType.NULL, "NULL");

    this.skip_whitespaces();

    if (
      this.data.character == "-" &&
      this.data.source[this.data.nextPosition] == "-"
    ) {
      this.skip_comments();
      this.skip_whitespaces();
    }

    switch (this.data.character) {
      case "/":
      case "*":
      case "-":
      case "+":
        {
          token = this.parse_sign(this.data.character);
        }
        break;
      case "(":
        {
          token = this.new_token(TokenType.OPEN_PAREN, this.data.character);
        }
        break;
      case ")":
        {
          token = this.new_token(TokenType.CLOSED_PAREN, this.data.character);
        }
        break;
      case ";":
        {
          token = this.new_token(TokenType.SEMI_COLON, this.data.character);
        }
        break;
      case "=":
        {
          const next = this.data.source[this.data.nextPosition];

          if (next == "=") {
            this.read_character();
            token = this.new_token(TokenType.EQUAL, "==");
          } else {
            token = this.new_token(TokenType.ASSIGN, this.data.character);
          }
        }
        break;
      case ">":
        {
          const next = this.data.source[this.data.nextPosition];

          if (next == "=") {
            this.read_character();
            token = this.new_token(TokenType.GE, ">=");
          } else {
            token = this.new_token(TokenType.GT, ">");
          }
        }
        break;
      case "<":
        {
          const next = this.data.source[this.data.nextPosition];

          if (next == "=") {
            this.read_character();
            token = this.new_token(TokenType.LE, "<=");
          } else {
            token = this.new_token(TokenType.LT, "<");
          }
        }
        break;
      case "!":
        {
          const next = this.data.source[this.data.nextPosition];

          if (next == "=") {
            this.read_character();
            token = this.new_token(TokenType.DT, "!=");
          } else {
            token = this.new_token(TokenType.ILLEGAL, this.data.character);
          }
        }
        break;
      case ",":
        {
          token = this.new_token(TokenType.COMA, this.data.character);
        }
        break;
      case "{":
        {
          token = this.new_token(TokenType.OPEN_BRACE, this.data.character);
        }
        break;
      case "}":
        {
          token = this.new_token(TokenType.CLOSED_BRACE, this.data.character);
        }
        break;
      case '"': {
        this.read_character();
        let string = this.parse_string();
        this.read_character();
        return this.new_token(TokenType.STRING, string);
      }
      default: {
        if (this.is_eof()) {
          return this.new_token(TokenType.EOF, "EOF");
        }

        if (this.is_alpha(this.data.character)) {
          let string = this.parse_identifier_string();

          if (keywords.has(string)) {
            const token = keywords.get(string);
            return this.new_token(token as TokenType, string);
          }

          return this.new_token(TokenType.IDENTIFIER, string);
        }

        if (this.is_digit(this.data.character)) {
          let digits = this.parse_digits();
          return this.new_token(TokenType.INT, digits);
        }

        return this.new_token(TokenType.ILLEGAL, this.data.character);
      }
    }

    this.read_character();

    return token;
  }
}
