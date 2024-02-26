import { TokenType, type Token } from "./token";

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

  protected parse_digits(): string {
    let result_string = "";

    while (!this.is_eof() && this.is_digit(this.data.character)) {
      result_string += this.data.character;
      this.read_character();
    }

    return result_string;
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

  public next_token(): Token {
    let token = this.new_token(TokenType.NULL, "NULL");

    this.skip_whitespaces();

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
          token = this.new_token(TokenType.OPEN_PAREN, "(");
        }
        break;
      case ")":
        {
          token = this.new_token(TokenType.CLOSED_PAREN, ")");
        }
        break;
      default: {
        if (this.is_eof()) {
          return this.new_token(TokenType.EOF, "EOF");
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
