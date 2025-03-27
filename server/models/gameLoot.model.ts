///////////////////////////////////////////////////////////////////////////////
// LootModel is a class that extends BaseModel and provides a model for loot
///////////////////////////////////////////////////////////////////////////////
import { constants } from "../../utilities/constants";
import { DataTypes, Model, Sequelize } from "sequelize";
import { BaseFileModel } from "../db/baseFileModel";
import { GameDbModel } from "./game.model";
import { LootDbModel } from "./loot.model";

interface IGameLoot {
  gameId: number;
  lootId: number;
}

// GameLoot model - File based
class GameLootFileModel extends BaseFileModel<IGameLoot> {
  constructor() {
    super(constants.GAME_LOOT_FILE);
  }
}

// GameLoot model - Sequelize based
class GameLootDbModel extends Model implements IGameLoot {
  declare gameId: number;
  declare lootId: number;
}

const gameLootSequelize = (sequelize: Sequelize, game: typeof GameDbModel, loot: typeof LootDbModel) => {
  GameLootDbModel.init({
    gameId: { type: DataTypes.INTEGER, primaryKey: true,
      references: { model: game, key: 'id' },
      onDelete: "CASCADE"
    },
    lootId: { type: DataTypes.INTEGER, allowNull: false,
      references: { model: loot, key: 'id' },
      onDelete: "CASCADE"
    },
  }, {
    sequelize,
    modelName: 'GameLoot',
    tableName: 'game_loot',
    underscored: true, // Converts all camelCased columns to underscored
    timestamps: false, // This disables the createdAt and updatedAt columns
  });
  return GameLootDbModel;
}

export { IGameLoot, GameLootFileModel, GameLootDbModel, gameLootSequelize };

// Example usage
///////////////////////////////////////////////////////////////////////////////
// import { ColorLogger, LogLevel } from "../../utilities/colorLogger";
// import baseDatabase from "../db/baseDatabase";
// import { characterSequelize } from "./character.model";
// import { playerSequelize } from "./player.model";
// import { lootSequelize } from "./loot.model";
// import { gameSequelize } from "./game.model";
// async function example() {
//   ColorLogger.setLevel(LogLevel.DEBUG);
//   try {
//     const gameLootModel = new GameLootFileModel();
//     let gameLoots = [{ gameId: 1, lootId: 1 }, { gameId: 2, lootId: 2 }];
//     gameLootModel.save(gameLoots);
//     const readGameEnemy = gameLootModel.load();
//     ColorLogger.debug(readGameEnemy.toString());

//     // initialize the sequelize model
//     const characterDbModel = characterSequelize(baseDatabase);
//     const playerDbModel = playerSequelize(baseDatabase, characterDbModel);
//     const gameDbModel = gameSequelize(baseDatabase, playerDbModel);
//     const lootDbModel = lootSequelize(baseDatabase);
//     const gameLootDbModel = gameLootSequelize(baseDatabase, gameDbModel, lootDbModel);
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
//     // Step 4: Create an Loot
//     const loot = await lootDbModel.create({ name: "Test", value: 100 });
//     const lootJson = loot.toJSON();
//     ColorLogger.debug(`Loot created: ${lootJson.id} ${lootJson.name} ${lootJson.value}`);
//     // Step 5: Create a GameLoot linked to the Game and Loot using the game id and loot id
//     const gameLoot = await gameLootDbModel.create({ gameId: game.id, lootId: loot.id });
//     const gameLootJson = gameLoot.toJSON();
//     ColorLogger.debug(`GameLoot created: ${gameLootJson.gameId} ${gameLootJson.lootId}  `);
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
