import { IEnemy } from "../models/enemy.model";
import { ILoot } from "../models/loot.model";
import { CharacterService } from "./character.service";

export class EnemyService extends CharacterService {
  protected _loot: ILoot;

  constructor(data: IEnemy, loot: ILoot) {
    super(data);
    this._loot = loot;
  }

  set loot(loot: ILoot) {
    this._loot = loot;
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
      lootId: this._loot.id
    }
  }
}
