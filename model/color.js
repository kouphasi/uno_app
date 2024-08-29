class Color {
  constructor({name, code}) {
    this.name = name;
    this.code = code;
  }

  eq(color) {
    return this.name == color?.name;
  }
}

export default Color;
