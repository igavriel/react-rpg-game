///////////////////////////////////////////////////////////////////////////////
// LootModel is a class that extends BaseModel and provides a model for loot
///////////////////////////////////////////////////////////////////////////////
import { constants } from "../../utilities/constants";
import { DataTypes, Model, Sequelize } from "sequelize";
import { BaseFileModel } from "../db/baseFileModel";

interface ILoot {
  id: number;
  name: string;
  value: number;
}

// Loot model - File based
class LootFileModel extends BaseFileModel<ILoot> {
  constructor() {
    super(constants.LOOT_FILE);
  }
}

// Loot model - Sequelize based
class LootDbModel extends Model implements ILoot {
  declare id: number;
  declare name: string;
  declare value: number;
}

const lootSequelize = (sequelize: Sequelize) => {
  LootDbModel.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:  { type: DataTypes.STRING,  allowNull: false },
    value: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
  }, {
    sequelize,
    modelName: 'Loot',
    tableName: 'loot',
    underscored: true, // Converts all camelCased columns to underscored
    timestamps: false, // This disables the createdAt and updatedAt columns
  });
  return LootDbModel;
}

export { ILoot, LootFileModel, LootDbModel, lootSequelize };

// Example usage
///////////////////////////////////////////////////////////////////////////////
// import { ColorLogger as Logger, LogLevel } from "../../utilities/colorLogger";
// async function example() {
//   Logger.setLevel(LogLevel.DEBUG);
//   const lootModel = new LootFileModel();
//   let loots = [{ id: 1, name: "Sword", value: 10 }, { id: 2, name: "Sword2", value: 12 }];
//   lootModel.save(loots);
//   const readLoot = lootModel.load();
//   Logger.debug(readLoot.toString());
// }
// example();
