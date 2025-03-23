import { IEnemy } from "../models/enemy.model";
import { ILoot } from "../models/loot.model";
import { CharacterService } from "./character.service";

export class EnemyService extends CharacterService {
  protected _lootId: number;

  constructor(data: IEnemy);
  constructor(name: string, health: number, attackPower: number, level: number, lootId: number);
  constructor(nameOrData: string | IEnemy, health?: number, attackPower?: number, level?: number, lootId?: number) {
      if (typeof nameOrData === 'string' &&
          typeof health === 'number' &&
          typeof attackPower === 'number' &&
          typeof level === 'number' &&
          typeof lootId === 'number') {
          super(nameOrData, health, attackPower, level);
          this._lootId = lootId;
      } else if (typeof nameOrData === 'object') {
          super(nameOrData);
          this._lootId = nameOrData.lootId;
      } else {
          throw new Error('Invalid constructor arguments');
      }
  }

  get loot_id() : number {
    return this._lootId;
  }

  get enemy() : IEnemy {
    return {
      id: this._character.id,
      name: this._character.name,
      health: this._character.health,
      attackPower: this._character.attackPower,
      level: this._character.level,
      luck: this._character.luck,
      lootId: this._lootId
    }
  }
}
