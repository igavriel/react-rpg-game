import { IEnemy } from "../models/enemy.model";
import { ILoot } from "../models/loot.model";
import { CharacterService } from "./character.service";

export class EnemyService extends CharacterService {
  protected _loot: ILoot;

  constructor(data: IEnemy);
  constructor(name: string, health: number, attackPower: number, level: number, loot: ILoot);
  constructor(nameOrData: string | IEnemy, health?: number, attackPower?: number, level?: number, loot?: ILoot) {
      if (typeof nameOrData === 'string' &&
          typeof health === 'number' &&
          typeof attackPower === 'number' &&
          typeof level === 'number' &&
          typeof loot === 'object') {
          super(nameOrData, health, attackPower, level);
          this._loot = loot;
      } else if (typeof nameOrData === 'object') {
          super(nameOrData);
          this._loot = nameOrData.loot;
      } else {
          throw new Error('Invalid constructor arguments');
      }
  }

  get loot() : ILoot {
    return this._loot;
  }

  get enemy() : IEnemy {
    return {
      id: this._character.id,
      name: this._character.name,
      health: this._character.health,
      attackPower: this._character.attackPower,
      level: this._character.level,
      luck: this._character.luck,
      loot: this._loot
    }
  }
}
