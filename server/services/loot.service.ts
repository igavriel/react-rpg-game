import { ILoot } from "../models/loot.model";

export class LootService {
  protected _loot: ILoot;

  constructor(data: ILoot);
  constructor(name: string, value: number);
  constructor(nameOrData: string | ILoot, value?: number) {
      if (typeof nameOrData === 'string' &&
          typeof value === 'number') {
          this._loot = { name: nameOrData, value };
      } else if (typeof nameOrData === 'object') {
          this._loot = { ...nameOrData };
      } else {
          throw new Error('Invalid constructor arguments');
      }
  }

  get loot() : ILoot {
    return this._loot;
  }
}
