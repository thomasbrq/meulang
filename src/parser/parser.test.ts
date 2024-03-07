import { describe, expect, test } from "bun:test";
import { Lexer } from "../lexer/lexer";
import { Parser } from "./parser";

describe("Parser", () => {
  describe("basics tests", () => {
    test("empty program", () => {
      const code = "";
      const expected = JSON.stringify({ type: "Program", body: [] });

      TestProgram(code, expected);
    });
  });
  describe("var/const tests", () => {
    test("var declaration with no value", () => {
      const code = "var a;";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "VariableDeclaration",
            name: "a",
            constant: false,
          },
        ],
      });

      TestProgram(code, expected);
    });

    test("var declaration with value", () => {
      const code = "var hello = 5;";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "VariableDeclaration",
            name: "hello",
            value: {
              type: "Literal",
              value: 5,
            },
            constant: false,
          },
        ],
      });

      TestProgram(code, expected);
    });

    test("const declaration with value", () => {
      const code = "const hello = 5;";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "VariableDeclaration",
            name: "hello",
            value: {
              type: "Literal",
              value: 5,
            },
            constant: true,
          },
        ],
      });

      TestProgram(code, expected);
    });

    test("const declaration with call function", () => {
      const code = "const a = add(1, 2);";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "VariableDeclaration",
            name: "a",
            value: {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: "add",
              },
              arguments: [
                {
                  type: "Literal",
                  value: 1,
                },
                {
                  type: "Literal",
                  value: 2,
                },
              ],
            },
            constant: true,
          },
        ],
      });
      TestProgram(code, expected);
    });

    test("var declaration with call function", () => {
      const code = "var a = add(1, 2);";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "VariableDeclaration",
            name: "a",
            value: {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: "add",
              },
              arguments: [
                {
                  type: "Literal",
                  value: 1,
                },
                {
                  type: "Literal",
                  value: 2,
                },
              ],
            },
            constant: false,
          },
        ],
      });
      TestProgram(code, expected);
    });

    test("var assign with call function", () => {
      const code = "var a; a = add(1, 2);";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "VariableDeclaration",
            name: "a",
            constant: false,
          },
          {
            type: "ExpressionStatement",
            expression: {
              type: "AssignmentExpression",
              left: {
                type: "Identifier",
                name: "a",
              },
              right: {
                type: "CallExpression",
                callee: {
                  type: "Identifier",
                  name: "add",
                },
                arguments: [
                  {
                    type: "Literal",
                    value: 1,
                  },
                  {
                    type: "Literal",
                    value: 2,
                  },
                ],
              },
              operator: "=",
            },
          },
        ],
      });
      TestProgram(code, expected);
    });

    test("var reassign with call function", () => {
      const code = "var hello = 0; hello = add(5, 1);";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "VariableDeclaration",
            name: "hello",
            value: {
              type: "Literal",
              value: 0,
            },
            constant: false,
          },
          {
            type: "ExpressionStatement",
            expression: {
              type: "AssignmentExpression",
              left: {
                type: "Identifier",
                name: "hello",
              },
              right: {
                type: "CallExpression",
                callee: {
                  type: "Identifier",
                  name: "add",
                },
                arguments: [
                  {
                    type: "Literal",
                    value: 5,
                  },
                  {
                    type: "Literal",
                    value: 1,
                  },
                ],
              },
              operator: "=",
            },
          },
        ],
      });
      TestProgram(code, expected);
    });
  });

  describe("native functions call", () => {
    test("native function call", () => {
      const code = "print(1);";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "CallStatement",
            expression: {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: "print",
              },
              arguments: [
                {
                  type: "Literal",
                  value: 1,
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });
    test("native function call", () => {
      const code = 'print("Hello world!");';
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "CallStatement",
            expression: {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: "print",
              },
              arguments: [
                {
                  type: "Literal",
                  value: "Hello world!",
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });
  });

  describe("nested", () => {
    test("nested function call", () => {
      const code = "print( print() );";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "CallStatement",
            expression: {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: "print",
              },
              arguments: [
                {
                  type: "CallExpression",
                  callee: {
                    type: "Identifier",
                    name: "print",
                  },
                  arguments: [],
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });

    test("nested function call and arguments", () => {
      // add(add(5, 3) + add(4, 5), 5);
      const code = "const a = add(add(5, 3) + add(4, 5),5);";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "VariableDeclaration",
            name: "a",
            value: {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: "add",
              },
              arguments: [
                {
                  type: "BinaryExpression",
                  left: {
                    type: "CallExpression",
                    callee: {
                      type: "Identifier",
                      name: "add",
                    },
                    arguments: [
                      {
                        type: "Literal",
                        value: 5,
                      },
                      {
                        type: "Literal",
                        value: 3,
                      },
                    ],
                  },
                  right: {
                    type: "CallExpression",
                    callee: {
                      type: "Identifier",
                      name: "add",
                    },
                    arguments: [
                      {
                        type: "Literal",
                        value: 4,
                      },
                      {
                        type: "Literal",
                        value: 5,
                      },
                    ],
                  },
                  operator: "+",
                },
                {
                  type: "Literal",
                  value: 5,
                },
              ],
            },
            constant: true,
          },
        ],
      });

      TestProgram(code, expected);
    });
  });

  describe("function declaration", () => {
    test("basic function declaration", () => {
      const code = "function add(a) {     print(); }";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "FunctionDeclaration",
            identifier: {
              type: "Identifier",
              name: "add",
            },
            parameters: [
              {
                type: "Identifier",
                name: "a",
              },
            ],
            body: {
              type: "BlockStatement",
              body: [
                {
                  type: "CallStatement",
                  expression: {
                    type: "CallExpression",
                    callee: {
                      type: "Identifier",
                      name: "print",
                    },
                    arguments: [],
                  },
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });

    test("return statement", () => {
      const code = "function add(a) {     return a + b; }";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "FunctionDeclaration",
            identifier: {
              type: "Identifier",
              name: "add",
            },
            parameters: [
              {
                type: "Identifier",
                name: "a",
              },
            ],
            body: {
              type: "BlockStatement",
              body: [
                {
                  type: "ReturnStatement",
                  argument: {
                    type: "BinaryExpression",
                    left: {
                      type: "Identifier",
                      name: "a",
                    },
                    right: {
                      type: "Identifier",
                      name: "b",
                    },
                    operator: "+",
                  },
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });

    test("return statement parenthesis", () => {
      const code = "function add(a) {     return (a + b); }";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "FunctionDeclaration",
            identifier: {
              type: "Identifier",
              name: "add",
            },
            parameters: [
              {
                type: "Identifier",
                name: "a",
              },
            ],
            body: {
              type: "BlockStatement",
              body: [
                {
                  type: "ReturnStatement",
                  argument: {
                    type: "BinaryExpression",
                    left: {
                      type: "Identifier",
                      name: "a",
                    },
                    right: {
                      type: "Identifier",
                      name: "b",
                    },
                    operator: "+",
                  },
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });

    test("empty return", () => {
      const code = "function add(a) {     return; }";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "FunctionDeclaration",
            identifier: {
              type: "Identifier",
              name: "add",
            },
            parameters: [
              {
                type: "Identifier",
                name: "a",
              },
            ],
            body: {
              type: "BlockStatement",
              body: [
                {
                  type: "ReturnStatement",
                  argument: {
                    type: "Literal",
                    value: null,
                  },
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });
  });

  describe("strings", () => {
    test("basic string in function call", () => {
      const code = 'print("Hello world");';
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "CallStatement",
            expression: {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: "print",
              },
              arguments: [
                {
                  type: "Literal",
                  value: "Hello world",
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });
  });

  describe("if/else if/else", () => {
    test("basic empty if statement", () => {
      const code = "if (1) { }";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "IfStatement",
            test: {
              type: "Literal",
              value: 1,
            },
            consequent: {
              type: "BlockStatement",
              body: [],
            },
            alternate: null,
          },
        ],
      });

      TestProgram(code, expected);
    });

    test("basic if statement with function call", () => {
      const code = "if (1) { print(); }";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "IfStatement",
            test: {
              type: "Literal",
              value: 1,
            },
            consequent: {
              type: "BlockStatement",
              body: [
                {
                  type: "CallStatement",
                  expression: {
                    type: "CallExpression",
                    callee: {
                      type: "Identifier",
                      name: "print",
                    },
                    arguments: [],
                  },
                },
              ],
            },
            alternate: null,
          },
        ],
      });

      TestProgram(code, expected);
    });
    test("basic if/else", () => {
      const code = "if (1) { print(1); } else { print(2); }";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "IfStatement",
            test: {
              type: "Literal",
              value: 1,
            },
            consequent: {
              type: "BlockStatement",
              body: [
                {
                  type: "CallStatement",
                  expression: {
                    type: "CallExpression",
                    callee: {
                      type: "Identifier",
                      name: "print",
                    },
                    arguments: [
                      {
                        type: "Literal",
                        value: 1,
                      },
                    ],
                  },
                },
              ],
            },
            alternate: {
              type: "BlockStatement",
              body: [
                {
                  type: "CallStatement",
                  expression: {
                    type: "CallExpression",
                    callee: {
                      type: "Identifier",
                      name: "print",
                    },
                    arguments: [
                      {
                        type: "Literal",
                        value: 2,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });

    test("basic if/else if/else", () => {
      const code =
        "if (1) { print(1); } else if (2) { print(2); } else { print(3); }";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "IfStatement",
            test: {
              type: "Literal",
              value: 1,
            },
            consequent: {
              type: "BlockStatement",
              body: [
                {
                  type: "CallStatement",
                  expression: {
                    type: "CallExpression",
                    callee: {
                      type: "Identifier",
                      name: "print",
                    },
                    arguments: [
                      {
                        type: "Literal",
                        value: 1,
                      },
                    ],
                  },
                },
              ],
            },
            alternate: {
              type: "IfStatement",
              test: {
                type: "Literal",
                value: 2,
              },
              consequent: {
                type: "BlockStatement",
                body: [
                  {
                    type: "CallStatement",
                    expression: {
                      type: "CallExpression",
                      callee: {
                        type: "Identifier",
                        name: "print",
                      },
                      arguments: [
                        {
                          type: "Literal",
                          value: 2,
                        },
                      ],
                    },
                  },
                ],
              },
              alternate: {
                type: "BlockStatement",
                body: [
                  {
                    type: "CallStatement",
                    expression: {
                      type: "CallExpression",
                      callee: {
                        type: "Identifier",
                        name: "print",
                      },
                      arguments: [
                        {
                          type: "Literal",
                          value: 3,
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        ],
      });

      TestProgram(code, expected);
    });
  });

  describe("rational operators", () => {
    test("== operators", () => {
      const code = "print(1 == 1);";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "CallStatement",
            expression: {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: "print",
              },
              arguments: [
                {
                  type: "BinaryExpression",
                  left: {
                    type: "Literal",
                    value: 1,
                  },
                  right: {
                    type: "Literal",
                    value: 1,
                  },
                  operator: "==",
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });

    test("!= operators", () => {
      const code = "print(1 != 1);";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "CallStatement",
            expression: {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: "print",
              },
              arguments: [
                {
                  type: "BinaryExpression",
                  left: {
                    type: "Literal",
                    value: 1,
                  },
                  right: {
                    type: "Literal",
                    value: 1,
                  },
                  operator: "!=",
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });

    test("> operators", () => {
      const code = "print(1 > 1);";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "CallStatement",
            expression: {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: "print",
              },
              arguments: [
                {
                  type: "BinaryExpression",
                  left: {
                    type: "Literal",
                    value: 1,
                  },
                  right: {
                    type: "Literal",
                    value: 1,
                  },
                  operator: ">",
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });

    test(">= operators", () => {
      const code = "print(1 >= 1);";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "CallStatement",
            expression: {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: "print",
              },
              arguments: [
                {
                  type: "BinaryExpression",
                  left: {
                    type: "Literal",
                    value: 1,
                  },
                  right: {
                    type: "Literal",
                    value: 1,
                  },
                  operator: ">=",
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });

    test("< operators", () => {
      const code = "print(1 < 1);";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "CallStatement",
            expression: {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: "print",
              },
              arguments: [
                {
                  type: "BinaryExpression",
                  left: {
                    type: "Literal",
                    value: 1,
                  },
                  right: {
                    type: "Literal",
                    value: 1,
                  },
                  operator: "<",
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });

    test("<= operators", () => {
      const code = "print(1 <= 1);";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "CallStatement",
            expression: {
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: "print",
              },
              arguments: [
                {
                  type: "BinaryExpression",
                  left: {
                    type: "Literal",
                    value: 1,
                  },
                  right: {
                    type: "Literal",
                    value: 1,
                  },
                  operator: "<=",
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });
  });

  describe("while", () => {
    test("basic while", () => {
      const code = "while(1) {  }";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "WhileStatement",
            test: {
              type: "Literal",
              value: 1,
            },
            body: {
              type: "BlockStatement",
              body: [],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });

    test("while with function call", () => {
      const code = "while(1) { print(1); }";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "WhileStatement",
            test: {
              type: "Literal",
              value: 1,
            },
            body: {
              type: "BlockStatement",
              body: [
                {
                  type: "CallStatement",
                  expression: {
                    type: "CallExpression",
                    callee: {
                      type: "Identifier",
                      name: "print",
                    },
                    arguments: [
                      {
                        type: "Literal",
                        value: 1,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });

    test("while with many body statement", () => {
      const code = "while(1) { print(1); var a; a = 1; }";
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "WhileStatement",
            test: {
              type: "Literal",
              value: 1,
            },
            body: {
              type: "BlockStatement",
              body: [
                {
                  type: "CallStatement",
                  expression: {
                    type: "CallExpression",
                    callee: {
                      type: "Identifier",
                      name: "print",
                    },
                    arguments: [
                      {
                        type: "Literal",
                        value: 1,
                      },
                    ],
                  },
                },
                {
                  type: "VariableDeclaration",
                  name: "a",
                  constant: false,
                },
                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "AssignmentExpression",
                    left: {
                      type: "Identifier",
                      name: "a",
                    },
                    right: {
                      type: "Literal",
                      value: 1,
                    },
                    operator: "=",
                  },
                },
              ],
            },
          },
        ],
      });

      TestProgram(code, expected);
    });
  });

  describe("arrays", () => {
    test("basic var array declaration", () => {
      const code = 'var a = [1,2, 3, 777, "hello", 777.777];';
      const expected = JSON.stringify({
        type: "Program",
        body: [
          {
            type: "VariableDeclaration",
            name: "a",
            value: {
              type: "ArrayExpression",
              elements: [
                { type: "Literal", value: 1 },
                { type: "Literal", value: 2 },
                { type: "Literal", value: 3 },
                { type: "Literal", value: 777 },
                { type: "Literal", value: "hello" },
                { type: "Literal", value: 777.777 },
              ],
            },
            constant: false,
          },
        ],
      });

      TestProgram(code, expected);
    });
  });
});

function TestProgram(code: string, expected: string) {
  const lexer = new Lexer(code);
  const parser = new Parser(lexer);
  const received = parser.parse();

  expect(expected).toBe(JSON.stringify(received));
}
