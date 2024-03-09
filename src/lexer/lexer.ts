import { TokenType, type Token, keywords } from "./token";
import { Utils } from "./utils";

type LexerDataType = {
  source: string;
  position: number;
  nextPosition: number;
  character: string;
};

type CurrentDataType = {
  current: string;
  next: string;
};

export class Lexer {
  public data: LexerDataType;
  private utils: Utils;

  constructor(source: string) {
    this.data = {
      source: source,
      position: 0,
      nextPosition: 0,
      character: "",
    };
    this.utils = new Utils();
    this.read_character();
  }

  get_current_data() {
    return {
      current: this.data.character,
      next: this.data.source[this.data.nextPosition],
    } as CurrentDataType;
  }

  read_character() {
    if (this.is_eof()) {
      this.data.character = "";
    } else {
      this.data.character = this.data.source[this.data.nextPosition];
    }
    this.data.position = this.data.nextPosition;
    this.data.nextPosition += 1;
  }

  is_eof(): boolean {
    if (this.data.position >= this.data.source.length) {
      return true;
    }
    return false;
  }

  new_token(type: string, value: string): Token {
    return { type, value } as Token;
  }

  skip_whitespaces(): void {
    while (!this.is_eof() && this.utils.is_whitespace(this.data.character)) {
      this.read_character();
    }
  }

  skip_comments(): void {
    while (!this.is_eof() && this.data.character != "\n") {
      this.read_character();
    }
  }

  parse_identifier(): string {
    let string = "";

    while (!this.is_eof() && this.utils.is_alphanum(this.data.character)) {
      string += this.data.character;
      this.read_character();
    }

    return string;
  }

  parse_number(): string {
    let string = "";

    while (!this.is_eof() && this.utils.is_float(this.data.character)) {
      string += this.data.character;
      this.read_character();
    }

    return string;
  }

  parse_string(): string {
    let string = "";

    while (!this.is_eof() && this.data.character != '"') {
      string += this.data.character;
      this.read_character();
    }

    return string;
  }

  parse_sign(): Token {
    const data = this.get_current_data();

    switch (data.current) {
      case "+": {
        return this.new_token(TokenType.PLUS, data.current);
      }
      case "-": {
        return this.new_token(TokenType.MINUS, data.current);
      }
      case "*": {
        return this.new_token(TokenType.MULT, data.current);
      }
      case "/": {
        return this.new_token(TokenType.DIV, data.current);
      }
    }

    return this.new_token(TokenType.ILLEGAL, data.current);
  }

  parse_relational_operators(): Token {
    const data = this.get_current_data();

    switch (data.current) {
      case "=": {
        if (data.next == "=") {
          this.read_character();
          return this.new_token(TokenType.EQUAL, "==");
        }

        return this.new_token(TokenType.ASSIGN, data.current);
      }
      case ">": {
        if (data.next == "=") {
          this.read_character();
          return this.new_token(TokenType.GE, ">=");
        }

        return this.new_token(TokenType.GT, ">");
      }
      case "<": {
        if (data.next == "=") {
          this.read_character();
          return this.new_token(TokenType.LE, "<=");
        }

        return this.new_token(TokenType.LT, "<");
      }
      case "!": {
        if (data.next == "=") {
          this.read_character();
          return this.new_token(TokenType.DT, "!=");
        }

        return this.new_token(TokenType.ILLEGAL, data.current);
      }
    }

    return this.new_token(TokenType.ILLEGAL, data.current);
  }

  parse_brackets(): Token {
    const data = this.get_current_data();

    switch (data.current) {
      case "(": {
        return this.new_token(TokenType.OPEN_PAREN, data.current);
      }
      case ")": {
        return this.new_token(TokenType.CLOSED_PAREN, data.current);
      }
      case "[": {
        return this.new_token(TokenType.OPEN_BRACKET, data.current);
      }
      case "]": {
        return this.new_token(TokenType.CLOSED_BRACKET, data.current);
      }
      case "{": {
        return this.new_token(TokenType.OPEN_BRACE, data.current);
      }
      case "}": {
        return this.new_token(TokenType.CLOSED_BRACE, data.current);
      }
    }

    return this.new_token(TokenType.ILLEGAL, data.current);
  }

  parse_symbols() {
    const data = this.get_current_data();

    switch (data.current) {
      case ";": {
        return this.new_token(TokenType.SEMI_COLON, data.current);
      }
      case ",": {
        return this.new_token(TokenType.COMA, data.current);
      }
    }

    return this.new_token(TokenType.ILLEGAL, data.current);
  }

  public next_token(): Token {
    let token = this.new_token(TokenType.NULL, "NULL");

    this.skip_whitespaces();

    const data = this.get_current_data();
    if (this.utils.is_comment(data.current, data.next)) {
      this.skip_comments();
      this.skip_whitespaces();
    }

    switch (this.data.character) {
      case "/":
      case "*":
      case "-":
      case "+":
        {
          token = this.parse_sign();
        }
        break;
      case "=":
      case ">":
      case "<":
      case "!":
        {
          token = this.parse_relational_operators();
        }
        break;
      case "(":
      case ")":
      case "[":
      case "]":
      case "{":
      case "}":
        {
          token = this.parse_brackets();
        }
        break;
      case ";":
      case ",":
        {
          token = this.parse_symbols();
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

        const data = this.get_current_data();

        if (this.utils.is_alpha(data.current)) {
          const string = this.parse_identifier();

          const is_keyword = keywords.has(string);
          if (is_keyword) {
            const token = keywords.get(string);
            return this.new_token(token as TokenType, string);
          }

          return this.new_token(TokenType.IDENTIFIER, string);
        }

        if (this.utils.is_float(data.current)) {
          const digits = this.parse_number();
          return this.new_token(TokenType.NUMBER, digits);
        }

        return this.new_token(TokenType.ILLEGAL, this.data.character);
      }
    }

    this.read_character();

    return token;
  }
}
