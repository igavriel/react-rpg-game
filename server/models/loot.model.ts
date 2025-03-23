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
// import { ColorLogger, LogLevel } from "../../utilities/colorLogger";
// import baseDatabase from "../db/baseDatabase";
// async function example() {
//   ColorLogger.setLevel(LogLevel.DEBUG);
//   try {
//     const lootModel = new LootFileModel();
//     let loots = [{ id: 1, name: "Sword", value: 10 }, { id: 2, name: "Sword2", value: 12 }];
//     lootModel.save(loots);
//     const readLoot = lootModel.load();
//     ColorLogger.debug(readLoot.toString());

//     // initialize the sequelize model
//     const lootDbModel = lootSequelize(baseDatabase);
//     // Authenticate and sync database
//     await baseDatabase.authenticate();
//     await baseDatabase.sync({ force: false }); // Create tables if not exists
//     ColorLogger.info('Database connection established');
//     // Create new record
//     const newEntry = await lootDbModel.create({ name: "Sword", value: 10 });
//     const entryJson = newEntry.toJSON();
//     ColorLogger.debug(`newEntry: ${entryJson.id} ${entryJson.name} ${entryJson.value}`);
//     // Read all records
//     const allEntries = await lootDbModel.findAll({
//       order: [['id', 'DESC']] // Newest first
//     });
//     ColorLogger.debug(`allEntries: ${allEntries.map(e => e.toJSON().name)}`);
//   } catch (error) {
//     console.error('Database error:', error);
//   } finally {
//     await baseDatabase.close();
//   }
// }
// example();
///////////////////////////////////////////////////////////////////////////////
