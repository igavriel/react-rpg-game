///////////////////////////////////////////////////////////////////////////////
// PlayerModel is a class that extends BaseModel and provides a model for players
///////////////////////////////////////////////////////////////////////////////
import { CharacterDbModel, characterSequelize, ICharacter } from "./character.model";
import { constants } from "../../utilities/constants";
import { DataTypes, Model, Sequelize } from "sequelize";
import { BaseFileModel } from "../db/baseFileModel";

interface IPlayer extends ICharacter {
  experience: number;
  levelUpExperience: number;
}

interface IDbPlayer {
  experience: number;
  levelUpExperience: number;
}

// Player model - File based
class PlayerFileModel extends BaseFileModel<IPlayer> {
  constructor() {
    super(constants.PLAYER_FILE);
  }
}

// Player model - Sequelize based
class PlayerDbModel extends Model implements IDbPlayer {
  declare id: number;
  declare experience: number;
  declare levelUpExperience: number;
}

const playerSequelize = (sequelize: Sequelize) => {
  PlayerDbModel.init({
    id:                 { type: DataTypes.INTEGER, primaryKey: true,
      references:       { model : CharacterDbModel, key: "id", }
    },
    experience:         { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    levelUpExperience:  { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
  }, {
    sequelize,
    modelName: 'Player',
    tableName: 'player',
  });
  return PlayerDbModel;
};

export { IPlayer, PlayerFileModel, PlayerDbModel, playerSequelize };

///////////////////////////////////////////////////////////////////////////////
// Example usage
///////////////////////////////////////////////////////////////////////////////
// import { ColorLogger, LogLevel } from "../../utilities/colorLogger";
// import baseDatabase from "../db/baseDatabase";
// async function example() {
//   ColorLogger.setLevel(LogLevel.DEBUG);
//   try {
//     const playerFileModel = new PlayerFileModel();
//     let player = { id: 1, name: "John", health: 100, attackPower: 10, luck: 0.5, level: 1, experience: 0, levelUpExperience: 100 };
//     playerFileModel.save([player]);
//     const readPlayer = playerFileModel.load();
//     ColorLogger.debug(readPlayer.toString());

//     // initialize the sequelize model
//     const characterDbModel = characterSequelize(baseDatabase);
//     const playerDbModel = playerSequelize(baseDatabase);
//     // Authenticate and sync database
//     await baseDatabase.authenticate();
//     await baseDatabase.sync({ force: false }); // Create tables if not exists
//     ColorLogger.info('Database connection established');

//     // Step 1: Create a Character - without id
//     let characterEntry = { name: "Test", health: 100, attackPower: 10, luck: 0.5, level: 1 };
//     const character = await characterDbModel.create(characterEntry);
//     const charJson = character.toJSON();
//     ColorLogger.debug(`Character created: ${charJson.id} = ${charJson.name} ${charJson.health} ${charJson.attackPower} ${charJson.luck} ${charJson.level}`);

//     // Step 2: Create a Player linked to the Character using the character id
//     const newEntry = await playerDbModel.create({
//       id: character.id,
//       experience: 0,
//       levelUpExperience: 100
//     });
//     ColorLogger.debug(`Created entry: ${newEntry.toJSON().name} ${newEntry.toJSON().experience} ${newEntry.toJSON().levelUpExperience}`);

//     const allEntries = await playerDbModel.findAll({
//       order: [['createdAt', 'DESC']] // Newest first
//     });
//     console.log('All entries:', allEntries.map(entry => entry.toJSON()));
//   } catch (error) {
//     console.error('Database error:', error);
//   } finally {
//     await baseDatabase.close();
//   }
// }
// example();
///////////////////////////////////////////////////////////////////////////////
