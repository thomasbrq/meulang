import type { Lexer } from "../lexer/lexer";
import { TokenType, type Token } from "../lexer/token";
import type {
  AssignmentExpression,
  BinaryExpression,
  BlockStatement,
  CallExpression,
  CallStatement,
  Expression,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  NumericLiteral,
  Program,
  ReturnStatement,
  Statement,
  StringLiteral,
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
      case TokenType.IDENTIFIER: {
        return this.parse_identifier_statement();
      }
      case TokenType.FUNCTION: {
        return this.parse_declare_function();
      }
      case TokenType.RETURN: {
        return this.parse_return_statement();
      }
      case TokenType.IF: {
        return this.parse_if_statement();
      }
      default: {
        return this.parse_expression();
      }
    }
  }

  private parse_if_statement(): Statement {
    this.eat();
    this.expect(TokenType.OPEN_PAREN, "( expected");

    const test = this.parse_expression();

    this.expect(TokenType.CLOSED_PAREN, ") expected.");
    this.expect(TokenType.OPEN_BRACE, "{ expected");

    const if_statement = {
      type: "IfStatement",
      test: test,
      consequent: this.parse_block_statement(),
    } as IfStatement;

    this.expect(TokenType.CLOSED_BRACE, "} expected.");

    return if_statement;
  }

  private parse_return_statement(): Statement {
    this.eat();

    const expression = this.parse_expression();

    const statement = {
      type: "ReturnStatement",
      argument: expression,
    } as ReturnStatement;

    this.expect(TokenType.SEMI_COLON, "; expected.");

    return statement;
  }

  private parse_declare_function(): Statement {
    this.eat();

    const identifier = this.parse_primary_expression();

    this.expect(TokenType.OPEN_PAREN, "( expected.");

    const args = this.parse_args();

    this.expect(TokenType.OPEN_BRACE, "{ expected.");

    const body_statement = this.parse_block_statement();

    this.expect(TokenType.CLOSED_BRACE, "} expected.");

    return {
      type: "FunctionDeclaration",
      identifier: identifier,
      parameters: args,
      body: body_statement,
    } as FunctionDeclaration;
  }

  private parse_block_statement(): Statement {
    const body: Statement[] = [];

    while (
      this.currentToken.type != TokenType.CLOSED_BRACE &&
      this.currentToken.type != TokenType.EOF
    ) {
      body.push(this.parse_statement());
    }

    return {
      type: "BlockStatement",
      body: body,
    } as BlockStatement;
  }

  private parse_identifier_statement() {
    if (
      this.currentToken.type == TokenType.IDENTIFIER &&
      this.nextToken.type == TokenType.OPEN_PAREN
    ) {
      return this.parse_func_call();
    }

    return this.parse_expression();
  }

  private parse_expression(): Expression {
    return this.parse_assign();
  }

  private parse_assign(): Expression {
    const left = this.parse_addsub_expression();

    if (this.currentToken.type == TokenType.ASSIGN) {
      this.eat();
      const right = this.parse_addsub_expression();

      const expr = {
        type: "AssignmentExpression",
        left,
        right,
        operator: "=",
      } as AssignmentExpression;

      this.expect(TokenType.SEMI_COLON, "; expected.");

      return expr;
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

    const declaration = {
      type: "VariableDeclaration",
      name: identifier.value,
      value: this.parse_expression(),
      constant,
    } as VariableDeclaration;

    this.expect(TokenType.SEMI_COLON, "; expected.");

    return declaration;
  }

  private parse_args(): Expression[] {
    const args: Expression[] = [];

    while (this.currentToken.type != TokenType.CLOSED_PAREN) {
      if (this.currentToken.type == TokenType.COMA) {
        this.eat();
      }
      const expression = this.parse_expression();
      args.push(expression);
    }

    if (this.currentToken.type == TokenType.CLOSED_PAREN) {
      this.eat();
    }

    return args;
  }

  private parse_func_expression(): Expression {
    if (
      this.currentToken.type == TokenType.IDENTIFIER &&
      this.nextToken.type == TokenType.OPEN_PAREN
    ) {
      const identifier = this.parse_primary_expression();
      this.eat(); // eat '(''
      return {
        type: "CallExpression",
        callee: identifier,
        arguments: this.parse_args(),
      } as CallExpression;
    }

    return this.parse_primary_expression();
  }

  private parse_func_call(): Statement {
    if (
      this.currentToken.type == TokenType.IDENTIFIER &&
      this.nextToken.type == TokenType.OPEN_PAREN
    ) {
      const statement = {
        type: "CallStatement",
        expression: this.parse_func_expression(),
      } as CallStatement;

      this.expect(TokenType.SEMI_COLON, "; expected.");

      return statement;
    }

    return this.parse_primary_expression();
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
    let left = this.parse_func_expression();

    while (this.currentToken.value == "*" || this.currentToken.value == "/") {
      let op = this.currentToken;

      this.eat();

      const right = this.parse_func_expression();
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
      case TokenType.STRING: {
        let string: StringLiteral = {
          type: "StringLiteral",
          value: token.value,
        };

        this.eat();

        return string;
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
