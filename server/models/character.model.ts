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
// import { ColorLogger as Logger, LogLevel } from "../../utilities/colorLogger";
// async function example() {
//   Logger.setLevel(LogLevel.DEBUG);
//   const characterFileModel = new CharacterFileModel();
//   let character = [{ id: 1, name: "John", health: 100, attackPower: 10, luck: 0.5, level: 1 }];
//   characterFileModel.save(character);
//   const characters = characterFileModel.load();
//   Logger.debug(characters.toString());
// }
// example();
