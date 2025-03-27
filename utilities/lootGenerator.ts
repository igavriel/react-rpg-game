///////////////////////////////////////////////////////////////////////////////
// LootGenerator is a class that generates a random loot
///////////////////////////////////////////////////////////////////////////////
import { RandomGenerator } from "./randomGenerator";
import { ILoot } from "../server/models/loot.model";

export class LootGenerator extends RandomGenerator {
  private prefixes: string[] = [
    "Rusty", "Shiny", "Ancient", "Magical", "Cursed", "Blessed", "Enchanted", "Mysterious", "Glowing", "Dark"
  ];

  private items: string[] = [
    "Sword", "Shield", "Amulet", "Ring", "Potion", "Scroll", "Gem", "Coin", "Dagger", "Staff"
  ];

  private materials: string[] = [
    "Iron", "Gold", "Silver", "Bronze", "Crystal", "Obsidian", "Mithril", "Dragonbone", "Moonstone", "Stardust"
  ];

  // Generate a random item name
  private generateItemName(): string {
    const prefix = this.getRandomElement(this.prefixes);
    const item = this.getRandomElement(this.items);
    const material = this.getRandomElement(this.materials);

    return `${prefix} ${material} ${item}`;
  }

  // Calculate the value of the loot
  private calculateValue(level: number): number {
    // If level is less than 1, set it to 1
    if (level < 1) {
      level = 1;
    }
    // Base value between 10 and 50
    const baseValue = this.getRandomInteger(10, 50);
    // Multiply by level to scale the value
    return baseValue * level;
  }

  // Generate a random loot
  public generateLoot(level: number): ILoot {
    const name = this.generateItemName();
    const value = this.calculateValue(level);
    return { id: 0, name, value };
  }
}

///////////////////////////////////////////////////////////////////////////////
// Usage example
///////////////////////////////////////////////////////////////////////////////
// const generator = new LootGenerator();
// for (let i = 0; i < 5; i++) {
//   console.log(generator.generateLoot(10));
// }
///////////////////////////////////////////////////////////////////////////////
