import type { Lexer } from "../lexer/lexer";
import { TokenType, type Token } from "../lexer/token";
import type {
  ArrayExpression,
  AssignmentExpression,
  BinaryExpression,
  BlockStatement,
  CallExpression,
  CallStatement,
  Expression,
  ExpressionStatement,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  Literal,
  MemberExpression,
  Program,
  ReturnStatement,
  Statement,
  VariableDeclaration,
  WhileStatement,
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
      case TokenType.WHILE: {
        return this.parse_while_statement();
      }
      default: {
        return this.parse_expression();
      }
    }
  }

  private parse_declaration(): VariableDeclaration {
    const constant = this.currentToken.type == TokenType.CONST;

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
      constant: constant,
    } as VariableDeclaration;

    this.expect(TokenType.SEMI_COLON, "; expected.");

    return declaration;
  }

  private parse_identifier_statement() {
    if (
      this.currentToken.type == TokenType.IDENTIFIER &&
      this.nextToken.type == TokenType.OPEN_PAREN
    ) {
      return this.parse_func_call();
    }

    if (
      this.currentToken.type == TokenType.IDENTIFIER &&
      this.nextToken.type == TokenType.ASSIGN
    ) {
      const statement = {
        type: "ExpressionStatement",
        expression: this.parse_expression(),
      } as ExpressionStatement;

      this.expect(TokenType.SEMI_COLON, "; expected.");

      return statement;
    }

    if (
      this.currentToken.type == TokenType.IDENTIFIER &&
      this.nextToken.type == TokenType.OPEN_BRACKET
    ) {
      const statement = {
        type: "ExpressionStatement",
        expression: this.parse_expression(),
      } as ExpressionStatement;

      this.expect(TokenType.SEMI_COLON, "; expected.");

      return statement;
    }

    return this.parse_expression();
  }

  private parse_return_statement(): Statement {
    this.eat();

    if (this.currentToken.type == TokenType.SEMI_COLON) {
      this.eat();
      return {
        type: "ReturnStatement",
        argument: {
          type: "Literal",
          value: null,
        } as Literal,
      } as ReturnStatement;
    }

    const argument = this.parse_expression();

    const statement = {
      type: "ReturnStatement",
      argument: argument,
    } as ReturnStatement;

    this.expect(TokenType.SEMI_COLON, "; expected.");

    return statement;
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
      alternate: null,
    } as IfStatement;

    this.expect(TokenType.CLOSED_BRACE, "} expected.");

    if (this.currentToken.type == TokenType.ELSE) {
      const alternate = this.parse_else_statement();
      if_statement.alternate = alternate;
    }

    return if_statement;
  }

  private parse_while_statement(): Statement {
    this.eat();
    this.expect(TokenType.OPEN_PAREN, "( expected");

    const test = this.parse_expression();

    this.expect(TokenType.CLOSED_PAREN, ") expected");
    this.expect(TokenType.OPEN_BRACE, "{ expected.");

    const while_statement = {
      type: "WhileStatement",
      test: test,
      body: this.parse_block_statement(),
    } as WhileStatement;

    this.expect(TokenType.CLOSED_BRACE, "} expected.");

    return while_statement;
  }

  private parse_expression(): Expression {
    return this.parse_assign();
  }

  private parse_assign(): Expression {
    const left = this.parse_test_operators();

    if (this.currentToken.type == TokenType.ASSIGN) {
      this.eat();
      const right = this.parse_test_operators();

      return {
        type: "AssignmentExpression",
        left: left,
        right: right,
        operator: "=",
      } as AssignmentExpression;
    }

    return left;
  }

  private parse_test_operators() {
    let left = this.parse_addsub_expression();

    while (
      this.currentToken.type == TokenType.EQUAL ||
      this.currentToken.type == TokenType.GT ||
      this.currentToken.type == TokenType.GE ||
      this.currentToken.type == TokenType.LT ||
      this.currentToken.type == TokenType.LE ||
      this.currentToken.type == TokenType.DT
    ) {
      let op = this.currentToken;

      this.eat();

      const right = this.parse_addsub_expression();
      left = {
        type: "BinaryExpression",
        left: left,
        right: right,
        operator: op.value,
      } as BinaryExpression;
    }

    return left;
  }

  private parse_addsub_expression(): Expression {
    let left = this.parse_multdiv_expression();

    while (this.currentToken.value == "+" || this.currentToken.value == "-") {
      let op = this.currentToken;

      this.eat();

      const right = this.parse_multdiv_expression();
      left = {
        type: "BinaryExpression",
        left: left,
        right: right,
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
        left: left,
        right: right,
        operator: op.value,
      } as BinaryExpression;
    }

    return left;
  }

  private parse_func_expression(): Expression {
    if (
      this.currentToken.type == TokenType.IDENTIFIER &&
      this.nextToken.type == TokenType.OPEN_PAREN
    ) {
      const callee = this.parse_primary_expression();

      this.eat();

      return {
        type: "CallExpression",
        callee: callee,
        arguments: this.parse_args(),
      } as CallExpression;
    }

    return this.parse_member_expression();
  }

  private parse_member_expression(): Expression {
    if (
      this.currentToken.type == TokenType.IDENTIFIER &&
      this.nextToken.type == TokenType.OPEN_BRACKET
    ) {
      const object = this.parse_primary_expression();

      this.eat();

      const property = this.parse_expression();

      this.expect(TokenType.CLOSED_BRACKET, "] expected.");
      return {
        type: "MemberExpression",
        object: object,
        property: property,
      } as MemberExpression;
    }

    return this.parse_primary_expression();
  }

  private parse_else_statement(): Statement {
    this.eat();

    if (this.currentToken.type == TokenType.OPEN_BRACE) {
      this.eat();
    }

    if (this.currentToken.type == TokenType.IF) {
      return this.parse_if_statement();
    }

    const block = this.parse_block_statement();

    if (this.currentToken.type == TokenType.CLOSED_BRACE) {
      this.eat();
    }

    return block;
  }

  private parse_declare_function(): Statement {
    this.eat();

    const identifier = this.parse_primary_expression();

    this.expect(TokenType.OPEN_PAREN, "( expected.");

    const parameters = this.parse_args();

    this.expect(TokenType.OPEN_BRACE, "{ expected.");

    const body = this.parse_block_statement();

    this.expect(TokenType.CLOSED_BRACE, "} expected.");

    return {
      type: "FunctionDeclaration",
      identifier: identifier,
      parameters: parameters,
      body: body,
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

    return this.parse_member_expression();
  }

  private parse_primary_expression(): Expression {
    let token = this.currentToken;

    switch (token.type) {
      case TokenType.NUMBER: {
        let expression: Literal = {
          type: "Literal",
          value: parseInt(token.value),
        };

        this.eat();

        return expression;
      }
      case TokenType.STRING: {
        let string: Literal = {
          type: "Literal",
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

        const value = this.parse_expression();

        this.expect(TokenType.CLOSED_PAREN, "No closed parenthesis found.");

        return value;
      }
      case TokenType.OPEN_BRACKET: {
        this.eat();

        const elements = this.parse_array();

        this.expect(TokenType.CLOSED_BRACKET, "] expected.");

        return {
          type: "ArrayExpression",
          elements: elements,
        } as ArrayExpression;
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

  private parse_array() {
    const elements = [];

    while (this.currentToken.type != TokenType.CLOSED_BRACKET) {
      if (this.currentToken.type == TokenType.COMA) {
        this.eat();
      }
      const element = this.parse_primary_expression();
      elements.push(element);
    }

    return elements;
  }
}
