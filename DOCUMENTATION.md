## Documentation

### Variables/Constant

```ts
// Var
var identifier;
var identifier = 10;
var identifier = fn();
identifier = 7;

// Const
const identifier; // -> Error
const identifier = 10;
const identifier = fn();
identifier = 7; // -> Error
```

### Function declaration

```ts
function my_function() {} // -> null

function my_function() {
  return 1 + 1;
} // -> 2
```

### Comments

```lua
-- This is a comment line
```

### Arrays

```ts
var identifier = [1, 777.777, "hello"];
identifier[0]; // -> 1
identifier[1]; // -> 777.777
identifier[2]; // -> hello
identifier[100000]; // -> null

identifier[0] = 5; // -> [5, 777.777, "hello"]
```

### Native functions

```ts
print("hello world"); // -> hello world
```

### Statements

#### If/else if/else

```ts
if (1) {
  print(1);
}

if (1) {
  print(1);
} else {
  print(2);
}

if (1) {
  print(1);
} else if (2) {
  print(2);
} else {
  print(3);
}
```

### While

```ts
while (1) {
  // do something
}
```
