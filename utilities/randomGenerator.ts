///////////////////////////////////////////////////////////////////////////////
// RandomGenerator provides a random string element from array and random number
///////////////////////////////////////////////////////////////////////////////
export class RandomGenerator {
  // Generate a random element
  public getRandomElement(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Generate a random number
  public getRandomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
  // Generate a random integer
  public getRandomInteger(min: number, max: number): number {
    return Math.floor(this.getRandomNumber(min, max));
  }
}

///////////////////////////////////////////////////////////////////////////////
// Usage example
///////////////////////////////////////////////////////////////////////////////
// const generator = new RandomGenerator();
// for (let i = 0; i < 5; i++) {
//   console.log(generator.getRandomElement(["apple", "banana", "cherry"]),
//               generator.getRandomInteger(1, 10),
//               generator.getRandomNumber(1, 10),
//               generator.getRandomNumber(0.1, 0.8)
//             );
// }
///////////////////////////////////////////////////////////////////////////////