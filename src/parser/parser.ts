import type { Lexer } from "../lexer/lexer";
import { TokenType, type Token } from "../lexer/token";
import type {
  BinaryExpression,
  Expression,
  NumericLiteral,
  Program,
  Statement,
} from "./types";

export class Parser {
  private currentToken: Token = {
    type: TokenType.NULL,
    value: "NULL",
  };

  private nextToken: Token = {
    type: TokenType.NULL,
    value: "NULL",
  };

  constructor(private lexer: Lexer) {
    this.eat();
    this.eat();
  }

  private eat() {
    this.currentToken = this.nextToken;
    this.nextToken = this.lexer.next_token();
  }

  private expect(type: TokenType, message: string): void {
    if (this.currentToken.type != type) {
      console.error(message);
      process.exit(1);
    }
    this.eat();
  }

  parse(): Program {
    const program: Program = {
      type: "Program",
      body: [],
    };

    while (!this.lexer.is_eof()) {
      program.body.push(this.parse_statement());
    }

    return program;
  }

  private parse_statement(): Statement {
    return this.parse_expression();
  }

  private parse_expression(): Expression {
    return this.parse_addsub_expression();
  }

  private parse_addsub_expression(): Expression {
    let left = this.parse_multdiv_expression();

    while (this.currentToken.value == "+" || this.currentToken.value == "-") {
      let op = this.currentToken;

      this.eat();

      const right = this.parse_multdiv_expression();
      left = {
        type: "BinaryExpression",
        left,
        right,
        operator: op.value,
      } as BinaryExpression;
    }

    return left;
  }

  private parse_multdiv_expression(): Expression {
    let left = this.parse_primary_expression();

    while (this.currentToken.value == "*" || this.currentToken.value == "/") {
      let op = this.currentToken;

      this.eat();

      const right = this.parse_primary_expression();
      left = {
        type: "BinaryExpression",
        left,
        right,
        operator: op.value,
      } as BinaryExpression;
    }

    return left;
  }

  private parse_primary_expression(): Expression {
    let token = this.currentToken;

    switch (token.type) {
      case TokenType.INT: {
        let expression: NumericLiteral = {
          type: "NumericLiteral",
          value: parseInt(token.value),
        };

        this.eat();

        return expression;
      }
      case TokenType.OPEN_PAREN: {
        this.eat();
        const value = this.parse_expression();
        this.expect(TokenType.CLOSED_PAREN, "No closed parenthesis found.");
        return value;
      }
      default: {
        console.error(
          `Unexpected token: type=${token.type}, value=${token.value}`,
        );
        process.exit(1);
      }
    }
  }
}
