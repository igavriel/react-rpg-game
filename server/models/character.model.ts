///////////////////////////////////////////////////////////////////////////////
// CharacterModel is a class that extends BaseModel and provides a model for characters
///////////////////////////////////////////////////////////////////////////////
import { constants } from "../../utilities/constants";
import { DataTypes, Model, Sequelize } from "sequelize";
import { BaseFileModel } from "../db/baseFileModel";

interface ICharacter {
  id: number;
  name: string;
  health: number;
  attackPower: number;
  luck: number;
  level: number;
}

// Character model - File based
class CharacterFileModel extends BaseFileModel<ICharacter> {
  constructor() {
    super(constants.CHARACTER_FILE);
  }
}

// Character model - Sequelize based
class CharacterDbModel extends Model implements ICharacter {
  declare id: number;
  declare name: string;
  declare health: number;
  declare attackPower: number;
  declare luck: number;
  declare level: number;
}

const characterSequelize = (sequelize: Sequelize) => {
  CharacterDbModel.init({
    id:           { type: DataTypes.INTEGER,  primaryKey: true, autoIncrement: true },
    name:         { type: DataTypes.STRING,   allowNull: false },
    health:       { type: DataTypes.INTEGER,  allowNull: false, validate: { min: 0 } },
    attackPower:  { type: DataTypes.INTEGER,  allowNull: false, validate: { min: 0 } },
    luck:         { type: DataTypes.FLOAT,    allowNull: false, validate: { min: 0, max: 1 } },
    level:        { type: DataTypes.INTEGER,  allowNull: false, validate: { min: 1 } },
  }, {
    sequelize,
    modelName: 'Character',
    tableName: 'character',
    underscored: true,  // Converts all camelCased columns to underscored
    timestamps: true,   // This enables the createdAt and updatedAt columns
  });
  return CharacterDbModel;
};

export { ICharacter, CharacterFileModel, CharacterDbModel, characterSequelize };

///////////////////////////////////////////////////////////////////////////////
// Example usage
///////////////////////////////////////////////////////////////////////////////
// import { ColorLogger, LogLevel } from "../../utilities/colorLogger";
// import baseDatabase from "../db/baseDatabase";
// async function example() {
//   ColorLogger.setLevel(LogLevel.DEBUG);
//   try {
//     const characterFileModel = new CharacterFileModel();
//     let character = [{ id: 1, name: "John", health: 100, attackPower: 10, luck: 0.5, level: 1 }];
//     characterFileModel.save(character);
//     const characters = characterFileModel.load();
//     ColorLogger.debug(characters.toString());

//     // initialize the sequelize model
//     const characterDbModel = characterSequelize(baseDatabase);
//     // Authenticate and sync database
//     await baseDatabase.authenticate();
//     await baseDatabase.sync({ force: false }); // Create tables if not exists
//     ColorLogger.info('Database connection established');
//     // Create new record
//     const newEntry = await characterDbModel.create({
//       name: 'test',
//       health: 100,
//       attackPower: 10,
//       luck: 0.5,
//       level: 1
//     });
//     ColorLogger.debug(`Created entry: ${newEntry.toJSON().name} ${newEntry.toJSON().health} ${newEntry.toJSON().attackPower} ${newEntry.toJSON().luck} ${newEntry.toJSON().level}`);
//     // Read all records
//     const allEntries = await characterDbModel.findAll({
//       order: [['createdAt', 'DESC']] // Newest first
//     });
//     ColorLogger.debug(`All entries: ${allEntries.map(entry => entry.toJSON().name)}`);
//   } catch (error) {
//     console.error('Database error:', error);
//   } finally {
//     await baseDatabase.close();
//   }
// }
// example();
///////////////////////////////////////////////////////////////////////////////
