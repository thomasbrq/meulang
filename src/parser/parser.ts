import { isTokenKind } from "typescript";
import type { Lexer } from "../lexer/lexer";
import { TokenType, type Token } from "../lexer/token";
import type {
  AssignmentExpression,
  BinaryExpression,
  CallExpression,
  Expression,
  Identifier,
  NumericLiteral,
  Program,
  Statement,
  VariableDeclaration,
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

  private expect(type: TokenType, message: string): Token {
    if (this.currentToken.type != type) {
      console.error(message);
      process.exit(1);
    }
    const token = this.currentToken;
    this.eat();
    return token;
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
    let token = this.currentToken;

    switch (token.type) {
      case TokenType.CONST:
      case TokenType.VAR: {
        return this.parse_declaration();
      }
      default: {
        return this.parse_expression();
      }
    }
  }

  private parse_expression(): Expression {
    return this.parse_assign();
  }

  private parse_assign(): Expression {
    const left = this.parse_addsub_expression();

    if (this.currentToken.type == TokenType.ASSIGN) {
      this.eat();
      const right = this.parse_addsub_expression();
      return {
        type: "AssignmentExpression",
        left,
        right,
        operator: "=",
      } as AssignmentExpression;
    }

    return left;
  }

  private parse_declaration(): VariableDeclaration {
    const current_token = this.currentToken;
    const constant = current_token.type == TokenType.CONST;

    this.eat();

    const identifier: Token = this.expect(
      TokenType.IDENTIFIER,
      "Identifier expected.",
    );

    if (this.currentToken.type == TokenType.SEMI_COLON) {
      if (constant) {
        console.error("You must assign a value to a const declaration.");
        process.exit(1);
      }

      this.eat();

      // TODO: assign 'null' by default.
      return {
        type: "VariableDeclaration",
        name: identifier.value,
        constant: false,
      } as VariableDeclaration;
    }

    this.expect(TokenType.ASSIGN, "'=' expected.");

    const value = this.parse_expression();

    this.expect(TokenType.SEMI_COLON, "semicolon expected");

    return {
      type: "VariableDeclaration",
      name: identifier.value,
      value,
      constant,
    } as VariableDeclaration;
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
    let left = this.parse_func_call();

    while (this.currentToken.value == "*" || this.currentToken.value == "/") {
      let op = this.currentToken;

      this.eat();

      const right = this.parse_func_call();
      left = {
        type: "BinaryExpression",
        left,
        right,
        operator: op.value,
      } as BinaryExpression;
    }

    return left;
  }

  private are_equals(left: TokenType, right: TokenType) {
    return left == right;
  }

  private parse_func_call() {
    const identifier = this.parse_primary_expression();

    if (this.currentToken.type == TokenType.OPEN_PAREN) {
      this.eat();

      let args: Expression[] = [];
      while (!this.are_equals(this.currentToken.type, TokenType.CLOSED_PAREN)) {
        const arg = this.parse_expression();
        if (this.are_equals(this.currentToken.type, TokenType.COMA)) {
          this.eat();
        }
        args.push(arg);
      }

      this.eat();
      this.expect(
        TokenType.SEMI_COLON,
        "semi-colon expected after a function call.",
      );

      return {
        type: "CallExpression",
        callee: identifier,
        arguments: args,
      } as CallExpression;
    }

    return identifier;
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
      case TokenType.IDENTIFIER: {
        const identifier = {
          type: "Identifier",
          name: this.currentToken.value,
        } as Identifier;

        this.eat();

        return identifier;
      }
      case TokenType.OPEN_PAREN: {
        this.eat();
        const value = this.parse_addsub_expression();
        this.expect(TokenType.CLOSED_PAREN, "No closed parenthesis found.");
        return value;
      }
      default: {
        console.log(this.currentToken);
        console.error(
          `Unexpected token: type: ${this.currentToken.type}, value: ${this.currentToken.value}`,
        );
        process.exit(1);
      }
    }
  }
}
