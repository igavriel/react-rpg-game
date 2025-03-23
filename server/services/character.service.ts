import { ICharacter } from "../models/character.model";

export abstract class CharacterService {
    protected _character: ICharacter;

    constructor(data: ICharacter);
    constructor(name: string, health: number, attackPower: number, level: number);
    constructor(nameOrData: string | ICharacter, health?: number, attackPower?: number, level?: number) {
        if (typeof nameOrData === 'string' &&
            typeof health === 'number' &&
            typeof attackPower === 'number' &&
            typeof level === 'number') {
            this._character = {
              id: 0,
              name: nameOrData,
              health,
              attackPower,
              level,
              luck: this.calculateLuck(0.25, 0.75) };
        } else if (typeof nameOrData === 'object') {
            this._character = { ...nameOrData, id: 0 };
        } else {
            throw new Error('Invalid constructor arguments');
        }
    }

    get character() : ICharacter {
      return this._character;
    }

    private isLucky() : boolean {
      // the random is smaller than the luck -> you are lucky
      return Math.random() < this._character.luck;
    }

    protected calculateLuck(min: number = 0.25, max: number = 0.75) : number {
      let range = Math.abs(max - min);
      if (range + min > 1.0) {
        console.warn(`Range is too big for luck calculation - force to default`);
        return Math.random() * 0.5 + 0.25;
      }
      return Math.random() * range + min;
    }

    // Attack Logic:
    // Lucky -> Critical Hit (2x damage)
    // No Luck at all (random >luck + 0.3) -> Miss (No damage)
    // otherwise -> normal hit
    attack(enemy: CharacterService) {
      let damage = this._character.attackPower;

      if (this.isLucky()) {
        console.info(`💥💥💥 Critical Hit! ${this._character.name} hit ${enemy.character.name} for ${damage} damage`);
        damage *= 2;
      } else if (Math.random() > this._character.luck + 0.3) {
        console.info("😞 You missed!");
        damage = 0;
      } else {
        console.info(`💥 ${this._character.name} hit ${enemy.character.name} for ${damage} damage`);
      }
      enemy._character.health -= damage;
    }

    // Defend Logic:
    // Lucky -> Successful Defense (No damage)
    // No Luck:
    //  Luck > 0.5 -> Reduces incoming damage by 50%
    //  Luck < 0.5 -> Reduces only by 20%
    defend(enemyAttackPower: number) {
      let damage = enemyAttackPower;

      if (this.isLucky()) {
        damage = 0;
        console.info(`💨 ${this._character.name} blocked the attack`);
      } else {
        let defenseFactor = this._character.luck > 0.5 ? 0.5 : 0.8; // Reduce damage more if luck is high
        damage = Math.floor(damage * defenseFactor);
        console.log(`🛡️ ${this._character.name} defended and took only ${damage} damage!`);
      }

      this._character.health -= damage;
    }

    // Escape Logic:
    // Lucky -> Successful Escape (Negative Damage=Heal)
    // No Luck at all (random >luck + 0.3) -> Full damage
    // otherwise -> Partial escape (50% damage)
    escape(enemyAttackPower: number) {
      let damage = enemyAttackPower;

      if (this.isLucky()) {
        damage = -3; // Negative damage = heal
        console.info("🏃‍♂️ You successfully escaped without damage and get some healing!");
      } else if (Math.random() > this._character.luck + 0.3) {
        console.info(`❌ Failed to escape! The enemy attacked you for ${damage} damage!`);
      } else {
        damage = Math.floor(damage * 0.5); // Take 50% enemy attack
        console.info(`😰 You escaped but took ${damage} damage!`);
      }

      this._character.health -= damage;
    }

    // Check if the character is alive
    isAlive() : boolean {
      return this._character.health > 0;
    }

    protected levelUp() {
      this._character.level++;
      this._character.attackPower += 5; // Increase attack
      this._character.health += 10; // Increase max health
      this._character.luck = this.calculateLuck(this._character.luck, this._character.luck+0.1); // Increase luck
      console.info(`🎉 ${this._character.name} has reached level ${this._character.level}!`);
    }
}
