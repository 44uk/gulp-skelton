let hello = (name = 'no name') => {
  return `hello! ${name}!`;
}

class Bar {
  constructor (name) {
    this.name = name;
  }

  greet () {
    return `My name is ${this.name}.`;
  }
}

console.log(hello());
console.log(hello('alice'));
console.log((new Bar('bob')).greet());
