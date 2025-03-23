///////////////////////////////////////////////////////////////////////////////
// HeroNameGenerator is a class that generates a random player name
///////////////////////////////////////////////////////////////////////////////
import { CharacterGenerator } from "./characterGenerator";
import { IPlayer } from "../server/models/player.model";

export class PlayerGenerator extends CharacterGenerator {
  private firstNames: string[] = [
    "Aiden", "Brynn", "Caspian", "Daphne", "Elowen", "Finn", "Gwendolyn", "Hector",
    "Iris", "Jasper", "Keira", "Liam", "Mira", "Nolan", "Ophelia", "Phoenix",
    "Quinn", "Rowan", "Sage", "Thora", "Ursa", "Vex", "Wren", "Xander", "Yara", "Zephyr"
  ];

  private lastNames: string[] = [
    "Blackwood", "Cloudkeeper", "Dawnbringer", "Earthshaker", "Frostwind", "Goldenheart",
    "Ironside", "Lightfoot", "Moonshadow", "Nightwalker", "Oakenshield", "Ravenclaw",
    "Silverthorn", "Stormborn", "Swiftarrow", "Thorngage", "Truthseeker", "Voidwalker",
    "Windrider", "Wolfsbane"
  ];

  private titles: string[] = [
    "the Brave", "the Wise", "the Swift", "the Strong", "the Cunning", "the Just",
    "the Merciful", "the Unyielding", "the Shadowdancer", "the Dragonheart",
    "the Spellweaver", "the Lionheart", "the Peacekeeper", "the Stormcaller",
    "the Truthsayer"
  ];

  private generateName(): string {
    const firstName = this.getRandomElement(this.firstNames);
    const lastName = this.getRandomElement(this.lastNames);
    const title = this.getRandomElement(this.titles);

    // 50% chance to include a title
    const includeTitle = Math.random() < 0.5;

    return includeTitle ? `${firstName} ${lastName} ${title}` : `${firstName} ${lastName}`;
  }

  // Generate a random player
  public generatePlayer(): IPlayer {
    const name = this.generateName();
    const health = this.generateHealth();
    const attackPower = this.generateAttackPower();
    const luck = this.generateLuck();
    const level = 1;  // a player starts at level 1
    const experience = 0; // a player starts with 0 experience
    const levelUpExperience = 50; // a player needs 50 experience to level up

    return { id: 0, name, health, attackPower, luck, level, experience, levelUpExperience };
  }
}

///////////////////////////////////////////////////////////////////////////////
// Usage example
///////////////////////////////////////////////////////////////////////////////
// const generator = new PlayerGenerator();
// for (let i = 0; i < 5; i++) {
//   console.log(generator.generatePlayer());
// }
///////////////////////////////////////////////////////////////////////////////
