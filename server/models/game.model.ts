///////////////////////////////////////////////////////////////////////////////
// GameModel is a class that extends BaseModel and provides a model for game
///////////////////////////////////////////////////////////////////////////////
import { constants } from "../../utilities/constants";
import { DataTypes, Model, Sequelize } from "sequelize";
import { BaseFileModel } from "../db/baseFileModel";
import { PlayerDbModel } from "./player.model";

interface IGame {
  id: number;
  playerId: number;
  score: number;
  date: Date;
}

// Game model - File based
class GameFileModel extends BaseFileModel<IGame> {
  constructor() {
    super(constants.GAME_FILE);
  }
}

// Game model - Sequelize based
class GameDbModel extends Model implements IGame {
  declare id: number;
  declare playerId: number;
  declare score: number;
  declare date: Date;
}

const gameSequelize = (sequelize: Sequelize, player: typeof PlayerDbModel) => {
  GameDbModel.init({
    id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    playerId:  { type: DataTypes.INTEGER, allowNull: false,
      references: { model: player, key: 'id' } },
    score:      { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    date:       { type: DataTypes.DATE, allowNull: false },
  }, {
    sequelize,
    modelName: 'Game',
    tableName: 'game',
    underscored: true,  // Converts all camelCased columns to underscored
    timestamps: true,   // This enables the createdAt and updatedAt columns
  });
  return GameDbModel;
}

export { IGame, GameFileModel, GameDbModel, gameSequelize };

// Example usage
///////////////////////////////////////////////////////////////////////////////
// import { ColorLogger, LogLevel } from "../../utilities/colorLogger";
// import { characterSequelize } from "./character.model";
// import { playerSequelize } from "./player.model";
// import baseDatabase from "../db/baseDatabase";
// async function example() {
//   ColorLogger.setLevel(LogLevel.DEBUG);
//   try {
//     const gameModel = new GameFileModel();
//     let games = [{ id: 1, playerId: 1, score: 10, date: new Date() }, { id: 2, playerId: 2, score: 12, date: new Date() }];
//     gameModel.save(games);
//     const readGame = gameModel.load();
//     ColorLogger.debug(readGame.toString());
//     // initialize the sequelize model
//     const characterDbModel = characterSequelize(baseDatabase);
//     const playerDbModel = playerSequelize(baseDatabase, characterDbModel);
//     const gameDbModel = gameSequelize(baseDatabase, playerDbModel);
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
//     const player = await playerDbModel.create({ id: character.id, experience: 0, levelUpExperience: 100 });
//     const playerJson = player.toJSON();
//     ColorLogger.debug(`Player created: ${playerJson.id} ${playerJson.experience} ${playerJson.levelUpExperience}`);
//     // Step 3: Create a Game linked to the Player using the player id
//     const game = await gameDbModel.create({ playerId: player.id, score: 0, date: new Date() });
//     const gameJson = game.toJSON();
//     ColorLogger.debug(`Game created: ${gameJson.id} ${gameJson.playerId} ${gameJson.score} ${gameJson.date}`);

//     // Read all records
//     const allEntries = await gameDbModel.findAll({
//       order: [['created_at', 'DESC']] // Newest first
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
