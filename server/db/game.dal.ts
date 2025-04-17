///////////////////////////////////////////////////////////////////////////////
// GameDAL is a class that provides data access layer operations for games
///////////////////////////////////////////////////////////////////////////////
import { ColorLogger as Logger } from "../../utilities/colorLogger";
import { IGame, GameDbModel } from "../models/game.model";
import { IGameEnemy, GameEnemyDbModel } from "../models/gameEnemy.model";
import { IGameLoot, GameLootDbModel } from "../models/gameLoot.model";
import { Op } from "sequelize";

export class GameDAL {
  private gameModel: typeof GameDbModel;
  private gameEnemyModel: typeof GameEnemyDbModel;
  private gameLootModel: typeof GameLootDbModel;

  constructor(
    gameModel: typeof GameDbModel,
    gameEnemyModel: typeof GameEnemyDbModel,
    gameLootModel: typeof GameLootDbModel
  ) {
    this.gameModel = gameModel;
    this.gameEnemyModel = gameEnemyModel;
    this.gameLootModel = gameLootModel;
  }

  // Create a new game
  async createGame(playerId: number): Promise<IGame> {
    try {
      Logger.debug(`GameDAL:createGame - Creating game for player ${playerId}`);
      const newGame = await this.gameModel.create({ playerId, score: 0, date: new Date() });
      Logger.debug(`GameDAL:createGame - Game created with ID: ${newGame.id}`);
      return newGame.toJSON();
    } catch (error) {
      Logger.error(`GameDAL:createGame - Failed to create game: ${error}`);
      throw error;
    }
  }

  // Read a game by ID
  async getGameById(id: number): Promise<IGame | null> {
    try {
      const game = await this.gameModel.findByPk(id);
      return game?.toJSON() || null;
    } catch (error) {
      Logger.error(`GameDAL:getGameById - Failed to get game by id ${id}: ${error}`);
      throw error;
    }
  }

  // Read all games
  async getAllGames(): Promise<IGame[]> {
    try {
      const games = await this.gameModel.findAll();
      return games.map(game => game.toJSON());
    } catch (error) {
      Logger.error(`GameDAL:getAllGames - Failed to get all games: ${error}`);
      throw error;
    }
  }

  // Update a game
  async updateGame(id: number, game: Partial<IGame>): Promise<IGame | null> {
    try {
      const [updated] = await this.gameModel.update(game, {
        where: { id },
        returning: true
      });
      if (updated) {
        const updatedGame = await this.gameModel.findByPk(id);
        return updatedGame?.toJSON() || null;
      }
      return null;
    } catch (error) {
      Logger.error(`GameDAL:updateGame - Failed to update game ${id}: ${error}`);
      throw error;
    }
  }

  // Delete a game
  async deleteGame(id: number): Promise<boolean> {
    try {
      const deleted = await this.gameModel.destroy({
        where: { id }
      });
      if (deleted > 0) {
        Logger.debug(`GameDAL:deleteGame - Game with id ${id} deleted`);
        return true
      }
      else {
        Logger.warn(`GameDAL:deleteGame - Game with id ${id} not found`);
        return false;
      }
    } catch (error) {
      Logger.error(`GameDAL:deleteGame - Failed to delete game ${id}: ${error}`);
      throw error;
    }
  }

  // Get games by player ID
  async getGamesByPlayerId(playerId: number): Promise<IGame[]> {
    try {
      const games = await this.gameModel.findAll({
        where: { playerId }
      });
      return games.map(game => game.toJSON());
    } catch (error) {
      Logger.error(`GameDAL:getGamesByPlayerId - Failed to get games for player ${playerId}: ${error}`);
      throw error;
    }
  }

  // Get top games by score
  async getTopGames(limit: number = 10): Promise<IGame[]> {
    try {
      const games = await this.gameModel.findAll({
        order: [['score', 'DESC']],
        limit
      });
      return games.map(game => game.toJSON());
    } catch (error) {
      Logger.error(`GameDAL:getTopGames - Failed to get top ${limit} games: ${error}`);
      throw error;
    }
  }

  // Game-Enemy relationship methods
  async addEnemyToGame(gameId: number, enemyId: number): Promise<IGameEnemy> {
    try {
      Logger.debug(`GameDAL:addEnemyToGame - Adding enemy ${enemyId} to game ${gameId}`);
      const gameEnemy = await this.gameEnemyModel.create({ gameId, enemyId });
      return gameEnemy.toJSON();
    } catch (error) {
      Logger.error(`GameDAL:addEnemyToGame - Failed to add enemy ${enemyId} to game ${gameId}: ${error}`);
      throw error;
    }
  }

  async getEnemiesForGame(gameId: number): Promise<IGameEnemy[]> {
    try {
      const gameEnemies = await this.gameEnemyModel.findAll({
        where: { gameId }
      });
      return gameEnemies.map(ge => ge.toJSON());
    } catch (error) {
      Logger.error(`GameDAL:getEnemiesForGame - Failed to get enemies for game ${gameId}: ${error}`);
      throw error;
    }
  }

  async removeEnemyFromGame(gameId: number, enemyId: number): Promise<boolean> {
    try {
      const deleted = await this.gameEnemyModel.destroy({
        where: { gameId, enemyId }
      });
      if (deleted > 0) {
        Logger.debug(`GameDAL:removeEnemyFromGame - Enemy ${enemyId} removed from game ${gameId}`);
        return true;
      } else {
        Logger.error(`GameDAL:removeEnemyFromGame - Enemy ${enemyId} not found in game ${gameId}`);
        return false;
      }
    } catch (error) {
      Logger.error(`GameDAL:removeEnemyFromGame - Failed to remove enemy ${enemyId} from game ${gameId}: ${error}`);
      throw error;
    }
  }

  // Game-Loot relationship methods
  async addLootToGame(gameId: number, lootId: number): Promise<IGameLoot> {
    try {
      const gameLoot = await this.gameLootModel.create({ gameId, lootId });
      return gameLoot.toJSON();
    } catch (error) {
      Logger.error(`GameDAL:addLootToGame - Failed to add loot ${lootId} to game ${gameId}: ${error}`);
      throw error;
    }
  }

  async getLootForGame(gameId: number): Promise<IGameLoot[]> {
    try {
      const gameLoot = await this.gameLootModel.findAll({
        where: { gameId }
      });
      return gameLoot.map(gl => gl.toJSON());
    } catch (error) {
      Logger.error(`GameDAL:getLootForGame - Failed to get loot for game ${gameId}: ${error}`);
      throw error;
    }
  }

  async removeLootFromGame(gameId: number, lootId: number): Promise<boolean> {
    try {
      const deleted = await this.gameLootModel.destroy({
        where: { gameId, lootId }
      });
      if (deleted > 0) {
        Logger.debug(`GameDAL:removeLootFromGame - Loot ${lootId} removed from game ${gameId}`);
        return true;
      } else {
        Logger.error(`GameDAL:removeLootFromGame - Loot ${lootId} not found in game ${gameId}`);
        return false;
      }
    } catch (error) {
      Logger.error(`GameDAL:removeLootFromGame - Failed to remove loot ${lootId} from game ${gameId}: ${error}`);
      throw error;
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// Example usage
///////////////////////////////////////////////////////////////////////////////
// import baseDatabase from "./baseDatabase";
// import { characterSequelize } from "../models/character.model";
// import { playerSequelize } from "../models/player.model";
// import { gameSequelize } from "../models/game.model";
// import { enemySequelize } from "../models/enemy.model";
// import { lootSequelize } from "../models/loot.model";
// import { gameEnemySequelize } from "../models/gameEnemy.model";
// import { gameLootSequelize } from "../models/gameLoot.model";
// import { PlayerDAL } from "./player.dal";
// import { EnemyDAL } from "./enemy.dal";
// import { LootDAL } from "./loot.dal";

// async function example() {
//   const lootDb = lootSequelize(baseDatabase);
//   const characterDb = characterSequelize(baseDatabase);
//   const playerDb = playerSequelize(baseDatabase, characterDb);
//   const enemyDb = enemySequelize(baseDatabase, characterDb, lootDb);
//   const gameDb = gameSequelize(baseDatabase, playerDb);
//   const gameEnemyDb = gameEnemySequelize(baseDatabase, gameDb, enemyDb);
//   const gameLootDb = gameLootSequelize(baseDatabase, gameDb, lootDb);

//   const lootDAL = new LootDAL(lootDb);
//   const playerDAL = new PlayerDAL(characterDb, playerDb);
//   const enemyDAL = new EnemyDAL(characterDb, enemyDb);
//   const gameDAL = new GameDAL(gameDb, gameEnemyDb, gameLootDb);

//   // Authenticate and sync database
//   await baseDatabase.authenticate();
//   await baseDatabase.sync({ force: false }); // Create tables if not exists
//   Logger.info('Database connection established');

//   const players = await playerDAL.getAllPlayers();
//   if (players.length === 0) {
//     Logger.error('No players found');
//     return;
//   }
//   const players1 = await playerDAL.getAllPlayers();
//   if (players1.length === 0) {
//     Logger.error('No players found');
//     return;
//   }
//   const player = players[0];

//   // Create a new game
//   const game = await gameDAL.createGame(player.id);
//   Logger.info('Created game:', game);

//   const enemies = await enemyDAL.getAllEnemies();
//   if (enemies.length === 0) {
//     Logger.error('No enemies found');
//     return;
//   }
//   const enemy = enemies[0];

//   // Add enemy to game
//   const gameEnemy = await gameDAL.addEnemyToGame(game.id, enemy.id);
//   Logger.info('Added enemy to game:', gameEnemy);

//   const loot = await lootDAL.getAll();
//   if (loot.length === 0) {
//     Logger.error('No loot found');
//     return;
//   }
//   const lootItem = loot[0];

//   // Add loot to game
//   const gameLoot = await gameDAL.addLootToGame(game.id, lootItem.id);
//   Logger.info('Added loot to game:', gameLoot);

//   // Get enemies for game
//   const gameEnemies = await gameDAL.getEnemiesForGame(game.id);
//   Logger.info('Enemies for game:', gameEnemies);

//   // Get loot for game
//   const gameLootItems = await gameDAL.getLootForGame(game.id);
//   Logger.info('Loot for game:', gameLootItems);

//   // Remove enemy from game
//   const enemyRemoved = await gameDAL.removeEnemyFromGame(game.id, 1);
//   Logger.info('Removed enemy from game:', enemyRemoved);

//   // Remove loot from game
//   const lootRemoved = await gameDAL.removeLootFromGame(game.id, 1);
//   Logger.info('Removed loot from game:', lootRemoved);

//   // Get game by ID
//   const gameById = await gameDAL.getGameById(game.id);
//   Logger.info('Got game by id:', gameById);

//   // Get all games
//   const allGames = await gameDAL.getAllGames();
//   Logger.info('All games:', allGames);

//   // Get games by player ID
//   const playerGames = await gameDAL.getGamesByPlayerId(1);
//   Logger.info('Games for player 1:', playerGames);

//   // Get top games
//   const topGames = await gameDAL.getTopGames(5);
//   Logger.info('Top 5 games:', topGames);
// }
// example();
