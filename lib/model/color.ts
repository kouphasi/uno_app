class Color {
  name: string;
  code: string;

  constructor({name, code}: {name: string; code: string}) {
    this.name = name;
    this.code = code;
  }

  eq(color: Color | null | undefined): boolean {
    return this.name == color?.name;
  }
}

export default Color;
