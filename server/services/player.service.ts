import { IPlayer } from "../models/player.model";
import { CharacterService } from "./character.service";

export class PlayerService extends CharacterService {
  protected _experience: number;
  protected _levelUpExperience: number;

  // Constructor
  constructor(data: IPlayer);
  constructor(name: string, health: number, attackPower: number, level: number);
  constructor(nameOrData: string | IPlayer, health?: number, attackPower?: number, level?: number) {
    if (typeof nameOrData === 'string' &&
        typeof health === 'number' &&
        typeof attackPower === 'number' &&
        typeof level === 'number') {
      super(nameOrData, health, attackPower, level);
      this._experience = 0;
      this._levelUpExperience = level * 50;
    } else if (typeof nameOrData === 'object') {
      super(nameOrData);
      this._experience = nameOrData.experience;
      this._levelUpExperience = nameOrData.levelUpExperience;
    } else {
      throw new Error('Invalid constructor arguments');
    }
  }

  // Getters
  get experience() : number {
      return this._experience;
  }

  get levelUpExperience() : number {
      return this._levelUpExperience;
  }

  get player() : IPlayer {
    return {
      id: this._character.id,
      name: this._character.name,
      health: this._character.health,
      attackPower: this._character.attackPower,
      level: this._character.level,
      luck: this._character.luck,
      experience: this._experience,
      levelUpExperience: this._levelUpExperience
    }
  }

  gainExperience(amount: number) {
      this._experience += amount;
      if (this.experience >= this.levelUpExperience) {
          this.levelUp();
      }
  }

  protected levelUp() {
      super.levelUp();
      this._experience = 0; // reset experience
      this._levelUpExperience += this._character.level * 50; // Increase XP required for next level
  }
}
