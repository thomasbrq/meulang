export class Utils {
  constructor() {}

  is_digit(c: string): boolean {
    return c >= "0" && c <= "9";
  }

  is_float(c: string): boolean {
    return this.is_digit(c) || c == ".";
  }

  is_alpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_";
  }

  is_alphanum(c: string): boolean {
    const is_alpha = this.is_alpha(c);
    const is_num = this.is_digit(c);

    return is_alpha || is_num;
  }

  is_whitespace(c: string): boolean {
    return c == " " || c == "\t" || c == "\n" || c == "\r";
  }

  is_comment(current: string, next: string): boolean {
    return current == "-" && next == "-";
  }
}
