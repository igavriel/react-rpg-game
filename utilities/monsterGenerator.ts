///////////////////////////////////////////////////////////////////////////////
// MonsterGenerator is a class that generates a random monster
///////////////////////////////////////////////////////////////////////////////
import { CharacterGenerator } from "./characterGenerator";
import { IEnemy } from "../server/models/enemy.model";

export class MonsterGenerator extends CharacterGenerator {
  private prefixes: string[] = [
    "Shadow", "Frost", "Flame", "Storm", "Chaos", "Void", "Toxic", "Feral", "Ancient", "Mystic"
  ];

  private roots: string[] = [
    "fang", "claw", "wing", "scale", "horn", "tail", "eye", "maw", "spine", "tentacle"
  ];

  private suffixes: string[] = [
    "biter", "stalker", "crusher", "slayer", "howler", "lurker", "reaver", "wraith", "beast", "fiend"
  ];

  // Generate a random name
  private generateName(): string {
    const prefix = this.getRandomElement(this.prefixes);
    const root = this.getRandomElement(this.roots);
    const suffix = this.getRandomElement(this.suffixes);

    return `${prefix}${root} ${suffix}`;
  }

  // Generate a random monster
  public generateMonster(lootId: number): IEnemy {
    const name = this.generateName();
    const health = this.generateHealth();
    const attackPower = this.generateAttackPower();
    const luck = this.generateLuck();
    const level = this.generateLevel();

    return { id: 0, name, health, attackPower, luck, level, lootId };
  }
}

///////////////////////////////////////////////////////////////////////////////
// Usage example
///////////////////////////////////////////////////////////////////////////////
// const generator = new MonsterGenerator();
// for (let i = 0; i < 5; i++) {
//   console.log(generator.generateMonster(0) );
// }
///////////////////////////////////////////////////////////////////////////////
