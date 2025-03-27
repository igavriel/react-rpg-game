///////////////////////////////////////////////////////////////////////////////
// LootModel is a class that extends BaseModel and provides a model for loot
///////////////////////////////////////////////////////////////////////////////
import { constants } from "../../utilities/constants";
import { DataTypes, Model, Sequelize } from "sequelize";
import { BaseFileModel } from "../db/baseFileModel";
import { GameDbModel } from "./game.model";
import { EnemyDbModel } from "./enemy.model";

interface IGameEnemy {
  gameId: number;
  enemyId: number;
}

// GameEnemy model - File based
class GameEnemyFileModel extends BaseFileModel<IGameEnemy> {
  constructor() {
    super(constants.GAME_ENEMY_FILE);
  }
}

// GameEnemy model - Sequelize based
class GameEnemyDbModel extends Model implements IGameEnemy {
  declare gameId: number;
  declare enemyId: number;
}

const gameEnemySequelize = (sequelize: Sequelize, game: typeof GameDbModel, enemy: typeof EnemyDbModel) => {
  GameEnemyDbModel.init({
    gameId: { type: DataTypes.INTEGER, primaryKey: true,
      references: { model: game, key: 'id' },
      onDelete: "CASCADE"
    },
    enemyId: { type: DataTypes.INTEGER, allowNull: false,
      references: { model: enemy, key: 'id' },
      onDelete: "CASCADE"
    },
  }, {
    sequelize,
    modelName: 'GameEnemy',
    tableName: 'game_enemy',
    underscored: true, // Converts all camelCased columns to underscored
    timestamps: false, // This disables the createdAt and updatedAt columns
  });
  return GameEnemyDbModel;
}

export { IGameEnemy, GameEnemyFileModel, GameEnemyDbModel, gameEnemySequelize };

// Example usage
///////////////////////////////////////////////////////////////////////////////
// import { ColorLogger, LogLevel } from "../../utilities/colorLogger";
// import baseDatabase from "../db/baseDatabase";
// import { characterSequelize } from "./character.model";
// import { playerSequelize } from "./player.model";
// import { lootSequelize } from "./loot.model";
// import { gameSequelize } from "./game.model";
// import { enemySequelize } from "./enemy.model";
// async function example() {
//   ColorLogger.setLevel(LogLevel.DEBUG);
//   try {
//     const gameEnemyModel = new GameEnemyFileModel();
//     let gameEnemies = [{ gameId: 1, enemyId: 1 }, { gameId: 2, enemyId: 2 }];
//     gameEnemyModel.save(gameEnemies);
//     const readGameEnemy = gameEnemyModel.load();
//     ColorLogger.debug(readGameEnemy.toString());

//     // initialize the sequelize model
//     const characterDbModel = characterSequelize(baseDatabase);
//     const playerDbModel = playerSequelize(baseDatabase, characterDbModel);
//     const gameDbModel = gameSequelize(baseDatabase, playerDbModel);
//     const lootDbModel = lootSequelize(baseDatabase);
//     const enemyDbModel = enemySequelize(baseDatabase, characterDbModel, lootDbModel);
//     const gameEnemyDbModel = gameEnemySequelize(baseDatabase, gameDbModel, enemyDbModel);
//     // Authenticate and sync database
//     await baseDatabase.authenticate();
//     await baseDatabase.sync({ force: false }); // Create tables if not exists
//     ColorLogger.info('Database connection established');
//     // Step 1: Create a Character - without id
//     let characterEntry = { name: "Test", health: 100, attackPower: 10, luck: 0.5, level: 1 };
//     const character1 = await characterDbModel.create(characterEntry);
//     const charJson = character1.toJSON();
//     ColorLogger.debug(`Character created: ${charJson.id} = ${charJson.name} ${charJson.health} ${charJson.attackPower} ${charJson.luck} ${charJson.level}`);
//     // Step 2: Create a Player linked to the Character using the character id
//     const player = await playerDbModel.create({ id: character1.id, experience: 0, levelUpExperience: 100 });
//     const playerJson = player.toJSON();
//     ColorLogger.debug(`Player created: ${playerJson.id} ${playerJson.experience} ${playerJson.levelUpExperience}`);
//     // Step 3: Create a Game linked to the Player using the player id
//     const game = await gameDbModel.create({ playerId: player.id, score: 0, date: new Date() });
//     const gameJson = game.toJSON();
//     ColorLogger.debug(`Game created: ${gameJson.id} ${gameJson.playerId} ${gameJson.score} ${gameJson.date}`);
//     // Step 4: Create an Enemy linked to the Character using the character id
//     const character2 = await characterDbModel.create(characterEntry);
//     const char2Json = character2.toJSON();
//     ColorLogger.debug(`Character created: ${char2Json.id} = ${char2Json.name} ${char2Json.health} ${char2Json.attackPower} ${char2Json.luck} ${char2Json.level}`);
//     const enemy = await enemyDbModel.create({ id: character2.id, lootId: 1 });
//     const enemyJson = enemy.toJSON();
//     ColorLogger.debug(`Enemy created: ${enemyJson.id} ${enemyJson.lootId}`);
//     // Step 5: Create a GameEnemy linked to the Game and Enemy using the game id and enemy id
//     const gameEnemy = await gameEnemyDbModel.create({ gameId: game.id, enemyId: enemy.id });
//     const gameEnemyJson = gameEnemy.toJSON();
//     ColorLogger.debug(`GameEnemy created: ${gameEnemyJson.gameId} ${gameEnemyJson.enemyId}`);
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
