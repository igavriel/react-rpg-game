///////////////////////////////////////////////////////////////////////////////
// CharacterGenerator is an abstract class that provides a random health points and power generator
///////////////////////////////////////////////////////////////////////////////
import { RandomGenerator } from "./randomGenerator";

export abstract class CharacterGenerator extends RandomGenerator {
  // Generate a random health
  protected generateHealth(): number {
    return this.getRandomNumber(10, 50);
  }

  // Generate a random attack power
  protected generateAttackPower(): number {
    return this.getRandomNumber(5, 10);
  }

  // Generate a random luck
  protected generateLuck(): number {
    return this.getRandomNumber(0.25, 0.75);
  }

  // Generate a random level
  protected generateLevel(): number {
    return this.getRandomNumber(1, 5);
  }
}

///////////////////////////////////////////////////////////////////////////////
// Usage example
///////////////////////////////////////////////////////////////////////////////
// class gen extends CharacterGenerator {
//   public randomHP(): number {
//     return this.generateHealth();
//   }
//   public randomPower(): number {
//     return this.generateAttackPower();
//   }
// }
// const generator = new gen();
// console.log(generator.randomHP());
// console.log(generator.randomPower());
///////////////////////////////////////////////////////////////////////////////
